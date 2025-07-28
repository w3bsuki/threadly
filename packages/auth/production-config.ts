/**
 * Production authentication configuration utilities
 *
 * This module provides utilities for configuring Clerk authentication
 * in production environments with proper domain handling and security.
 */

import { log } from '@repo/observability/log';

export interface ClerkProductionConfig {
  // Required for all environments
  publishableKey: string;
  secretKey: string;

  // Production domain configuration
  domain?: string;
  isSatellite?: boolean;

  // Webhook configuration
  webhookSecret?: string;

  // URL configuration
  signInUrl?: string;
  signUpUrl?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;

  // Security
  encryptionKey?: string;
}

export function validateClerkConfig(
  config: Partial<ClerkProductionConfig>
): ClerkProductionConfig {
  const errors: string[] = [];

  // Validate required keys
  if (!config.publishableKey) {
    errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required');
  } else if (!config.publishableKey.startsWith('pk_')) {
    errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_');
  }

  if (!config.secretKey) {
    errors.push('CLERK_SECRET_KEY is required');
  } else if (!config.secretKey.startsWith('sk_')) {
    errors.push('CLERK_SECRET_KEY must start with sk_');
  }

  // Validate webhook secret if provided
  if (config.webhookSecret && !config.webhookSecret.startsWith('whsec_')) {
    errors.push('CLERK_WEBHOOK_SECRET must start with whsec_');
  }

  // Validate URLs
  const urlFields = [
    'signInUrl',
    'signUpUrl',
    'afterSignInUrl',
    'afterSignUpUrl',
  ] as const;
  urlFields.forEach((field) => {
    if (config[field] && !config[field]!.startsWith('/')) {
      errors.push(`${field} must start with /`);
    }
  });

  if (errors.length > 0) {
    const errorMessage = `Clerk configuration validation failed:\n${errors.join('\n')}`;
    log.error('Clerk configuration invalid', { errors });
    throw new Error(errorMessage);
  }

  return {
    publishableKey: config.publishableKey!,
    secretKey: config.secretKey!,
    domain: config.domain,
    isSatellite: config.isSatellite,
    webhookSecret: config.webhookSecret,
    signInUrl: config.signInUrl || '/sign-in',
    signUpUrl: config.signUpUrl || '/sign-up',
    afterSignInUrl: config.afterSignInUrl || '/',
    afterSignUpUrl: config.afterSignUpUrl || '/',
    encryptionKey: config.encryptionKey,
  };
}

export function getProductionAuthConfig(): ClerkProductionConfig {
  const config = {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
    domain: process.env.NEXT_PUBLIC_CLERK_DOMAIN,
    isSatellite: process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true',
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET,
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    encryptionKey: process.env.CLERK_ENCRYPTION_KEY,
  };

  return validateClerkConfig(config);
}

export function generateClerkProductionGuide(domains: {
  app: string;
  web: string;
  api: string;
}) {
  return {
    title: 'Clerk Production Configuration Guide',
    steps: [
      {
        step: 1,
        title: 'Create Production Application',
        description:
          'Create a new application in Clerk Dashboard for production',
        actions: [
          'Go to https://dashboard.clerk.com',
          'Click "Add application"',
          'Name it "Threadly Production"',
          'Select appropriate authentication methods',
        ],
      },
      {
        step: 2,
        title: 'Configure Domains',
        description: 'Add your production domains to the Clerk application',
        domains: [
          `${domains.app} (Dashboard app)`,
          `${domains.web} (Marketing site)`,
          `${domains.api} (API endpoints)`,
        ],
        actions: [
          'In Clerk Dashboard, go to Domains',
          'Add each domain as an allowed origin',
          'Set primary domain if using custom domain',
        ],
      },
      {
        step: 3,
        title: 'Environment Variables',
        description:
          'Set these environment variables in your production deployment',
        variables: {
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
            'pk_live_... (from Clerk Dashboard)',
          CLERK_SECRET_KEY: 'sk_live_... (from Clerk Dashboard)',
          CLERK_WEBHOOK_SECRET: 'whsec_... (from webhook settings)',
          NEXT_PUBLIC_CLERK_DOMAIN: domains.app,
          NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
          NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
          NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/',
          NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: '/',
        },
      },
      {
        step: 4,
        title: 'Configure Webhooks',
        description: 'Set up webhooks for user synchronization',
        webhook: {
          url: `${domains.api}/webhooks/auth`,
          events: ['user.created', 'user.updated', 'user.deleted'],
          secret: 'Generate in Clerk Dashboard webhook settings',
        },
      },
      {
        step: 5,
        title: 'Test Authentication Flow',
        description: 'Verify the complete authentication flow works',
        tests: [
          'User registration',
          'Email verification',
          'Sign in/out',
          'Protected route access',
          'User data synchronization',
        ],
      },
    ],
    security: {
      recommendations: [
        'Use separate Clerk applications for dev/staging/production',
        'Enable MFA for admin users',
        'Configure session timeout appropriately',
        'Set up rate limiting for authentication endpoints',
        'Monitor authentication events in Clerk Dashboard',
      ],
    },
  };
}

export function detectEnvironmentType():
  | 'development'
  | 'staging'
  | 'production' {
  const env = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;

  if (env === 'development') return 'development';
  if (vercelEnv === 'preview') return 'staging';
  if (env === 'production' || vercelEnv === 'production') return 'production';

  return 'development';
}

export function validateProductionReadiness(): {
  ready: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    const config = getProductionAuthConfig();

    // Check for production keys
    if (config.publishableKey.includes('test')) {
      issues.push('Using test publishable key in production');
    }

    if (config.secretKey.includes('test')) {
      issues.push('Using test secret key in production');
    }

    // Check webhook configuration
    if (!config.webhookSecret) {
      recommendations.push('Configure webhook secret for user synchronization');
    }

    // Check domain configuration
    if (!config.domain) {
      recommendations.push(
        'Set NEXT_PUBLIC_CLERK_DOMAIN for custom domain support'
      );
    }

    // Check encryption key
    if (!config.encryptionKey) {
      recommendations.push('Set CLERK_ENCRYPTION_KEY for enhanced security');
    }

    return {
      ready: issues.length === 0,
      issues,
      recommendations,
    };
  } catch (error) {
    return {
      ready: false,
      issues: [`Configuration validation failed: ${error.message}`],
      recommendations: [
        'Fix configuration errors before deploying to production',
      ],
    };
  }
}
