import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Security and rate limiting environment configuration
export const keys = () =>
  createEnv({
    server: {
      // Rate limiting configuration
      RATE_LIMIT_ENABLED: z.string().default('true'),
      RATE_LIMIT_WINDOW_MS: z.string().default('60000'), // 1 minute
      RATE_LIMIT_MAX_REQUESTS: z.string().default('60'),
      
      // Security headers
      SECURITY_HEADERS_ENABLED: z.string().default('true'),
      
      // CORS configuration
      CORS_ALLOWED_ORIGINS: z.string().default(''),
      
      // API key for internal services (optional)
      INTERNAL_API_KEY: z.string().optional(),
    },
    client: {},
    runtimeEnv: {
      RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED,
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
      RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
      SECURITY_HEADERS_ENABLED: process.env.SECURITY_HEADERS_ENABLED,
      CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,
      INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
    },
  });