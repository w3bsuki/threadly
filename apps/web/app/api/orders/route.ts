import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { z } from 'zod';
import { log, logError } from '@repo/observability/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })),
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
  paymentMethod: z.object({
    type: z.enum(['card']),
  }),
  shippingMethod: z.enum(['standard', 'express']),
  costs: z.object({
    subtotal: z.number(),
    shipping: z.number(),
    tax: z.number(),
    total: z.number(),
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
    const validatedData = createOrderSchema.parse(body);

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate products and check availability
    const productIds = validatedData.items.map(item => item.productId);
    const products = await database.product.findMany({
      where: {
        id: { in: productIds },
        status: 'AVAILABLE',
      },
      include: {
        seller: true,
      },
    });

    if (products.length !== validatedData.items.length) {
      return NextResponse.json(
        { error: 'One or more products are not available' },
        { status: 400 }
      );
    }

    // Calculate platform fee (5% of subtotal)
    const platformFee = Math.round(validatedData.costs.subtotal * 0.05);

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(validatedData.costs.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: dbUser.id,
        orderType: 'cart_checkout',
        itemCount: validatedData.items.length.toString(),
      },
      application_fee_amount: platformFee * 100, // Platform fee in cents
    });

    // Create orders in database transaction
    const orders = await database.$transaction(async (tx) => {
      const createdOrders = [];

      for (const item of validatedData.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) continue;

        // Calculate individual order amounts
        const itemTotal = item.price * item.quantity;
        const itemShipping = Math.round((validatedData.costs.shipping / validatedData.items.length) * 100) / 100;
        const itemTax = Math.round((validatedData.costs.tax / validatedData.items.length) * 100) / 100;
        const orderTotal = itemTotal + itemShipping + itemTax;

        // Create shipping address first
        const shippingAddress = await tx.address.create({
          data: {
            userId: dbUser.id,
            firstName: dbUser.firstName || '',
            lastName: dbUser.lastName || '',
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

        // Reserve the product
        await tx.product.update({
          where: { id: product.id },
          data: { status: 'RESERVED' },
        });

        createdOrders.push(order);
      }

      return createdOrders;
    });

    log.info('Successfully created cart orders', {
      orderIds: orders.map(o => o.id),
      userId: dbUser.id,
      total: validatedData.costs.total,
    });

    return NextResponse.json({
      success: true,
      paymentIntent: {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      },
      orders: orders.map(order => ({
        id: order.id,
        sellerId: order.sellerId,
        productId: order.productId,
        amount: Number(order.amount),
      })),
    });

  } catch (error) {
    logError('Failed to create cart orders', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}