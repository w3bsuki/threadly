import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import Stripe from 'stripe';
import { env } from '@/env';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: NextRequest) {
  try {
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
        { error: 'No Stripe account connected' },
        { status: 400 }
      );
    }

    // First check if the account is fully onboarded
    const account = await stripe.accounts.retrieve(dbUser.stripeAccountId);
    
    if (!account.charges_enabled || !account.details_submitted) {
      return NextResponse.json(
        { 
          error: 'Stripe account setup not completed',
          message: 'Please complete your Stripe account setup before accessing the dashboard',
          needsOnboarding: true,
        },
        { status: 400 }
      );
    }

    // Create login link for Express Dashboard
    const loginLink = await stripe.accounts.createLoginLink(
      dbUser.stripeAccountId
    );

    return NextResponse.json({
      url: loginLink.url,
      created: loginLink.created,
      expiresAt: new Date(loginLink.created * 1000 + 300000).toISOString(), // Links expire after 5 minutes
    });

  } catch (error) {
    logError('Stripe Connect dashboard error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      // Handle specific error cases
      if (error.code === 'account_invalid') {
        return NextResponse.json(
          { error: 'Invalid Stripe account' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create dashboard link' },
      { status: 500 }
    );
  }
}

// GET method to check if dashboard access is available
export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({
        canAccessDashboard: false,
        reason: 'No Stripe account connected',
      });
    }

    // Check account status
    const account = await stripe.accounts.retrieve(dbUser.stripeAccountId);
    
    const canAccessDashboard = account.charges_enabled && account.details_submitted;

    return NextResponse.json({
      canAccessDashboard,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
      payoutsEnabled: account.payouts_enabled,
      reason: !canAccessDashboard 
        ? 'Account setup not completed' 
        : null,
    });

  } catch (error) {
    logError('Stripe Connect dashboard check error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          canAccessDashboard: false,
          error: error.message 
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { 
        canAccessDashboard: false,
        error: 'Failed to check dashboard access' 
      },
      { status: 500 }
    );
  }
}