import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import Stripe from 'stripe';
import { env } from '@/env';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

// Initialize Stripe - handle missing configuration gracefully
let stripe: Stripe | null = null;

try {
  if (env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    });
  }
} catch (error) {
  logError('[Stripe Status] Failed to initialize Stripe:', error);
}

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
        status: 'not_connected',
        message: 'No Stripe account connected',
        canAcceptPayments: false,
        capabilities: {},
      });
    }

    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json({
        status: 'not_connected',
        message: 'Payment processing is not configured',
        canAcceptPayments: false,
        capabilities: {},
      });
    }

    // Retrieve account details from Stripe
    const account = await stripe.accounts.retrieve(dbUser.stripeAccountId);

    // Check if account is fully onboarded
    const detailsSubmitted = account.details_submitted;
    const chargesEnabled = account.charges_enabled;
    const payoutsEnabled = account.payouts_enabled;

    // Get requirements if any
    const requirementsCount = (account.requirements?.currently_due || []).length;
    const hasPendingVerification = (account.requirements?.pending_verification || []).length > 0;

    // Determine overall status
    let status: 'connected' | 'pending' | 'restricted' | 'disabled';
    if (chargesEnabled && payoutsEnabled) {
      status = 'connected';
    } else if (detailsSubmitted && hasPendingVerification) {
      status = 'pending';
    } else if (detailsSubmitted && !chargesEnabled) {
      status = 'restricted';
    } else {
      status = 'disabled';
    }

    return NextResponse.json({
      status,
      accountId: dbUser.stripeAccountId,
      detailsSubmitted,
      chargesEnabled,
      payoutsEnabled,
      canAcceptPayments: chargesEnabled,
      capabilities: account.capabilities || {},
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
        pendingVerification: account.requirements?.pending_verification || [],
        errors: account.requirements?.errors || [],
        disabled_reason: account.requirements?.disabled_reason,
      },
      businessType: account.business_type,
      country: account.country,
      created: account.created ? new Date(account.created * 1000).toISOString() : null,
      defaultCurrency: account.default_currency,
      email: account.email,
      payoutSchedule: account.settings?.payouts?.schedule,
      requirementsCount,
      hasPendingVerification,
    });

  } catch (error) {
    logError('Stripe Connect status error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      // Handle specific Stripe errors
      if (error.code === 'account_invalid') {
        // Account doesn't exist anymore, clear it from database
        const user = await currentUser();
        if (user) {
          const dbUser = await database.user.findUnique({
            where: { clerkId: user.id },
            select: { id: true },
          });
          
          if (dbUser) {
            await database.user.update({
              where: { id: dbUser.id },
              data: { stripeAccountId: null },
            });
          }
        }

        return NextResponse.json({
          status: 'not_connected',
          message: 'Stripe account no longer exists',
          canAcceptPayments: false,
          capabilities: {},
        });
      }

      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to retrieve account status' },
      { status: 500 }
    );
  }
}