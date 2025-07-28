import { keys as analytics } from '@repo/analytics/keys';
import { keys as auth } from '@repo/auth/keys';
import { keys as cache } from '@repo/cache/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/email/keys';
import { keys as featureFlags } from '@repo/feature-flags/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';
import { keys as search } from '@repo/search/keys';
import { keys as security } from '@repo/security/keys';
import { keys as webhooks } from '@repo/webhooks/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// API app environment configuration - Server-side focused
export const env = createEnv({
  extends: [
    auth(),
    analytics(),
    cache(),
    core(),
    database(),
    email(),
    featureFlags(),
    observability(),
    payments(),
    search(),
    security(),
    webhooks(),
  ],
  server: {
    // API-specific server variables
    PORT:
      process.env.NODE_ENV === 'production'
        ? z.string().optional()
        : z.string().default('3002'),
  },
  client: {
    // No client variables needed for API app
  },
  runtimeEnv: {
    PORT: process.env.PORT || '3002',
  },
});
