import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const aiEnv = createEnv({
  server: {
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    AI_MODEL: z.string().default('gpt-4o-mini'),
    AI_TEMPERATURE: z.coerce.number().default(0.7),
    AI_MAX_TOKENS: z.coerce.number().default(1000),
  },
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    AI_MODEL: process.env.AI_MODEL,
    AI_TEMPERATURE: process.env.AI_TEMPERATURE,
    AI_MAX_TOKENS: process.env.AI_MAX_TOKENS,
  },
});