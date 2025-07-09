import { keys as analytics } from '@repo/analytics/keys';
import { keys as auth } from '@repo/auth/keys';
import { keys as cache } from '@repo/cache/keys';
import { keys as collaboration } from '@repo/collaboration/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/email/keys';
import { keys as flags } from '@repo/feature-flags/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as notifications } from '@repo/notifications/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';
import { keys as realTime } from '@repo/real-time/keys';
import { keys as search } from '@repo/search/keys';
import { keys as security } from '@repo/security/keys';
import { keys as storage } from '@repo/storage/keys';
import { keys as webhooks } from '@repo/webhooks/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Seller dashboard app environment configuration - Full feature set
export const env = createEnv({
  // Add error handler for missing environment variables
  onValidationError: (error) => {
    console.error(
      '❌ Invalid environment variables detected:',
      error.flatten().fieldErrors
    );
    // In production, we want to fail fast
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables - check deployment configuration');
    }
  },
  extends: [
    auth(),
    analytics(),
    cache(),
    collaboration(),
    core(),
    database(),
    email(),
    flags(),
    notifications(),
    observability(),
    payments(),
    realTime(),
    search(),
    security(),
    storage(),
    webhooks(),
  ],
  server: {
    // Seller dashboard server variables
    PORT: process.env.NODE_ENV === 'production' 
      ? z.string().optional()
      : z.string().default('3000'),
    ADMIN_SECRET: z.string().optional(),
  },
  client: {
    // Client-side variables for seller functionality
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NODE_ENV === 'production'
      ? z.string().startsWith('pk_')
      : z.string().startsWith('pk_').optional(),
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === 'production'
      ? z.string().url()
      : z.string().url().optional(),
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
    NEXT_PUBLIC_WEB_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    PORT: process.env.PORT || '3000',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
    ADMIN_SECRET: process.env.ADMIN_SECRET,
  },
});