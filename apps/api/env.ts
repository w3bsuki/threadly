import { keys as auth } from '@repo/auth/auth/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/integrations/email/keys';
import { keys as featureFlags } from '@repo/features/feature-flags/keys';
import { keys as core } from '@repo/api/next-config/src/keys';
import { keys as observability } from '@repo/tooling/observability/keys';
import { keys as payments } from '@repo/integrations/payments/keys';
import { keys as security } from '@repo/auth/security/keys';
import { keys as webhooks } from '@repo/features/webhooks/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// API app environment configuration - Server-side focused
export const env = createEnv({
  extends: [
    auth(),
    core(),
    database(),
    email(),
    featureFlags(),
    observability(),
    payments(),
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
