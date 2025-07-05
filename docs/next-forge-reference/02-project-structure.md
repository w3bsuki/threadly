# Project Structure

## 📁 Turborepo Monorepo Structure

Next-Forge uses a Turborepo monorepo structure that separates applications from shared packages, enabling efficient code sharing and independent deployments.

```
threadly/
├── apps/                      # Application packages
│   ├── web/                   # Customer marketplace (port 3001)
│   ├── app/                   # Seller dashboard (port 3000) 
│   └── api/                   # Backend API services (port 3002)
├── packages/                  # Shared packages
│   ├── auth/                  # Clerk authentication
│   ├── database/              # Prisma schema and client
│   ├── design-system/         # UI components (shadcn/ui)
│   ├── cache/                 # Redis caching (Upstash)
│   ├── validation/            # Zod schemas and validation
│   ├── observability/         # Sentry and logging
│   ├── payments/              # Stripe integration
│   ├── search/                # Algolia search
│   ├── real-time/             # Pusher real-time features
│   ├── security/              # Rate limiting and security
│   ├── analytics/             # PostHog analytics
│   ├── email/                 # Email service integration
│   ├── storage/               # File upload and storage
│   ├── webhooks/              # Webhook handling
│   ├── feature-flags/         # Feature flag management
│   ├── notifications/         # Push notifications
│   ├── collaboration/         # Real-time collaboration
│   ├── cms/                   # Content management
│   ├── ai/                    # AI/ML integrations
│   ├── next-config/           # Shared Next.js configuration
│   ├── typescript-config/     # Shared TypeScript configuration
│   ├── utils/                 # Shared utility functions
│   └── claude-orchestrator/   # AI workflow automation
├── scripts/                   # Build and deployment scripts
├── docs/                      # Documentation
│   ├── next-forge-reference/  # This documentation
│   └── archive/               # Archived documentation
├── .github/                   # GitHub workflows and templates
├── package.json               # Root package.json with workspaces
├── pnpm-workspace.yaml        # pnpm workspace configuration
├── turbo.json                 # Turborepo configuration
├── CLAUDE.md                  # AI assistant instructions
└── README.md                  # Project overview
```

## 🏢 Application Architecture

### apps/web - Customer Marketplace
**Purpose**: Customer-facing e-commerce marketplace where users browse and purchase fashion items.

```
apps/web/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── [locale]/          # Internationalization routes
│   │   │   ├── product/       # Product detail pages
│   │   │   ├── category/      # Category browsing
│   │   │   ├── search/        # Search results
│   │   │   └── checkout/      # Purchase flow
│   │   ├── api/               # API route handlers
│   │   └── global files       # Layout, error, loading
│   ├── components/            # React components
│   │   ├── ui/                # Design system components
│   │   ├── product/           # Product-specific components
│   │   ├── cart/              # Shopping cart components
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utilities and configurations
│   │   ├── hooks/             # Custom React hooks
│   │   ├── stores/            # Zustand state stores
│   │   ├── utils/             # Utility functions
│   │   └── constants/         # Application constants
│   └── styles/                # Global styles and Tailwind
├── public/                    # Static assets
├── env.ts                     # Environment variable validation
├── middleware.ts              # Next.js middleware
├── next.config.ts             # Next.js configuration
└── package.json               # Dependencies and scripts
```

**Key Features**:
- Server-side rendering for SEO
- Internationalization (i18n) support
- Product search and filtering
- Shopping cart and checkout
- User authentication with Clerk
- Performance optimized images and bundles

### apps/app - Seller Dashboard  
**Purpose**: Seller-focused dashboard for managing inventory, orders, and business analytics.

```
apps/app/
├── app/                       # Next.js App Router
│   ├── (authenticated)/       # Protected routes
│   │   ├── selling/           # Product management
│   │   │   ├── listings/      # Product listings
│   │   │   ├── orders/        # Order management
│   │   │   ├── analytics/     # Business analytics
│   │   │   └── new/           # Create new products
│   │   ├── messages/          # Customer communication
│   │   ├── profile/           # Seller profile settings
│   │   └── admin/             # Admin-only features
│   ├── (unauthenticated)/     # Public routes
│   │   ├── sign-in/           # Authentication pages
│   │   └── sign-up/
│   ├── actions/               # Server actions
│   └── api/                   # API routes
├── components/                # React components
├── lib/                       # Utilities and configurations
├── env.ts                     # Environment validation
├── middleware.ts              # Authentication middleware
├── next.config.ts             # Next.js configuration
└── package.json               # Dependencies
```

**Key Features**:
- Real-time order notifications
- Stripe Connect for payments
- Product management workflow
- Analytics and reporting
- Customer communication system
- Mobile-responsive dashboard

### apps/api - Backend Services
**Purpose**: Backend API services handling business logic, data management, and integrations.

```
apps/api/
├── app/
│   ├── api/                   # API route handlers
│   │   ├── v1/                # Versioned API endpoints
│   │   │   ├── products/      # Product CRUD operations
│   │   │   ├── orders/        # Order management
│   │   │   ├── users/         # User management
│   │   │   └── search/        # Search endpoints
│   │   ├── auth/              # Authentication endpoints
│   │   └── webhooks/          # External service webhooks
│   │       ├── stripe/        # Payment webhooks
│   │       └── clerk/         # Auth webhooks
├── lib/                       # Utilities and middleware
│   ├── auth/                  # Authentication helpers
│   ├── validation/            # Input validation
│   ├── search/                # Search initialization
│   └── utils/                 # Utility functions
├── env.ts                     # Environment validation
├── middleware.ts              # API middleware
├── next.config.ts             # Next.js configuration
└── package.json               # Dependencies
```

