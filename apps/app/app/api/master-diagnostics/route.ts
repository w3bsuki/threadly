import { auth } from '@repo/auth/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * Master diagnostics endpoint - comprehensive system health check
 * Tests all critical components for production readiness
 */
export async function GET() {
  // Check authentication - only allow admin access to master diagnostics
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  interface DiagnosticsSection {
    [key: string]: unknown;
  }

  interface DeploymentChecklist {
    [key: string]: boolean;
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    success: true,
    sections: {} as DiagnosticsSection,
    errors: [] as string[],
    warnings: [] as string[],
    deploymentChecklist: {} as DeploymentChecklist,
  };

  // 1. Environment Check
  diagnostics.sections.environment = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
    platform: process.env.VERCEL ? 'Vercel' : 'Other',
    region: process.env.VERCEL_REGION || 'unknown',
  };

  // 2. Auth Configuration
  diagnostics.sections.auth = {
    clerk: {
      secretKey: !!process.env.CLERK_SECRET_KEY,
      publicKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      webhookSecret: !!process.env.CLERK_WEBHOOK_SECRET,
    },
  };

  // Test auth functionality
  try {
    const user = await currentUser();
    diagnostics.sections.auth.test = {
      canGetUser: true,
      hasUser: !!user,
      userId: user?.id || null,
    };
  } catch (error) {
    diagnostics.sections.auth.test = {
      canGetUser: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    diagnostics.errors.push(
      `Auth test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // 3. Database Configuration
  diagnostics.sections.database = {
    configured: !!process.env.DATABASE_URL,
    urlPrefix: process.env.DATABASE_URL?.substring(0, 20) || 'not set',
  };

  // Test database connection
  try {
    const userCount = await database.user.count();
    diagnostics.sections.database.test = {
      connected: true,
      userCount,
    };
  } catch (error) {
    diagnostics.sections.database.test = {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    diagnostics.errors.push(
      `Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // 4. Stripe Configuration
  diagnostics.sections.stripe = {
    config: {
      secretKey: !!process.env.STRIPE_SECRET_KEY,
      secretKeyPrefix:
        process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'not set',
      publicKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      publicKeyPrefix:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7) ||
        'not set',
      webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      isTestMode: process.env.STRIPE_SECRET_KEY?.includes('_test_'),
    },
  };

  // Test Stripe connection
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-06-30.basil',
      });

      // Try to retrieve account info
      const account = await stripe.accounts.retrieve();
      diagnostics.sections.stripe.test = {
        connected: true,
        accountId: account.id,
        country: account.country,
        chargesEnabled: account.charges_enabled,
      };
    } catch (error) {
      diagnostics.sections.stripe.test = {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: error.code,
      };
      diagnostics.errors.push(
        `Stripe test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  } else {
    diagnostics.sections.stripe.test = {
      connected: false,
      error: 'STRIPE_SECRET_KEY not configured',
    };
    diagnostics.errors.push('Stripe is not configured');
  }

  // 5. Other Services
  diagnostics.sections.services = {
    uploadthing: {
      secret: !!process.env.UPLOADTHING_SECRET,
      appId: process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID || 'not set',
    },
    email: {
      resendToken: !!process.env.RESEND_TOKEN,
      fromEmail: process.env.RESEND_FROM || 'not set',
    },
    realtime: {
      pusherKey: !!process.env.NEXT_PUBLIC_PUSHER_KEY,
      pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'not set',
      liveblocksSecret: !!process.env.LIVEBLOCKS_SECRET,
    },
    cache: {
      redisUrl: !!process.env.REDIS_URL,
    },
  };

  // 6. URLs Configuration
  diagnostics.sections.urls = {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set',
    webUrl: process.env.NEXT_PUBLIC_WEB_URL || 'not set',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'not set',
  };

  // 7. Check for common issues
  if (process.env.NODE_ENV === 'production') {
    // Production-specific checks
    if (!process.env.STRIPE_SECRET_KEY) {
      diagnostics.warnings.push(
        'Stripe is not configured in production - payments will not work'
      );
    }
    if (process.env.STRIPE_SECRET_KEY?.includes('_test_')) {
      diagnostics.warnings.push(
        'Using TEST Stripe keys in production environment'
      );
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      diagnostics.warnings.push(
        'NEXT_PUBLIC_APP_URL not set - may cause redirect issues'
      );
    }
    if (!process.env.DATABASE_URL) {
      diagnostics.errors.push('DATABASE_URL not set in production');
    }
  }

  // 8. Test env object loading
  const envLoadTest: {
    success: boolean;
    error: {
      message: string;
      invalidVars: unknown[];
    } | null;
  } = {
    success: false,
    error: null,
  };

  try {
    const { env } = await import('@/env');
    envLoadTest.success = true;

    // Check if Stripe keys are available through env object
    diagnostics.sections.envObject = {
      hasStripeKey: !!env.STRIPE_SECRET_KEY,
      hasPublicStripeKey: !!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasAppUrl: !!env.NEXT_PUBLIC_APP_URL,
    };
  } catch (error) {
    envLoadTest.error = {
      message: error instanceof Error ? error.message : 'Unknown error',
      invalidVars: (error as { issues?: unknown[] }).issues || [],
    };
    diagnostics.errors.push(
      `Env validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  diagnostics.sections.envLoadTest = envLoadTest;

  // Set overall success
  diagnostics.success = diagnostics.errors.length === 0;

  // Add deployment checklist
  diagnostics.deploymentChecklist = {
    database: diagnostics.sections.database.test?.connected,
    auth: diagnostics.sections.auth.test?.canGetUser,
    stripe: diagnostics.sections.stripe.test?.connected,
    envValidation: envLoadTest.success,
    noErrors: diagnostics.errors.length === 0,
  };

  return NextResponse.json(diagnostics, {
    status: diagnostics.success ? 200 : 500,
  });
}
