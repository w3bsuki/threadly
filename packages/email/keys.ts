import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      RESEND_FROM: z.string().email().optional(),
      RESEND_TOKEN: z.string().startsWith('re_').optional(),
    },
    runtimeEnv: {
      RESEND_FROM: process.env.RESEND_FROM || undefined,
      RESEND_TOKEN: process.env.RESEND_TOKEN || undefined,
    },
    skipValidation: !!(
      process.env.SKIP_ENV_VALIDATION ||
      process.env.npm_lifecycle_event === 'lint'
    ),
  });
