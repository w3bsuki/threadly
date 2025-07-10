import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { z } from 'zod';
import { log, logError } from '@repo/observability/server';
import { stripe } from '@repo/payments';

const finalizeOrderSchema = z.object({
  paymentIntentId: z.string(),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  billingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }).optional(),
  shippingMethod: z.enum(['standard', 'express']),
  contactInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(10),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = finalizeOrderSchema.parse(body);

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(validatedData.paymentIntentId);

    if (!paymentIntent || paymentIntent.metadata.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Invalid payment intent' }, { status: 400 });
    }

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Parse items and costs from payment intent metadata
    const items = JSON.parse(paymentIntent.metadata.items);
    const costs = JSON.parse(paymentIntent.metadata.costs);

    // Get products
    const productIds = items.map((item: any) => item.productId);
    const products = await database.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        seller: true,
      },
    });

    // Create orders in database transaction
    const orders = await database.$transaction(async (tx) => {
      const createdOrders = [];

      // Update user contact info
      await tx.user.update({
        where: { id: dbUser.id },
        data: {
          firstName: validatedData.contactInfo.firstName,
          lastName: validatedData.contactInfo.lastName,
          email: validatedData.contactInfo.email,
        },
      });

      for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) continue;

        // Calculate individual order amounts
        const itemTotal = item.price * item.quantity;
        const itemShipping = Math.round((costs.shipping / items.length) * 100) / 100;
        const itemTax = Math.round((costs.tax / items.length) * 100) / 100;
        const orderTotal = itemTotal + itemShipping + itemTax;

        // Create shipping address
        const shippingAddress = await tx.address.create({
          data: {
            userId: dbUser.id,
            firstName: validatedData.contactInfo.firstName,
            lastName: validatedData.contactInfo.lastName,
            streetLine1: validatedData.shippingAddress.street,
            city: validatedData.shippingAddress.city,
            state: validatedData.shippingAddress.state,
            zipCode: validatedData.shippingAddress.postalCode,
            country: validatedData.shippingAddress.country,
            type: 'SHIPPING',
          },
        });

        const order = await tx.order.create({
          data: {
            buyerId: dbUser.id,
            sellerId: product.sellerId,
            productId: product.id,
            amount: orderTotal,
            status: 'PENDING',
            shippingAddressId: shippingAddress.id,
          },
        });

        // Create payment record
        await tx.payment.create({
          data: {
            orderId: order.id,
            stripePaymentId: paymentIntent.id,
            amount: orderTotal,
            status: paymentIntent.status,
          },
        });

        // Update product status to SOLD
        await tx.product.update({
          where: { id: product.id },
          data: { status: 'SOLD' },
        });

        createdOrders.push(order);
      }

      return createdOrders;
    });

    log.info('Successfully finalized orders', {
      orderIds: orders.map(o => o.id),
      userId: dbUser.id,
      paymentIntentId: paymentIntent.id,
    });

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        sellerId: order.sellerId,
        productId: order.productId,
        amount: Number(order.amount),
      })),
    });

  } catch (error) {
    logError('Failed to finalize order', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}