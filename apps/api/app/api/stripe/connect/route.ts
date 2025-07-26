import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { logError } from '@repo/observability/server';
import { checkRateLimit, paymentRateLimit } from '@repo/security';
import { type NextRequest, NextResponse } from 'next/server';
import { stripe } from '@repo/payments';
import { env } from '../../../../env';

// POST /api/stripe/connect - Create Stripe Connect onboarding link
export async function POST(request: NextRequest) {
  // Check rate limit first for security
  const rateLimitResult = await checkRateLimit(paymentRateLimit, request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: rateLimitResult.error?.message || 'Rate limit exceeded',
        code: rateLimitResult.error?.code || 'RATE_LIMIT_EXCEEDED',
      },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
  }

  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a Stripe account
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, stripeAccountId: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let accountId = dbUser.stripeAccountId;

    // Create Stripe Connect account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // TODO: Get from user profile
        email: user.emailAddresses[0]?.emailAddress,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId: user.id,
        },
      });

      // Save Stripe account ID to database
      await database.user.update({
        where: { clerkId: user.id },
        data: { stripeAccountId: account.id },
      });

      accountId = account.id;
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${env.NEXT_PUBLIC_APP_URL}/selling/settings`,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/selling/settings?stripe=success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    logError('Stripe Connect error:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe Connect link' },
      { status: 500 }
    );
  }
}

// GET /api/stripe/connect - Get Stripe Connect account status
export async function GET(request: NextRequest) {
  // Check rate limit first for security
  const rateLimitResult = await checkRateLimit(paymentRateLimit, request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: rateLimitResult.error?.message || 'Rate limit exceeded',
        code: rateLimitResult.error?.code || 'RATE_LIMIT_EXCEEDED',
      },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
  }

  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { stripeAccountId: true },
    });

    if (!dbUser?.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        onboardingRequired: true,
      });
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(dbUser.stripeAccountId);

    return NextResponse.json({
      connected: account.charges_enabled && account.payouts_enabled,
      onboardingRequired: !account.details_submitted,
      account: {
        id: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      },
    });
  } catch (error) {
    logError('Stripe Connect status error:', error);
    return NextResponse.json(
      { error: 'Failed to get Stripe Connect status' },
      { status: 500 }
    );
  }
}