**Key Features**:
- RESTful API with versioning
- Webhook handling for external services
- Input validation and sanitization
- Rate limiting and security
- Database integration with Prisma
- Caching with Redis

## 📦 Shared Packages Architecture

### Core Infrastructure Packages

#### @repo/database
**Purpose**: Centralized database schema and client management.

```
packages/database/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Database seeding
├── generated/                 # Generated Prisma client
├── keys.ts                    # Environment validation
├── index.ts                   # Database client export
└── package.json
```

**Key Exports**:
- `database` - Prisma client instance
- `type Prisma` - Prisma types for TypeScript
- Database connection utilities

#### @repo/auth
**Purpose**: Authentication and authorization using Clerk.

```
packages/auth/
├── client.ts                  # Client-side auth utilities
├── server.ts                  # Server-side auth utilities
├── keys.ts                    # Environment validation
├── middleware.ts              # Auth middleware
└── types.ts                   # TypeScript definitions
```

**Key Exports**:
- `auth()` - Server-side user authentication
- `useUser()` - Client-side user hook
- `clerkMiddleware` - Next.js middleware
- Authentication component wrappers

#### @repo/design-system
**Purpose**: Shared UI component library based on shadcn/ui.

```
packages/design-system/
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── button.tsx         # Button component
│   │   ├── input.tsx          # Input component
│   │   ├── card.tsx           # Card component
│   │   └── ...
│   ├── forms/                 # Form components
│   ├── layout/                # Layout components
│   └── complex/               # Complex composite components
├── styles/                    # Global styles and themes
├── lib/                       # Component utilities
└── package.json
```

**Key Features**:
- Fully typed component props
- Tailwind CSS integration
- Accessible components (Radix UI)
- Consistent design tokens
- Dark mode support

### Business Logic Packages

#### @repo/validation
**Purpose**: Centralized input validation schemas using Zod.

```
packages/validation/
├── schemas/
│   ├── user.ts                # User validation schemas
│   ├── product.ts             # Product validation schemas
│   ├── order.ts               # Order validation schemas
│   └── common.ts              # Common validation utilities
├── middleware.ts              # Validation middleware
├── sanitize.ts                # Input sanitization
└── validators.ts              # Custom validators
```

#### @repo/payments
**Purpose**: Stripe payment integration and processing.

```
packages/payments/
├── client.ts                  # Client-side Stripe utilities
├── server.ts                  # Server-side Stripe API
├── webhooks.ts                # Webhook processing
├── types.ts                   # Payment type definitions
└── keys.ts                    # Environment validation
```

#### @repo/cache
**Purpose**: Redis caching integration with Upstash.

```
packages/cache/
├── client.ts                  # Redis client setup
├── keys.ts                    # Cache key patterns
├── types.ts                   # Cache type definitions
└── utilities.ts               # Caching utilities
```

### Service Integration Packages

#### @repo/observability
**Purpose**: Monitoring, logging, and error tracking.

```
packages/observability/
├── client.ts                  # Sentry client configuration
├── server.ts                  # Server-side monitoring
├── instrumentation.ts         # Next.js instrumentation
├── next-config.ts             # Next.js config integration
├── error.ts                   # Error handling utilities
└── log.ts                     # Logging utilities
```

#### @repo/search
**Purpose**: Algolia search integration.

```
packages/search/
├── client.ts                  # Algolia client setup
├── indexing.ts                # Search indexing utilities
├── types.ts                   # Search type definitions
└── hooks.ts                   # React search hooks
```

## 🔧 Configuration Architecture

### Environment Variable Pattern
Each package manages its own environment variables using @t3-oss/env-nextjs:

```typescript
// packages/auth/keys.ts
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
    // ...
  },
});
```

Applications then compose these environment configurations:

```typescript
// apps/app/env.ts
export const env = createEnv({
  extends: [
    auth(),
    database(),
    payments(),
    // ... other packages
  ],
  server: {
    // App-specific server vars
  },
  client: {
    // App-specific client vars
  },
});
```

### Package Dependencies
- **No circular dependencies** - Packages form a directed acyclic graph
- **Explicit dependencies** - All dependencies declared in package.json
- **Minimal dependencies** - Each package only depends on what it needs
- **Shared peer dependencies** - Common dependencies hoisted to root

### Build Configuration
Each package has its own build configuration but shares common patterns:

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

## 🚀 Development Workflow

### Adding New Packages
1. Create package directory in `packages/`
2. Add package.json with consistent naming (`@repo/package-name`)
3. Add to pnpm workspace in root `pnpm-workspace.yaml`
4. Export main functionality from `index.ts`
5. Add environment keys if needed in `keys.ts`

### App Development
1. Apps consume packages via `@repo/package-name` imports
2. Apps never import from other apps
3. Shared logic goes in packages, not apps
4. Each app has its own deployment configuration

### Package Development
1. Packages are framework-agnostic when possible
2. Export both TypeScript types and runtime values
3. Provide clear, documented APIs
4. Include proper error handling

This structure enables:
- **Independent deployments** - Each app can be deployed separately
- **Code sharing** - Common logic in shared packages
- **Type safety** - End-to-end TypeScript support
- **Scalability** - Easy to add new apps and packages
- **Team productivity** - Clear boundaries and responsibilities