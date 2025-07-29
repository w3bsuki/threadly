import { vercel } from '@t3-oss/env-core/presets-zod';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    extends: [vercel()],
    server: {
      ANALYZE: z.string().optional(),

      // Added by Vercel
      NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
    },
    client: {
      NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
      NEXT_PUBLIC_WEB_URL: z.string().url().default('http://localhost:3001'),
      NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3002'),
      NEXT_PUBLIC_DOCS_URL: z.string().url().optional(),
    },
    runtimeEnv: {
      ANALYZE: process.env.ANALYZE || undefined,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME || undefined,
      NEXT_PUBLIC_APP_URL:
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      NEXT_PUBLIC_WEB_URL:
        process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001',
      NEXT_PUBLIC_API_URL:
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
      NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL || undefined,
    },
    skipValidation: !!(
      process.env.SKIP_ENV_VALIDATION ||
      process.env.npm_lifecycle_event === 'lint'
    ),
  });
