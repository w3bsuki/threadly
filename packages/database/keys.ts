import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      DATABASE_URL: z.string().url(),
    },
    runtimeEnv: {
      DATABASE_URL: process.env.DATABASE_URL,
    },
    skipValidation: !!(
      process.env.SKIP_ENV_VALIDATION ||
      process.env.npm_lifecycle_event === 'lint'
    ),
  });
