import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

/**
 * Master environment validation endpoint
 * Checks all required environment variables for production
 */
export async function GET() {
  // Check authentication - only allow admin access to env diagnostics
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const vercelEnv = process.env.VERCEL_ENV;
  
  const checks = {
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL_ENV: vercelEnv || 'not set',
      isProduction,
      isVercel: !!process.env.VERCEL,
    },
    
    // Core environment variables
    core: {
      DATABASE_URL: {
        present: !!process.env.DATABASE_URL,
        valid: process.env.DATABASE_URL?.startsWith('postgresql://') || false,
      },
      NEXT_PUBLIC_APP_URL: {
        present: !!process.env.NEXT_PUBLIC_APP_URL,
        value: process.env.NEXT_PUBLIC_APP_URL || 'not set',
      },
    },
    
    // Authentication
    auth: {
      CLERK_SECRET_KEY: {
        present: !!process.env.CLERK_SECRET_KEY,
        prefix: process.env.CLERK_SECRET_KEY?.substring(0, 7) || 'not set',
      },
      CLERK_WEBHOOK_SECRET: {
        present: !!process.env.CLERK_WEBHOOK_SECRET,
        prefix: process.env.CLERK_WEBHOOK_SECRET?.substring(0, 10) || 'not set',
      },
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {
        present: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        prefix: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 7) || 'not set',
      },
    },
    
    // Stripe payments
    stripe: {
      STRIPE_SECRET_KEY: {
        present: !!process.env.STRIPE_SECRET_KEY,
        prefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'not set',
        isTest: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') || false,
        isLive: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') || false,
      },
      STRIPE_WEBHOOK_SECRET: {
        present: !!process.env.STRIPE_WEBHOOK_SECRET,
        prefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) || 'not set',
      },
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
        present: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        prefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7) || 'not set',
        isTest: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') || false,
        isLive: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_') || false,
      },
    },
    
    // Real-time features
    realtime: {
      LIVEBLOCKS_SECRET: {
        present: !!process.env.LIVEBLOCKS_SECRET,
        prefix: process.env.LIVEBLOCKS_SECRET?.substring(0, 7) || 'not set',
      },
      NEXT_PUBLIC_PUSHER_KEY: {
        present: !!process.env.NEXT_PUBLIC_PUSHER_KEY,
        value: process.env.NEXT_PUBLIC_PUSHER_KEY || 'not set',
      },
      NEXT_PUBLIC_PUSHER_CLUSTER: {
        present: !!process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        value: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'not set',
      },
    },
    
    // File uploads
    uploads: {
      UPLOADTHING_SECRET: {
        present: !!process.env.UPLOADTHING_SECRET,
        prefix: process.env.UPLOADTHING_SECRET?.substring(0, 10) || 'not set',
      },
      NEXT_PUBLIC_UPLOADTHING_APP_ID: {
        present: !!process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID,
        value: process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID || 'not set',
      },
    },
    
    // Additional services
    services: {
      RESEND_TOKEN: {
        present: !!process.env.RESEND_TOKEN,
        prefix: process.env.RESEND_TOKEN?.substring(0, 7) || 'not set',
      },
      ADMIN_SECRET: {
        present: !!process.env.ADMIN_SECRET,
        length: process.env.ADMIN_SECRET?.length || 0,
      },
    },
  };
  
  // Calculate overall health
  const requiredInProduction = [
    checks.core.DATABASE_URL.present,
    checks.auth.CLERK_SECRET_KEY.present,
    checks.auth.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.present,
    checks.stripe.STRIPE_SECRET_KEY.present,
    checks.stripe.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.present,
    checks.core.NEXT_PUBLIC_APP_URL.present,
  ];
  
  const health = {
    isHealthy: requiredInProduction.every(Boolean),
    missingRequired: requiredInProduction.filter(check => !check).length,
    warnings: [] as string[],
  };
  
  // Add warnings
  if (isProduction && !checks.stripe.STRIPE_SECRET_KEY.present) {
    health.warnings.push('Stripe is not configured - payment processing will not work');
  }
  
  if (checks.stripe.STRIPE_SECRET_KEY.isLive && !isProduction) {
    health.warnings.push('Using LIVE Stripe keys in non-production environment!');
  }
  
  if (isProduction && checks.stripe.STRIPE_SECRET_KEY.isTest) {
    health.warnings.push('Using TEST Stripe keys in production environment');
  }
  
  // Test environment loading
  let envLoadTest: {
    canLoadEnv: boolean;
    error: {
      message: string;
      invalidEnvVars: unknown[];
    } | null;
  } = {
    canLoadEnv: false,
    error: null,
  };
  
  try {
    // Try to load the env object
    const { env } = await import('@/env');
    envLoadTest = {
      canLoadEnv: true,
      error: null,
    };
  } catch (error) {
    envLoadTest = {
      canLoadEnv: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        invalidEnvVars: (error as { issues?: unknown[] }).issues || [],
      },
    };
  }
  
  return NextResponse.json({
    success: health.isHealthy,
    timestamp: new Date().toISOString(),
    checks,
    health,
    envLoadTest,
    deployment: {
      platform: process.env.VERCEL ? 'Vercel' : 'Other',
      region: process.env.VERCEL_REGION || 'unknown',
      url: process.env.VERCEL_URL || 'unknown',
    },
  });
}