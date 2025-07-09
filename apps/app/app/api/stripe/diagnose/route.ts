import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import Stripe from 'stripe';
import { env } from '@/env';

// Initialize Stripe only if key is available
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
}) : null;

export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV,
    },
    configuration: {
      stripe_configured: !!stripe,
      stripe_key_present: !!env.STRIPE_SECRET_KEY,
      stripe_key_prefix: env.STRIPE_SECRET_KEY?.substring(0, 7) || 'not set',
      app_url: env.NEXT_PUBLIC_APP_URL || 'not set',
      clerk_configured: !!env.CLERK_SECRET_KEY,
      database_configured: !!env.DATABASE_URL,
    },
    errors: [],
  };

  try {
    // Test Clerk authentication
    diagnostics.auth = { step: 'checking' };
    const user = await currentUser();
    diagnostics.auth = {
      authenticated: !!user,
      clerkId: user?.id || null,
      email: user?.emailAddresses?.[0]?.emailAddress || null,
    };

    if (!user) {
      diagnostics.errors.push('User not authenticated');
      return NextResponse.json(diagnostics, { status: 401 });
    }

    // Test database connection and user lookup
    diagnostics.database = { step: 'checking' };
    try {
      const dbUser = await database.user.findUnique({
        where: { clerkId: user.id },
        select: {
          id: true,
          email: true,
          stripeAccountId: true,
          joinedAt: true,
          firstName: true,
          lastName: true,
        },
      });

      diagnostics.database = {
        connected: true,
        user_exists: !!dbUser,
        user_id: dbUser?.id || null,
        stripe_account_id: dbUser?.stripeAccountId || null,
        has_stripe_account: !!dbUser?.stripeAccountId,
      };

      if (!dbUser) {
        diagnostics.errors.push('User not found in database');
      }

      // Test Stripe connection if user has account
      if (stripe && dbUser?.stripeAccountId) {
        diagnostics.stripe = { step: 'checking account' };
        try {
          const account = await stripe.accounts.retrieve(dbUser.stripeAccountId);
          
          diagnostics.stripe = {
            account_retrieved: true,
            account_id: account.id,
            account_type: account.type,
            country: account.country,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
            requirements: {
              currently_due: account.requirements?.currently_due?.length || 0,
              eventually_due: account.requirements?.eventually_due?.length || 0,
              past_due: account.requirements?.past_due?.length || 0,
              pending_verification: account.requirements?.pending_verification?.length || 0,
              errors: account.requirements?.errors?.length || 0,
            },
            created_timestamp: account.created,
            created_date: account.created ? new Date(account.created * 1000).toISOString() : 'N/A',
          };
        } catch (stripeError: any) {
          diagnostics.stripe = {
            account_retrieved: false,
            error: {
              message: stripeError.message,
              type: stripeError.type,
              code: stripeError.code,
              statusCode: stripeError.statusCode,
            },
          };
          diagnostics.errors.push(`Stripe account error: ${stripeError.message}`);
        }
      } else if (!stripe) {
        diagnostics.stripe = { error: 'Stripe not configured' };
        diagnostics.errors.push('Stripe is not configured');
      } else {
        diagnostics.stripe = { error: 'User has no Stripe account' };
      }

      // Test creating a new account link if user has account
      if (stripe && dbUser?.stripeAccountId) {
        diagnostics.account_link = { step: 'testing' };
        try {
          const origin = env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`;
          const accountLink = await stripe.accountLinks.create({
            account: dbUser.stripeAccountId,
            refresh_url: `${origin}/en/selling/onboarding?refresh=true`,
            return_url: `${origin}/en/selling/onboarding?success=true`,
            type: 'account_onboarding',
          });

          diagnostics.account_link = {
            created: true,
            url_length: accountLink.url.length,
            expires_at: accountLink.expires_at,
          };
        } catch (linkError: any) {
          diagnostics.account_link = {
            created: false,
            error: {
              message: linkError.message,
              type: linkError.type,
              code: linkError.code,
            },
          };
          diagnostics.errors.push(`Account link error: ${linkError.message}`);
        }
      }

    } catch (dbError: any) {
      diagnostics.database = {
        connected: false,
        error: dbError.message || 'Database connection failed',
      };
      diagnostics.errors.push(`Database error: ${dbError.message}`);
    }

  } catch (error: any) {
    diagnostics.errors.push(`Unexpected error: ${error.message}`);
    diagnostics.unexpected_error = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5),
    };
  }

  const statusCode = diagnostics.errors.length > 0 ? 500 : 200;
  return NextResponse.json(diagnostics, { status: statusCode });
}