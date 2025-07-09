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
  try {
    // Basic checks
    const checks = {
      stripeConfigured: !!stripe,
      stripeKeyPresent: !!env.STRIPE_SECRET_KEY,
      stripeKeyPrefix: env.STRIPE_SECRET_KEY?.substring(0, 7) || 'not set',
      appUrl: env.NEXT_PUBLIC_APP_URL || 'not set',
    };

    // Check if we can connect to Stripe
    let stripeConnection = {
      connected: false,
      error: null as any,
      accountId: null as any,
    };

    if (stripe) {
      try {
        // Try to retrieve the platform account info
        const account = await stripe.accounts.retrieve();
        stripeConnection = {
          connected: true,
          error: null,
          accountId: account.id,
        };
      } catch (error: any) {
        stripeConnection = {
          connected: false,
          error: {
            message: error.message,
            type: error.type,
            code: error.code,
          },
          accountId: null,
        };
      }
    }

    // Check current user
    const user = await currentUser();
    const userInfo = {
      authenticated: !!user,
      clerkId: user?.id || null,
    };

    // Check database user
    let dbUserInfo = null;
    if (user) {
      const dbUser = await database.user.findUnique({
        where: { clerkId: user.id },
        select: {
          id: true,
          stripeAccountId: true,
        },
      });
      
      dbUserInfo = {
        exists: !!dbUser,
        hasStripeAccount: !!dbUser?.stripeAccountId,
        stripeAccountId: dbUser?.stripeAccountId || null,
      };

      // If user has Stripe account, try to retrieve it
      if (dbUser?.stripeAccountId && stripe) {
        try {
          const connectedAccount = await stripe.accounts.retrieve(dbUser.stripeAccountId);
          dbUserInfo = {
            ...dbUserInfo,
            accountDetails: {
              id: connectedAccount.id,
              country: connectedAccount.country,
              chargesEnabled: connectedAccount.charges_enabled,
              payoutsEnabled: connectedAccount.payouts_enabled,
              detailsSubmitted: connectedAccount.details_submitted,
              type: connectedAccount.type,
            },
          };
        } catch (error: any) {
          dbUserInfo = {
            ...dbUserInfo,
            accountError: {
              message: error.message,
              type: error.type,
            },
          };
        }
      }
    }

    // Test creating a test account link
    let testAccountLink = null;
    if (stripe) {
      try {
        // Create a test account
        const testAccount = await stripe.accounts.create({
          type: 'express',
          country: 'BG',
          email: 'test@example.com',
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        });

        // Create an account link
        const link = await stripe.accountLinks.create({
          account: testAccount.id,
          refresh_url: 'https://example.com/refresh',
          return_url: 'https://example.com/return',
          type: 'account_onboarding',
        });

        testAccountLink = {
          success: true,
          accountId: testAccount.id,
          linkUrl: link.url,
        };

        // Clean up - delete the test account
        await stripe.accounts.del(testAccount.id);
      } catch (error: any) {
        testAccountLink = {
          success: false,
          error: {
            message: error.message,
            type: error.type,
            code: error.code,
          },
        };
      }
    }

    return NextResponse.json({
      success: true,
      checks,
      stripeConnection,
      user: userInfo,
      dbUser: dbUserInfo,
      testAccountLink,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}