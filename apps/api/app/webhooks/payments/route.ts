import { env } from '@/env';
import { analytics } from '@repo/analytics/posthog/server';
import { clerkClient } from '@repo/auth/server';
import { database } from '@repo/database';
import { parseError, logError } from '@repo/observability/server';
import { stripe } from '@repo/payments';
import type { Stripe } from '@repo/payments';
import { webhookRateLimit, checkRateLimit } from '@repo/security';
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

    const { buyerId, type, orderId, productId, productIds, sellerIds } = paymentIntent.metadata;
    
    if (!buyerId) {
      logError('[Payment Intent] Missing buyer ID', {
        paymentIntentId: paymentIntent.id,
        metadata: paymentIntent.metadata
      });
      return;
    }

    // Check if this payment was already processed (idempotency)
    const existingPayment = await database.payment.findFirst({
      where: { stripePaymentId: paymentIntent.id }
    });

    if (existingPayment) {
      // Payment already processed, skip to avoid duplicates
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

    // Handle cart purchases vs single product purchases
    if (type === 'cart' && productIds) {
      // Parse product IDs from JSON
      const parsedProductIds = JSON.parse(productIds) as string[];
      
      // Start a transaction to update all orders and products
      const result = await database.$transaction(async (tx) => {
        // Find all orders for this buyer with these products in PENDING status
        const orders = await tx.order.findMany({
          where: {
            buyerId: dbUser.id,
            productId: { in: parsedProductIds },
            status: 'PENDING',
          },
          include: {
            Product: {
              select: {
                id: true,
                sellerId: true
              }
            }
          }
        });

        if (orders.length === 0) {
          throw new Error('No pending orders found for this payment');
        }

        // Update all orders to PAID status
        const updatedOrders = await Promise.all(
          orders.map(order => 
            tx.order.update({
              where: { id: order.id },
              data: { status: 'PAID' },
            })
          )
        );

        // Mark all products as SOLD
        await Promise.all(
          parsedProductIds.map(productId =>
            tx.product.update({
              where: { id: productId },
              data: { status: 'SOLD' },
            })
          )
        );

        // Create payment records for each order
        const payments = await Promise.all(
          orders.map(order =>
            tx.payment.create({
              data: {
                orderId: order.id,
                stripePaymentId: paymentIntent.id,
                amount: order.amount.toNumber(),
                status: 'completed',
              },
            })
          )
        );

        // Credit seller balances
        const sellerUpdates = new Map<string, number>();
        
        for (const order of orders) {
          const sellerId = order.Product.sellerId;
          const platformFee = order.amount.toNumber() * 0.05; // 5% fee
          const sellerAmount = order.amount.toNumber() - platformFee;
          
          const currentAmount = sellerUpdates.get(sellerId) || 0;
          sellerUpdates.set(sellerId, currentAmount + sellerAmount);
        }
        
        // Update seller balances
        for (const [sellerId, amount] of sellerUpdates) {
          await tx.user.update({
            where: { id: sellerId },
            data: {
              sellerBalance: {
                increment: amount
              }
            }
          });
        }

        return { orders: updatedOrders, payments };
      });
    } else if (orderId && productId) {
      // Single product purchase
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

        // Credit seller balance (minus 5% platform fee)
        const saleAmount = paymentIntent.amount / 100;
        const platformFee = saleAmount * 0.05;
        const sellerAmount = saleAmount - platformFee;
        
        // Get product details to find seller
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { sellerId: true }
        });
        
        if (product) {
          await tx.user.update({
            where: { id: product.sellerId },
            data: {
              sellerBalance: {
                increment: sellerAmount
              }
            }
          });
        }

        return { order, payment };
      });
    } else {
      logError('[Payment Intent] Invalid metadata structure', {
        paymentIntentId: paymentIntent.id,
        metadata: paymentIntent.metadata
      });
      return;
    }

    // Track in analytics
    analytics.capture({
      event: 'Payment Processed',
      distinctId: buyerId, // Use Clerk ID for analytics consistency
      properties: {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        type: type || 'single',
        itemCount: type === 'cart' ? JSON.parse(productIds || '[]').length : 1,
        databaseUserId: dbUser.id,
      },
    });

    // TODO: Send confirmation emails and notifications
    // This should be done asynchronously to not block the webhook response

    // Successfully processed payment intent
  } catch (error) {
    logError('Error processing payment intent', error);
    throw error;
  }
};

export const POST = async (request: Request): Promise<Response> => {
  if (!env.STRIPE_WEBHOOK_SECRET || env.STRIPE_WEBHOOK_SECRET.includes('placeholder')) {
    logError('Stripe webhook secret not properly configured', {
      hasSecret: !!env.STRIPE_WEBHOOK_SECRET,
      secretFormat: env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) + '...',
    });
    return NextResponse.json({ 
      message: 'Webhook endpoint not configured', 
      ok: false 
    }, { status: 503 });
  }

  // Check rate limit first for security
  const rateLimitResult = await checkRateLimit(webhookRateLimit, request);
  if (!rateLimitResult.allowed) {
    logError('Webhook rate limit exceeded', {
      rateLimitResult,
      headers: Object.fromEntries(request.headers.entries())
    });
    
    return NextResponse.json(
      { 
        error: rateLimitResult.error?.message || 'Rate limit exceeded',
        code: rateLimitResult.error?.code || 'RATE_LIMIT_EXCEEDED',
        ok: false 
      },
      { 
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
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
