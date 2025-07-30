// import { keys as auth } from '@repo/auth/auth/keys';
// import { keys as database } from '@repo/database/keys';
// import { keys as email } from '@repo/integrations/email/keys';
// import { keys as flags } from '@repo/features/feature-flags/keys';
// import { keys as core } from '@repo/api-next-config/keys';
// import { keys as notifications } from '@repo/features/notifications/keys';
// import { keys as observability } from '@repo/tooling/observability/keys';
// import { keys as payments } from '@repo/integrations/payments/keys';
// import { keys as security } from '@repo/auth/security/keys';
// import { keys as webhooks } from '@repo/features/webhooks/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Seller dashboard app environment configuration - Full feature set
export const env = createEnv({
  // Add error handler for missing environment variables
  onValidationError: (error) => {
    // In production, we want to fail fast
    throw new Error(
      'Invalid environment variables - check deployment configuration'
    );
  },
  extends: [
    // auth(),
    // core(),
    // database(),
    // email(),
    // flags(),
    // notifications(),
    // observability(),
    // payments(),
    // security(),
    // webhooks(),
  ],
  server: {
    // Seller dashboard server variables
    PORT:
      process.env.NODE_ENV === 'production'
        ? z.string().optional()
        : z.string().default('3000'),
    ADMIN_SECRET: z.string().optional(),
  },
  client: {
    // Client-side variables for seller functionality
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NODE_ENV === 'production'
        ? z.string().startsWith('pk_')
        : z.string().startsWith('pk_').optional(),
    NEXT_PUBLIC_APP_URL:
      process.env.NODE_ENV === 'production'
        ? z.string().url()
        : z.string().url().optional(),
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
    NEXT_PUBLIC_WEB_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    PORT: process.env.PORT || '3000',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
    ADMIN_SECRET: process.env.ADMIN_SECRET,
  },
});
