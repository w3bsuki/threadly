import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      // Make Stripe keys required in production, optional in development
      STRIPE_SECRET_KEY: process.env.NODE_ENV === 'production' 
        ? z.string().startsWith('sk_')
        : z.string().startsWith('sk_').optional(),
      // Webhook secret is optional - only needed for webhook endpoints
      STRIPE_WEBHOOK_SECRET: z.string().min(1).startsWith('whsec_').optional(),
    },
    runtimeEnv: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    },
    skipValidation: !!(
      process.env.SKIP_ENV_VALIDATION ||
      process.env.npm_lifecycle_event === 'lint'
    ),
  });
