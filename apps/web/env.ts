// import { keys as auth } from '@repo/auth/auth/keys';
// import { keys as cms } from '@repo/content/cms/keys';
// import { keys as database } from '@repo/database/keys';
// import { keys as email } from '@repo/integrations/email/keys';
// import { keys as flags } from '@repo/features/feature-flags/keys';
// import { keys as core } from '@repo/api-next-config/keys';
// import { keys as observability } from '@repo/tooling/observability/keys';
// import { keys as payments } from '@repo/integrations/payments/keys';
// import { keys as security } from '@repo/auth/security/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Web app environment configuration - Customer-facing marketplace
export const env = createEnv({
  extends: [
    // auth(),
    // cms(),
    // core(),
    // database(),
    // email(),
    // flags(),
    // observability(),
    // payments(),
    // security(),
  ],
  server: {
    // Web-specific server variables
    PORT:
      process.env.NODE_ENV === 'production'
        ? z.string().optional()
        : z.string().default('3001'),
    ADMIN_SECRET: z.string().optional(),
  },
  client: {
    // Client-side variables for customer marketplace
    NEXT_PUBLIC_APP_URL:
      process.env.NODE_ENV === 'production'
        ? z.string().url()
        : z.string().url().optional(),
    NEXT_PUBLIC_API_URL:
      process.env.NODE_ENV === 'production'
        ? z.string().url()
        : z.string().url().optional(),
  },
  runtimeEnv: {
    PORT: process.env.PORT || '3001',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    ADMIN_SECRET: process.env.ADMIN_SECRET,
  },
});
