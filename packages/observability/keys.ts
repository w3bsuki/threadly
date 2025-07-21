import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      BETTERSTACK_API_KEY: z.string().optional(),
      BETTERSTACK_URL: z.string().url().optional(),

      // Sentry Server Configuration
      SENTRY_DSN: z.string().url().optional(),
      SENTRY_ORG: z.string().optional(),
      SENTRY_PROJECT: z.string().optional(),
      SENTRY_AUTH_TOKEN: z.string().optional(),
      SENTRY_ENVIRONMENT: z.string().optional(),
      SENTRY_RELEASE: z.string().optional(),
    },
    client: {
      // Sentry Client Configuration
      NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
      NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().optional(),
      NEXT_PUBLIC_SENTRY_RELEASE: z.string().optional(),
    },
    runtimeEnv: {
      BETTERSTACK_API_KEY: process.env.BETTERSTACK_API_KEY || undefined,
      BETTERSTACK_URL: process.env.BETTERSTACK_URL || undefined,
      SENTRY_DSN: process.env.SENTRY_DSN || undefined,
      SENTRY_ORG: process.env.SENTRY_ORG || undefined,
      SENTRY_PROJECT: process.env.SENTRY_PROJECT || undefined,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN || undefined,
      SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
      SENTRY_RELEASE: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || undefined,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
      NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
      NEXT_PUBLIC_SENTRY_RELEASE: process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || undefined,
    },
    skipValidation: !!(
      process.env.SKIP_ENV_VALIDATION ||
      process.env.npm_lifecycle_event === 'lint'
    ),
  });
