import { NextResponse } from 'next/server';
import { env } from '@/env';

export async function GET() {
  try {
    // Check if Stripe environment variables are available
    const hasStripeSecret = !!env.STRIPE_SECRET_KEY;
    const hasStripePublishable = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const hasWebhookSecret = !!env.STRIPE_WEBHOOK_SECRET;

    // Try to create a Stripe instance if secret key exists
    let stripeTest = null;
    if (hasStripeSecret) {
      try {
        const Stripe = require('stripe');
        const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
          apiVersion: '2025-05-28.basil',
        });
        
        // Test API call - this will fail if key is invalid
        await stripe.accounts.list({ limit: 1 });
        stripeTest = 'Stripe API connection successful';
      } catch (error) {
        stripeTest = `Stripe API error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      stripe: {
        hasSecretKey: hasStripeSecret,
        hasPublishableKey: hasStripePublishable,
        hasWebhookSecret: hasWebhookSecret,
        secretKeyPrefix: hasStripeSecret ? env.STRIPE_SECRET_KEY?.substring(0, 12) + '...' : 'Not found',
        apiTest: stripeTest,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}