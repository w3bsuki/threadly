import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      // Upstash Redis configuration (recommended for production)
      UPSTASH_REDIS_REST_URL: z.string().url().optional(),
      UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

      // Alternative Redis URL (standard Redis connection)
      REDIS_URL: z.string().url().optional(),

      // Cache configuration
      CACHE_TTL_DEFAULT: z.coerce.number().default(3600), // 1 hour
      CACHE_ENABLED: z.coerce.boolean().default(true),
    },
    client: {},
    runtimeEnv: {
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      REDIS_URL: process.env.REDIS_URL,
      CACHE_TTL_DEFAULT: process.env.CACHE_TTL_DEFAULT || 3600,
      CACHE_ENABLED: process.env.CACHE_ENABLED !== 'false',
    },
    skipValidation: !!(
      process.env.SKIP_ENV_VALIDATION ||
      process.env.npm_lifecycle_event === 'lint'
    ),
  });
