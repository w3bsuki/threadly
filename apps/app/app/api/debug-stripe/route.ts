import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { env } from '@/env';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      hasStripeKey: !!env.STRIPE_SECRET_KEY,
      hasAppUrl: !!env.NEXT_PUBLIC_APP_URL,
      appUrl: env.NEXT_PUBLIC_APP_URL || 'Not set',
      hasDatabase: !!env.DATABASE_URL,
    };

    // Check current user
    const user = await currentUser();
    const userCheck = {
      isAuthenticated: !!user,
      clerkId: user?.id || null,
      email: user?.emailAddresses?.[0]?.emailAddress || null,
    };

    // Check database user if authenticated
    let dbUserCheck = null;
    if (user) {
      const dbUser = await database.user.findUnique({
        where: { clerkId: user.id },
        select: {
          id: true,
          email: true,
          stripeAccountId: true,
          joinedAt: true,
        },
      });
      dbUserCheck = {
        exists: !!dbUser,
        hasStripeAccount: !!dbUser?.stripeAccountId,
        userId: dbUser?.id || null,
        joinedAt: dbUser?.joinedAt || null,
      };
    }

    return NextResponse.json({
      success: true,
      environment: envCheck,
      user: userCheck,
      dbUser: dbUserCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}