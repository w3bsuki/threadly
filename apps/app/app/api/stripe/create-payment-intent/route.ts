import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { paymentRateLimit, checkRateLimit } from '@repo/security';
import Stripe from 'stripe';
import { env } from '@/env';
import { z } from 'zod';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const createPaymentIntentSchema = z.object({
  productId: z.string().optional(), // Optional for cart purchases
  amount: z.number().min(50), // Minimum $0.50
  currency: z.string().default('usd'),
  orderId: z.string().optional(), // Optional for cart purchases
  sellerId: z.string().optional(), // Optional for cart purchases
  orderItems: z.array(z.object({
    productId: z.string(),
    title: z.string(),
    quantity: z.number(),
    price: z.number(),
  })).optional(), // For cart purchases
});

export async function POST(request: NextRequest) {
  try {
    // Check rate limit (payment routes need stricter limits)
    const rateLimitResult = await checkRateLimit(paymentRateLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: rateLimitResult.error?.message || 'Too many payment requests. Please try again later.',
        },
        { 
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, amount, currency, orderId, sellerId, orderItems } = createPaymentIntentSchema.parse(body);

    // Create payment intent configuration
    const paymentIntentData: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        buyerId: user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // Handle cart purchase
    if (orderItems && orderItems.length > 0) {
      // For cart purchases, include the order ID if provided
      paymentIntentData.metadata!.type = 'cart';
      paymentIntentData.metadata!.itemCount = orderItems.length.toString();
      
      // CRITICAL FIX: Store ALL order-related IDs
      if (orderId) {
        paymentIntentData.metadata!.orderId = orderId;
      }
      
      // Store all product IDs and seller IDs for webhook processing
      const productIds = orderItems.map(item => item.productId);
      const uniqueProductIds = [...new Set(productIds)];
      
      // Store as JSON array in metadata (Stripe allows up to 500 chars per value)
      paymentIntentData.metadata!.productIds = JSON.stringify(uniqueProductIds);
      
      // Get unique seller IDs for the products
      const products = await database.product.findMany({
        where: { id: { in: uniqueProductIds } },
        select: { id: true, sellerId: true }
      });
      
      const sellerIds = [...new Set(products.map(p => p.sellerId))];
      paymentIntentData.metadata!.sellerIds = JSON.stringify(sellerIds);
      
      // Calculate platform fee (5% for Threadly)
      const platformFeeAmount = Math.round(amount * 0.05 * 100); // 5% in cents
      paymentIntentData.application_fee_amount = platformFeeAmount;
      
      // For cart purchases, we'll handle seller payouts separately
      // since there might be multiple sellers
    } else if (productId && orderId && sellerId) {
      // Handle single product purchase
      paymentIntentData.metadata!.type = 'single';
      paymentIntentData.metadata!.productId = productId;
      paymentIntentData.metadata!.orderId = orderId;
      paymentIntentData.metadata!.sellerId = sellerId;
      
      // Get seller's Stripe account
      const seller = await database.user.findUnique({
        where: { id: sellerId },
        select: { stripeAccountId: true },
      });

      // Calculate platform fee (5% for Threadly)
      const platformFeeAmount = Math.round(amount * 0.05 * 100); // 5% in cents

      // If seller has connected Stripe account, set up the transfer
      if (seller?.stripeAccountId) {
        paymentIntentData.application_fee_amount = platformFeeAmount;
        paymentIntentData.transfer_data = {
          destination: seller.stripeAccountId,
        };
      }
      // Otherwise, payment goes to platform account (manual payout later)
    } else {
      throw new Error('Invalid payment request');
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    logError('Payment intent creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}