import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import Stripe from 'stripe';
import { env } from '@/env';
import { z } from 'zod';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

const stripe = new Stripe((env as any).STRIPE_SECRET_KEY || 'sk_test_invalid', {
  apiVersion: '2025-05-28.basil',
});

const verifyPaymentSchema = z.object({
  paymentIntentId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    if (!(env as any).STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentIntentId } = verifyPaymentSchema.parse(body);

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json({ error: 'Payment intent not found' }, { status: 404 });
    }

    // Verify the payment belongs to the current user
    if (paymentIntent.metadata.buyerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check payment status
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({
        status: paymentIntent.status,
        error: 'Payment not successful',
      }, { status: 400 });
    }

    // Get the order ID from payment metadata
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      // For cart purchases, we need to find orders by the payment intent
      // Since we're using single product orders, there might be multiple orders for one payment
      const orders = await database.order.findMany({
        where: {
          buyerId: dbUser.id,
          status: 'PENDING',
          // Orders created around the same time as the payment
          createdAt: {
            gte: new Date(paymentIntent.created * 1000 - 60000), // 1 minute before payment
            lte: new Date(paymentIntent.created * 1000 + 60000), // 1 minute after payment
          },
        },
        include: {
          product: {
            include: {
              images: {
                take: 1,
                orderBy: {
                  displayOrder: 'asc',
                },
              },
              seller: true,
            },
          },
          seller: true,
        },
      });

      if (orders.length === 0) {
        return NextResponse.json({ error: 'Orders not found' }, { status: 404 });
      }

      // Update all orders to PAID status
      await database.order.updateMany({
        where: {
          id: { in: orders.map(o => o.id) },
          status: 'PENDING',
        },
        data: { status: 'PAID' },
      });

      // Create payment records for each order
      for (const order of orders) {
        await database.payment.create({
          data: {
            orderId: order.id,
            stripePaymentId: `${paymentIntent.id}_${order.id}`,
            amount: order.amount,
            status: paymentIntent.status,
          },
        });
      }

      // Return the first order with all orders as a virtual property
      const primaryOrder = orders[0];
      return NextResponse.json({
        status: paymentIntent.status,
        order: {
          ...primaryOrder,
          // Virtual properties to match the expected format
          subtotal: orders.reduce((sum, o) => sum + o.amount.toNumber(), 0),
          shippingCost: 9.99, // Default shipping
          tax: orders.reduce((sum, o) => sum + o.amount.toNumber(), 0) * 0.08,
          total: paymentIntent.amount / 100,
          shippingMethod: 'standard',
          shippingFirstName: user.firstName || '',
          shippingLastName: user.lastName || '',
          shippingAddress: '123 Main St', // These would be stored separately in production
          shippingCity: 'City',
          shippingState: 'State',
          shippingZipCode: '12345',
          shippingCountry: 'United States',
          // Transform orders into orderItems format
          orderItems: orders.map(o => ({
            id: o.id,
            productId: o.productId,
            title: o.product.title,
            description: o.product.description || '',
            price: o.product.price.toNumber(),
            quantity: 1,
            condition: o.product.condition,
            product: o.product,
          })),
        },
      });
    }

    // Single order case (direct purchase)
    const order = await database.order.findFirst({
      where: {
        id: orderId,
        buyerId: dbUser.id,
      },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: {
                displayOrder: 'asc',
              },
            },
            seller: true,
          },
        },
        seller: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status to PAID if it's still PENDING
    if (order.status === 'PENDING') {
      await database.order.update({
        where: { id: order.id },
        data: { 
          status: 'PAID',
          // Store the payment confirmation
          payment: {
            create: {
              stripePaymentId: paymentIntent.id,
              amount: paymentIntent.amount / 100, // Convert from cents
              status: paymentIntent.status,
            },
          },
        },
      });

      // Update the order object to reflect the new status
      order.status = 'PAID';
    }

    // Transform single order to match expected format
    const transformedOrder = {
      ...order,
      subtotal: order.amount.toNumber(),
      shippingCost: 0, // Free shipping for single items
      tax: order.amount.toNumber() * 0.08,
      total: order.amount.toNumber() * 1.08,
      shippingMethod: 'standard',
      shippingFirstName: user.firstName || '',
      shippingLastName: user.lastName || '',
      shippingAddress: '123 Main St', // These would be stored separately in production
      shippingCity: 'City',
      shippingState: 'State',
      shippingZipCode: '12345',
      shippingCountry: 'United States',
      orderItems: [{
        id: order.id,
        productId: order.productId,
        title: order.product.title,
        description: order.product.description || '',
        price: order.product.price,
        quantity: 1,
        condition: order.product.condition,
        product: order.product,
      }],
    };

    return NextResponse.json({
      status: paymentIntent.status,
      order: transformedOrder,
    });

  } catch (error) {
    logError('Payment verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: 'Payment verification failed', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}