import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      CLERK_SECRET_KEY: process.env.NODE_ENV === 'production' 
        ? z.string().startsWith('sk_')
        : z.string().startsWith('sk_').optional(),
      CLERK_WEBHOOK_SECRET: process.env.NODE_ENV === 'production'
        ? z.string().min(1).startsWith('whsec_')
        : z.string().min(1).startsWith('whsec_').optional(),
      CLERK_ENCRYPTION_KEY: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NODE_ENV === 'production'
        ? z.string().startsWith('pk_')
        : z.string().startsWith('pk_').optional(),
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/'),
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/'),
      NEXT_PUBLIC_CLERK_DOMAIN: z.string().optional(),
      NEXT_PUBLIC_CLERK_IS_SATELLITE: z.string().optional(),
    },
    runtimeEnv: {
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET || undefined,
      CLERK_ENCRYPTION_KEY: process.env.CLERK_ENCRYPTION_KEY || undefined,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
        process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/',
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
        process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/',
      NEXT_PUBLIC_CLERK_DOMAIN: process.env.NEXT_PUBLIC_CLERK_DOMAIN || undefined,
      NEXT_PUBLIC_CLERK_IS_SATELLITE: process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE || undefined,
    },
    skipValidation: !!(
      process.env.SKIP_ENV_VALIDATION ||
      process.env.npm_lifecycle_event === 'lint'
    ),
  });
