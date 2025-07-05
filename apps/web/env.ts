import { keys as analytics } from '@repo/analytics/keys';
import { keys as auth } from '@repo/auth/keys';
import { keys as cache } from '@repo/cache/keys';
import { keys as cms } from '@repo/cms/keys';
import { keys as email } from '@repo/email/keys';
import { keys as flags } from '@repo/feature-flags/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as rateLimit } from '@repo/rate-limit/keys';
import { keys as search } from '@repo/search/keys';
import { keys as security } from '@repo/security/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Web app environment configuration - Customer-facing marketplace
export const env = createEnv({
  extends: [
    analytics(),
    auth(),
    cache(),
    cms(),
    core(),
    email(),
    flags(),
    observability(),
    rateLimit(),
    search(),
    security(),
  ],
  server: {
    // Web-specific server variables
    PORT: process.env.NODE_ENV === 'production' 
      ? z.string().optional()
      : z.string().default('3001'),
  },
  client: {
    // Client-side variables for customer marketplace
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    PORT: process.env.PORT || '3001',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});