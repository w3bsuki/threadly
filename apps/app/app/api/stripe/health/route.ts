import { NextResponse } from 'next/server';

/**
 * Simple health check for Stripe API routes
 * This ensures the route is accessible in production
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    routes: {
      onboarding: '/api/stripe/connect/onboarding',
      status: '/api/stripe/connect/status',
      dashboard: '/api/stripe/connect/dashboard',
      test: '/api/stripe/test',
      diagnose: '/api/stripe/diagnose',
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasPublicKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    },
  });
}