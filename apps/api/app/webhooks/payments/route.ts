import { env } from '@/env';
import { analytics } from '@repo/analytics/posthog/server';
import { clerkClient } from '@repo/auth/server';
import { database } from '@repo/database';
import { parseError, logError } from '@repo/observability/server';
import { stripe } from '@repo/payments';
import type { Stripe } from '@repo/payments';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

const getUserFromCustomerId = async (customerId: string) => {
  const clerk = await clerkClient();
  const users = await clerk.users.getUserList();

  const user = users.data.find(
    (user) => user.privateMetadata.stripeCustomerId === customerId
  );

  return user;
};

const handleCheckoutSessionCompleted = async (
  data: Stripe.Checkout.Session
) => {
  if (!data.customer) {
    return;
  }

  const customerId =
    typeof data.customer === 'string' ? data.customer : data.customer.id;
  const user = await getUserFromCustomerId(customerId);

  if (!user) {
    return;
  }

  analytics.capture({
    event: 'User Subscribed',
    distinctId: user.id,
  });
};

const handleSubscriptionScheduleCanceled = async (
  data: Stripe.SubscriptionSchedule
) => {
  if (!data.customer) {
    return;
  }

  const customerId =
    typeof data.customer === 'string' ? data.customer : data.customer.id;
  const user = await getUserFromCustomerId(customerId);

  if (!user) {
    return;
  }

  analytics.capture({
    event: 'User Unsubscribed',
    distinctId: user.id,
  });
};

const handlePaymentIntentSucceeded = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  try {
    // Processing payment intent

    // Validate and extract order details from metadata
    if (!paymentIntent.metadata) {
      return;
    }

    const { buyerId, productId, sellerId, orderId } = paymentIntent.metadata;
    
    if (!buyerId || !orderId) {
      logError('[Payment Intent] Missing required metadata', {
        paymentIntentId: paymentIntent.id,
        metadata: paymentIntent.metadata,
        missing: {
          buyerId: !buyerId,
          orderId: !orderId
        }
      });
      return;
    }

    // Get database user from Clerk ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: buyerId },
      select: { id: true }
    });

    if (!dbUser) {
      logError('[Payment Intent] Database user not found', {
        clerkId: buyerId, 
        paymentIntentId: paymentIntent.id 
      });
      return;
    }

    // Start a transaction to update order, product, and create payment
    const result = await database.$transaction(async (tx) => {
      // Update order status to PAID
      const order = await tx.order.update({
        where: { id: orderId },
        data: { 
          status: 'PAID',
        },
      });

      // Mark product as SOLD
      await tx.product.update({
        where: { id: productId },
        data: { 
          status: 'SOLD',
        },
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          stripePaymentId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert from cents
          status: 'completed',
        },
      });

      return { order, payment };
    });

    // Track in analytics
    analytics.capture({
      event: 'Order Paid',
      distinctId: buyerId, // Use Clerk ID for analytics consistency
      properties: {
        orderId: result.order.id,
        amount: paymentIntent.amount / 100,
        productId,
        sellerId,
        databaseUserId: dbUser.id,
      },
    });

    // Successfully processed payment intent
  } catch (error) {
    logError('Error processing payment intent', error);
    throw error;
  }
};

export const POST = async (request: Request): Promise<Response> => {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Not configured', ok: false });
  }

  try {
    const body = await request.text();
    const headerPayload = await headers();
    const signature = headerPayload.get('stripe-signature');

    if (!signature) {
      throw new Error('missing stripe-signature header');
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded': {
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      }
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      }
      case 'subscription_schedule.canceled': {
        await handleSubscriptionScheduleCanceled(event.data.object);
        break;
      }
      default: {
      }
    }

    return NextResponse.json({ result: event, ok: true });
  } catch (error) {
    const message = parseError(error);

    logError('Webhook processing error', error);

    return NextResponse.json(
      {
        message: 'something went wrong',
        ok: false,
      },
      { status: 500 }
    );
  }
};
