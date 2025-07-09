import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import Stripe from 'stripe';
import { env } from '@/env';

// Initialize Stripe only if key is available
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
}) : null;

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Payment processing is not available.' },
        { status: 503 }
      );
    }

    // Authenticate user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true,
        stripeAccountId: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let accountId = dbUser.stripeAccountId;

    // Create new Stripe Connect account if user doesn't have one
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // You may want to make this dynamic based on user location
        email: dbUser.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        individual: {
          email: dbUser.email,
          first_name: dbUser.firstName || undefined,
          last_name: dbUser.lastName || undefined,
        },
        metadata: {
          userId: dbUser.id,
        },
      });

      accountId = account.id;

      // Update user with Stripe account ID
      await database.user.update({
        where: { id: dbUser.id },
        data: { stripeAccountId: accountId },
      });
    }

    // Get the origin from environment or request headers
    // In production, this should be set via NEXT_PUBLIC_APP_URL
    const origin = env.NEXT_PUBLIC_APP_URL || 
                  request.headers.get('origin') || 
                  `https://${request.headers.get('host')}`;
    
    if (!origin) {
      return NextResponse.json(
        { error: 'Unable to determine application origin. Please set NEXT_PUBLIC_APP_URL environment variable.' },
        { status: 500 }
      );
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/selling/onboarding?refresh=true`,
      return_url: `${origin}/selling/onboarding?success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      url: accountLink.url,
      accountId,
    });

  } catch (error) {
    // TODO: Add proper error tracking service

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create onboarding link' },
      { status: 500 }
    );
  }
}

// GET method to refresh an existing onboarding link
export async function GET(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Payment processing is not available.' },
        { status: 503 }
      );
    }

    // Authenticate user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true,
        stripeAccountId: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!dbUser.stripeAccountId) {
      return NextResponse.json(
        { error: 'No Stripe account found. Please start onboarding first.' },
        { status: 400 }
      );
    }

    // Get the origin from environment or request headers
    // In production, this should be set via NEXT_PUBLIC_APP_URL
    const origin = env.NEXT_PUBLIC_APP_URL || 
                  request.headers.get('origin') || 
                  `https://${request.headers.get('host')}`;
    
    if (!origin) {
      return NextResponse.json(
        { error: 'Unable to determine application origin. Please set NEXT_PUBLIC_APP_URL environment variable.' },
        { status: 500 }
      );
    }

    // Create new account link
    const accountLink = await stripe.accountLinks.create({
      account: dbUser.stripeAccountId,
      refresh_url: `${origin}/selling/onboarding?refresh=true`,
      return_url: `${origin}/selling/onboarding?success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      url: accountLink.url,
      accountId: dbUser.stripeAccountId,
    });

  } catch (error) {
    // TODO: Add proper error tracking service

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create onboarding link' },
      { status: 500 }
    );
  }
}