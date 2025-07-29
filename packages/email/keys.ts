import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const emailEnv = createEnv({
  server: {
    EMAIL_PROVIDER: z.enum(['resend', 'sendgrid']).default('resend'),
    RESEND_API_KEY: z.string().optional(),
    SENDGRID_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().email().default('noreply@example.com'),
    EMAIL_REPLY_TO: z.string().email().optional(),
  },
  runtimeEnv: {
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO,
  },
});