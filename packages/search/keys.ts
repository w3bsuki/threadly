import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      ALGOLIA_APP_ID: z.string().min(1).optional(),
      ALGOLIA_ADMIN_API_KEY: z.string().min(1).optional(),
      ALGOLIA_INDEX_NAME: z.string().min(1).default('products').optional(),
    },
    client: {
      NEXT_PUBLIC_ALGOLIA_APP_ID: z.string().min(1).optional(),
      NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: z.string().min(1).optional(),
      NEXT_PUBLIC_ALGOLIA_INDEX_NAME: z
        .string()
        .min(1)
        .default('products')
        .optional(),
    },
    runtimeEnv: {
      ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
      ALGOLIA_ADMIN_API_KEY: process.env.ALGOLIA_ADMIN_API_KEY,
      ALGOLIA_INDEX_NAME: process.env.ALGOLIA_INDEX_NAME,
      NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
      NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY:
        process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
      NEXT_PUBLIC_ALGOLIA_INDEX_NAME:
        process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME,
    },
  });
