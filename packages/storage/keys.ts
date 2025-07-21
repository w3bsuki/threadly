import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      // Vercel Blob Storage (alternative to UploadThing)
      BLOB_READ_WRITE_TOKEN: z.string().optional(),
      
      // UploadThing configuration (primary file storage)
      UPLOADTHING_SECRET: process.env.NODE_ENV === 'production'
        ? z.string().startsWith('sk_')
        : z.string().startsWith('sk_').optional(),
      UPLOADTHING_TOKEN: process.env.NODE_ENV === 'production'
        ? z.string().startsWith('eyJ')
        : z.string().startsWith('eyJ').optional(), // JWT token
    },
    client: {
      NEXT_PUBLIC_UPLOADTHING_APP_ID: process.env.NODE_ENV === 'production'
        ? z.string()
        : z.string().optional(),
    },
    runtimeEnv: {
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
      UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
      UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
      NEXT_PUBLIC_UPLOADTHING_APP_ID: process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID,
    },
    skipValidation: !!(
      process.env.SKIP_ENV_VALIDATION ||
      process.env.npm_lifecycle_event === 'lint'
    ),
  });
