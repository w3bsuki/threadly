import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_POSTHOG_KEY: z.string().startsWith('phc_').optional(),
      NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
      NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().startsWith('G-').optional(),
    },
    runtimeEnv: {
      NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || undefined,
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || undefined,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || undefined,
    },
    skipValidation: !!(
      process.env.SKIP_ENV_VALIDATION ||
      process.env.npm_lifecycle_event === 'lint'
    ),
  });
