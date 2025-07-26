import { z } from 'zod';

/**
 * Environment variable validation schemas for Threadly
 * Ensures all required environment variables are present and properly formatted
 */

// Helper to create optional URL validation
const optionalUrl = z.string().url().optional().or(z.literal(''));

// Helper to create required URL validation  
const requiredUrl = z.string().url();

// Core application configuration
export const CoreEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: requiredUrl,
  NEXT_PUBLIC_WEB_URL: requiredUrl,
  NEXT_PUBLIC_API_URL: optionalUrl,
  NEXT_PUBLIC_DOCS_URL: optionalUrl,
});

// Database configuration
export const DatabaseEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  DATABASE_AUTH_TOKEN: z.string().optional(),
});

// Authentication (Clerk)
export const ClerkEnvSchema = z.object({
  CLERK_SECRET_KEY: z.string().startsWith('sk_'),
  CLERK_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
  CLERK_ENCRYPTION_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/onboarding'),
});

// Payments (Stripe)
export const StripeEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
});

// File uploads (UploadThing)
export const UploadThingEnvSchema = z.object({
  UPLOADTHING_SECRET: z.string().min(1),
  UPLOADTHING_TOKEN: z.string().min(1),
  UPLOADTHING_URL: optionalUrl,
  NEXT_PUBLIC_UPLOADTHING_APP_ID: z.string().min(1),
});

// Real-time features (Pusher)
export const PusherEnvSchema = z.object({
  PUSHER_APP_ID: z.string().min(1),
  PUSHER_KEY: z.string().min(1),
  PUSHER_SECRET: z.string().min(1),
  PUSHER_CLUSTER: z.string().min(1),
  NEXT_PUBLIC_PUSHER_APP_KEY: z.string().min(1),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().min(1),
});

// Real-time collaboration (Liveblocks)
export const LiveblocksEnvSchema = z.object({
  LIVEBLOCKS_SECRET: z.string().min(1).optional(),
});

// Email service (Resend)
export const ResendEnvSchema = z.object({
  RESEND_API_KEY: z.string().startsWith('re_'),
  RESEND_TOKEN: z.string().startsWith('re_').optional(),
  RESEND_FROM: z.string().email(),
});

// Search (Algolia) - Optional
export const AlgoliaEnvSchema = z.object({
  NEXT_PUBLIC_ALGOLIA_APP_ID: z.string().optional(),
  NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: z.string().optional(),
  NEXT_PUBLIC_ALGOLIA_INDEX_NAME: z.string().optional(),
});

// Caching (Upstash Redis)
export const RedisEnvSchema = z.object({
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().optional(),
});

// Security (Arcjet)
export const SecurityEnvSchema = z.object({
  ARCJET_KEY: z.string().optional(),
  ADMIN_SECRET: z.string().optional(),
  FLAGS_SECRET: z.string().optional(),
});

// Notifications (Knock) - Optional
export const KnockEnvSchema = z.object({
  KNOCK_API_KEY: z.string().optional(),
  KNOCK_SECRET_API_KEY: z.string().optional(),
  KNOCK_FEED_CHANNEL_ID: z.string().optional(),
  NEXT_PUBLIC_KNOCK_API_KEY: z.string().optional(),
  NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: z.string().optional(),
});

// Monitoring & Analytics
export const MonitoringEnvSchema = z.object({
  // Sentry
  SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.enum(['development', 'staging', 'production']).optional(),
  
  // BetterStack
  BETTERSTACK_API_KEY: z.string().optional(),
  BETTERSTACK_URL: z.string().url().optional(),
  
  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().startsWith('G-').optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

// Third-party services
export const ThirdPartyEnvSchema = z.object({
  BASEHUB_TOKEN: z.string().optional(),
  SVIX_TOKEN: z.string().optional(),
  LANGUINE_PROJECT_ID: z.string().optional(),
});

// Build & Development
export const BuildEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  ANALYZE: z.string().transform(val => val === 'true').optional(),
  SKIP_ENV_VALIDATION: z.string().transform(val => val === 'true').optional(),
  CI: z.string().transform(val => val === 'true').optional(),
  VERCEL: z.string().optional(),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  VERCEL_URL: z.string().optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
});

