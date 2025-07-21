# Environment Variables

## 🌍 Environment Management Philosophy

Next-Forge uses **@t3-oss/env-nextjs** for type-safe, runtime-validated environment variables. This ensures that:

- Environment variables are validated at startup
- TypeScript provides autocomplete and type checking
- Missing or invalid environment variables cause clear error messages
- Different validation rules for development vs production

## 🏗️ Architecture Overview

### Modular Environment Configuration

Each package manages its own environment variables in a `keys.ts` file:

```typescript
// packages/auth/keys.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () => createEnv({
  server: {
    CLERK_SECRET_KEY: z.string().startsWith('sk_'),
    CLERK_WEBHOOK_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  },
  runtimeEnv: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
});
```

### Application Environment Composition

Applications compose multiple package environments:

```typescript
// apps/app/env.ts
import { keys as auth } from '@repo/auth/keys';
import { keys as database } from '@repo/database/keys';
import { keys as payments } from '@repo/payments/keys';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  extends: [
    auth(),
    database(), 
    payments(),
    // ... other packages
  ],
  server: {
    // App-specific server variables
    PORT: z.string().default('3000'),
  },
  client: {
    // App-specific client variables
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    PORT: process.env.PORT,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
```

## 📦 Package Environment Patterns

### Authentication Package (@repo/auth)

```typescript
// packages/auth/keys.ts
export const keys = () => createEnv({
  server: {
    CLERK_SECRET_KEY: process.env.NODE_ENV === 'production' 
      ? z.string().startsWith('sk_')
      : z.string().startsWith('sk_').optional(),
    CLERK_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
    CLERK_ENCRYPTION_KEY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NODE_ENV === 'production'
      ? z.string().startsWith('pk_')
      : z.string().startsWith('pk_').optional(),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/'),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/'),
  },
  runtimeEnv: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    CLERK_ENCRYPTION_KEY: process.env.CLERK_ENCRYPTION_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  },
});
```

### Database Package (@repo/database)

```typescript
// packages/database/keys.ts
export const keys = () => createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),
    DATABASE_AUTH_TOKEN: z.string().optional(),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
  },
});
```

### Payments Package (@repo/payments)

```typescript
// packages/payments/keys.ts
export const keys = () => createEnv({
  server: {
    STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
  },
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
  },
  runtimeEnv: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
});
```

### Observability Package (@repo/observability)

```typescript
// packages/observability/keys.ts
export const keys = () => createEnv({
  server: {
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    BETTERSTACK_API_KEY: z.string().optional(),
    BETTERSTACK_URL: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().optional(),
  },
  runtimeEnv: {
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    BETTERSTACK_API_KEY: process.env.BETTERSTACK_API_KEY,
    BETTERSTACK_URL: process.env.BETTERSTACK_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  },
});
```

## 🎯 Application-Specific Environment Configurations

### API App (apps/api/env.ts)
**Server-focused configuration** - Handles backend services and integrations.

```typescript
export const env = createEnv({
  extends: [
    auth(),           // Authentication with Clerk
    analytics(),      // PostHog analytics  
    cache(),          // Redis caching
    core(),           // Next.js core configuration
    database(),       // PostgreSQL database
    email(),          // Email service integration
    featureFlags(),   // Feature flag management
    observability(),  // Sentry and logging
    payments(),       // Stripe payments
    search(),         // Algolia search
    security(),       // Rate limiting and security
    webhooks(),       // Webhook handling
  ],
  server: {
    PORT: z.string().default('3002'),
  },
  client: {},
  runtimeEnv: {
    PORT: process.env.PORT || '3002',
  },
});
```

### Web App (apps/web/env.ts)
**Customer-focused configuration** - Public marketplace with client-side features.

