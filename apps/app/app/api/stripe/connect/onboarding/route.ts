import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import Stripe from 'stripe';
import { env } from '@/env';

// Initialize Stripe - throw error if not configured in production
let stripe: Stripe | null = null;

try {
  if (env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    });
  } else if (process.env.NODE_ENV === 'production') {
    console.error('[Stripe] STRIPE_SECRET_KEY is not configured in production!');
  }
} catch (error) {
  console.error('[Stripe] Failed to initialize Stripe:', error);
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Stripe Onboarding] Starting onboarding process');
    
    // Check if Stripe is configured
    if (!stripe) {
      console.error('[Stripe Onboarding] Stripe not configured');
      return NextResponse.json(
        { error: 'Stripe is not configured. Payment processing is not available.' },
        { status: 503 }
      );
    }

    // Authenticate user
    const user = await currentUser();
    if (!user) {
      console.error('[Stripe Onboarding] User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Stripe Onboarding] User authenticated:', user.id);

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
      console.error('[Stripe Onboarding] User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let accountId = dbUser.stripeAccountId;

    // Create new Stripe Connect account if user doesn't have one
    if (!accountId) {
      console.log('[Stripe Onboarding] Creating new Stripe account for user:', dbUser.id);
      
      try {
        // Determine country - for now use BG (Bulgaria) as default, can be made dynamic later
        const country = 'BG'; // Supported countries: https://stripe.com/docs/connect/cross-border-payouts
        
        const account = await stripe.accounts.create({
          type: 'express',
          country: country,
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
        console.log('[Stripe Onboarding] Created Stripe account:', accountId);

        // Update user with Stripe account ID
        await database.user.update({
          where: { id: dbUser.id },
          data: { stripeAccountId: accountId },
        });
      } catch (stripeError: any) {
        console.error('[Stripe Onboarding] Failed to create Stripe account:', stripeError);
        return NextResponse.json(
          { 
            error: stripeError.message || 'Failed to create Stripe account',
            code: stripeError.code,
            type: stripeError.type
          },
          { status: 400 }
        );
      }
    }

    // Get the origin from environment or request headers
    // In production, this should be set via NEXT_PUBLIC_APP_URL
    const origin = env.NEXT_PUBLIC_APP_URL || 
                  request.headers.get('origin') || 
                  `https://${request.headers.get('host')}`;
    
    if (!origin) {
      console.error('[Stripe Onboarding] Unable to determine origin');
      return NextResponse.json(
        { error: 'Unable to determine application origin. Please set NEXT_PUBLIC_APP_URL environment variable.' },
        { status: 500 }
      );
    }

    // Extract locale from referer header (the page that made the request)
    const referer = request.headers.get('referer') || '';
    const localeMatch = referer.match(/\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : 'en'; // Default to 'en' if no locale found

    console.log('[Stripe Onboarding] Origin:', origin, 'Locale:', locale);

    // Create account link for onboarding with locale in URL
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/${locale}/selling/onboarding?refresh=true`,
        return_url: `${origin}/${locale}/selling/onboarding?success=true`,
        type: 'account_onboarding',
      });

      console.log('[Stripe Onboarding] Created account link successfully');
      return NextResponse.json({
        url: accountLink.url,
        accountId,
      });
    } catch (linkError: any) {
      console.error('[Stripe Onboarding] Failed to create account link:', linkError);
      return NextResponse.json(
        { 
          error: linkError.message || 'Failed to create onboarding link',
          code: linkError.code,
          type: linkError.type
        },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('[Stripe Onboarding] Unexpected error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          type: error.type
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to create onboarding link',
        details: error.toString()
      },
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

    // Extract locale from referer header
    const referer = request.headers.get('referer') || '';
    const localeMatch = referer.match(/\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : 'en';

    // Create new account link with locale
    const accountLink = await stripe.accountLinks.create({
      account: dbUser.stripeAccountId,
      refresh_url: `${origin}/${locale}/selling/onboarding?refresh=true`,
      return_url: `${origin}/${locale}/selling/onboarding?success=true`,
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