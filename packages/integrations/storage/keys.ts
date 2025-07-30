import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const storageEnv = createEnv({
  server: {
    STORAGE_PROVIDER: z.enum(['s3', 'uploadthing']).default('uploadthing'),
    AWS_REGION: z.string().default('us-east-1'),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_S3_BUCKET: z.string().optional(),
    UPLOADTHING_SECRET: z.string().optional(),
    UPLOADTHING_APP_ID: z.string().optional(),
    MAX_FILE_SIZE: z.coerce.number().default(10 * 1024 * 1024), // 10MB
  },
  runtimeEnv: {
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
  },
});