```typescript
export const env = createEnv({
  extends: [
    analytics(),      // Customer behavior tracking
    auth(),           // User authentication
    cache(),          // Performance caching
    cms(),            // Content management
    core(),           // Next.js configuration
    email(),          // Contact forms and notifications
    flags(),          // Feature flags for A/B testing
    observability(),  // Error tracking and monitoring
    rateLimit(),      // API protection
    search(),         // Product search
    security(),       // Client-side security
  ],
  server: {
    PORT: z.string().default('3001'),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    PORT: process.env.PORT || '3001',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
```

### Seller Dashboard (apps/app/env.ts)
**Full-featured configuration** - Comprehensive seller tools and business features.

```typescript
export const env = createEnv({
  extends: [
    auth(),           // Seller authentication
    analytics(),      // Business analytics
    cache(),          // Performance optimization
    collaboration(),  // Seller communication
    core(),           // Next.js configuration
    database(),       // Seller data access
    email(),          // Business notifications
    flags(),          // Seller feature flags
    notifications(),  // Real-time notifications
    observability(),  // Business monitoring
    payments(),       // Stripe Connect for sellers
    realTime(),       // Live updates and chat
    search(),         // Product management search
    security(),       // Seller account security
    storage(),        // File uploads and management
    webhooks(),       // Payment and auth webhooks
  ],
  server: {
    PORT: z.string().default('3000'),
  },
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
    NEXT_PUBLIC_WEB_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    PORT: process.env.PORT || '3000',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
  },
});
```

## 🔧 Usage Patterns

### In Server Components and API Routes

```typescript
import { env } from '@/env';

export async function GET() {
  // TypeScript knows these are defined and validated
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const database = new PrismaClient({ 
    datasources: { db: { url: env.DATABASE_URL } }
  });
  
  // ...
}
```

### In Client Components

```typescript
import { env } from '@/env';

export function CheckoutButton() {
  const stripe = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  
  // ...
}
```

### Conditional Validation

```typescript
// Different rules for production vs development
export const keys = () => createEnv({
  server: {
    REQUIRED_IN_PROD: process.env.NODE_ENV === 'production'
      ? z.string().min(1)           // Required in production
      : z.string().optional(),      // Optional in development
  },
  // ...
});
```

## 🚦 Validation Rules

### Common Validation Patterns

```typescript
// URL validation
DATABASE_URL: z.string().url(),

// API key patterns
STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_'),

// Webhook secrets
STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

// Optional with defaults
PORT: z.string().default('3000'),
NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

// Conditional requirements
REQUIRED_IN_PROD: process.env.NODE_ENV === 'production' 
  ? z.string().min(1) 
  : z.string().optional(),
```

### Skip Validation

```typescript
export const keys = () => createEnv({
  // ... configuration
  skipValidation: !!(
    process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === 'lint'
  ),
});
```

## 📁 Environment File Structure

### Development Environment Files

```
.env.local                     # Local development overrides (gitignored)
.env.example                   # Template for required variables
apps/web/.env.example          # Web app specific template
apps/app/.env.example          # Seller dashboard template  
apps/api/.env.example          # API app template
```

### Production Environment Variables

Set directly in deployment platform (Vercel, etc.):

```bash
# Authentication
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Monitoring
SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=sntryu_...

# Search
ALGOLIA_APPLICATION_ID=...
ALGOLIA_ADMIN_API_KEY=...

# Cache
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

## 🔒 Security Best Practices

### Server vs Client Variables

- **Server variables** - Never sent to browser, validated at runtime
- **Client variables** - Prefixed with `NEXT_PUBLIC_`, included in bundle
- **Sensitive data** - Always server-side only

### Validation Benefits

- **Runtime safety** - App won't start with invalid configuration
- **Type safety** - TypeScript autocomplete and validation
- **Clear errors** - Descriptive error messages for missing variables
- **Documentation** - Schema serves as documentation

### Environment Isolation

- **Development** - Relaxed validation, optional keys
- **Production** - Strict validation, required keys
- **Testing** - Separate test environment configuration

This environment variable architecture ensures type safety, validation, and maintainability across the entire Next-Forge application.