// Feature flags
export const FeatureFlagsEnvSchema = z.object({
  ENABLE_NEW_CHECKOUT: z.string().transform(val => val === 'true').optional(),
  ENABLE_AI_CHAT: z.string().transform(val => val === 'true').optional(),
});

// Testing
export const TestingEnvSchema = z.object({
  PLAYWRIGHT_BASE_URL: z.string().url().optional(),
});

/**
 * Server-side environment variables (includes secrets)
 */
export const ServerEnvSchema = z.object({
  ...CoreEnvSchema.shape,
  ...DatabaseEnvSchema.shape,
  ...ClerkEnvSchema.shape,
  ...StripeEnvSchema.shape,
  ...UploadThingEnvSchema.shape,
  ...PusherEnvSchema.shape,
  ...LiveblocksEnvSchema.shape,
  ...ResendEnvSchema.shape,
  ...AlgoliaEnvSchema.shape,
  ...RedisEnvSchema.shape,
  ...SecurityEnvSchema.shape,
  ...KnockEnvSchema.shape,
  ...MonitoringEnvSchema.shape,
  ...ThirdPartyEnvSchema.shape,
  ...BuildEnvSchema.shape,
  ...FeatureFlagsEnvSchema.shape,
  ...TestingEnvSchema.shape,
});

/**
 * Client-side environment variables (only public keys)
 */
export const ClientEnvSchema = z.object({
  // Core
  NEXT_PUBLIC_APP_URL: CoreEnvSchema.shape.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_WEB_URL: CoreEnvSchema.shape.NEXT_PUBLIC_WEB_URL,
  NEXT_PUBLIC_API_URL: CoreEnvSchema.shape.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_DOCS_URL: CoreEnvSchema.shape.NEXT_PUBLIC_DOCS_URL,
  
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ClerkEnvSchema.shape.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: ClerkEnvSchema.shape.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: ClerkEnvSchema.shape.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: ClerkEnvSchema.shape.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: ClerkEnvSchema.shape.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  
  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: StripeEnvSchema.shape.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  
  // UploadThing
  NEXT_PUBLIC_UPLOADTHING_APP_ID: UploadThingEnvSchema.shape.NEXT_PUBLIC_UPLOADTHING_APP_ID,
  
  // Pusher
  NEXT_PUBLIC_PUSHER_APP_KEY: PusherEnvSchema.shape.NEXT_PUBLIC_PUSHER_APP_KEY,
  NEXT_PUBLIC_PUSHER_CLUSTER: PusherEnvSchema.shape.NEXT_PUBLIC_PUSHER_CLUSTER,
  
  // Algolia
  NEXT_PUBLIC_ALGOLIA_APP_ID: AlgoliaEnvSchema.shape.NEXT_PUBLIC_ALGOLIA_APP_ID,
  NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: AlgoliaEnvSchema.shape.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
  NEXT_PUBLIC_ALGOLIA_INDEX_NAME: AlgoliaEnvSchema.shape.NEXT_PUBLIC_ALGOLIA_INDEX_NAME,
  
  // Knock
  NEXT_PUBLIC_KNOCK_API_KEY: KnockEnvSchema.shape.NEXT_PUBLIC_KNOCK_API_KEY,
  NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: KnockEnvSchema.shape.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID,
  
  // Monitoring
  NEXT_PUBLIC_SENTRY_DSN: MonitoringEnvSchema.shape.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: MonitoringEnvSchema.shape.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: MonitoringEnvSchema.shape.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_POSTHOG_KEY: MonitoringEnvSchema.shape.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: MonitoringEnvSchema.shape.NEXT_PUBLIC_POSTHOG_HOST,
});

// Export types
export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export type ClientEnv = z.infer<typeof ClientEnvSchema>;

/**
 * Validate environment variables
 * @param env - Environment variables to validate
 * @param isServer - Whether to validate server or client environment
 * @returns Validated environment variables
 * @throws ZodError if validation fails
 */
export function validateEnv(env: Record<string, string | undefined>, isServer = true): ServerEnv | ClientEnv {
  const schema = isServer ? ServerEnvSchema : ClientEnvSchema;
  return schema.parse(env);
}

/**
 * Safe environment validation that returns errors instead of throwing
 */
export function safeValidateEnv(env: Record<string, string | undefined>, isServer = true) {
  const schema = isServer ? ServerEnvSchema : ClientEnvSchema;
  return schema.safeParse(env);
}