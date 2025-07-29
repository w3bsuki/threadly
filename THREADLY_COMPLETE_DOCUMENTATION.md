# 🛍️ Threadly - Complete Project Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technical Architecture](#technical-architecture)
3. [Feature Documentation](#feature-documentation)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Security Implementation](#security-implementation)
7. [Deployment Guide](#deployment-guide)
8. [Testing Strategy](#testing-strategy)
9. [Performance Optimization](#performance-optimization)
10. [Monitoring & Analytics](#monitoring-analytics)

---

## Executive Summary

### Project Overview
Threadly is a modern peer-to-peer fashion marketplace that connects fashion-conscious buyers and sellers. Built with enterprise-grade technology, it offers a seamless, secure, and stylish platform for trading premium fashion items.

### Key Business Metrics
- **Platform Fee**: 5% on all transactions
- **Target Market**: Fashion enthusiasts, vintage collectors, designer resellers
- **Differentiators**: 
  - Premium UI/UX design
  - Real-time chat between buyers/sellers
  - AI-powered search and recommendations
  - Secure payment with escrow protection

### Technical Highlights
- **Performance**: <100KB initial bundle, 95+ Lighthouse score
- **Scale**: Ready for 10,000+ concurrent users
- **Security**: SOC 2 compliant infrastructure, PCI DSS payments
- **Availability**: 99.9% uptime SLA

---

## Technical Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Apps                         │
├─────────────────────────┬───────────────────────────────────┤
│    Web (Marketplace)    │      App (Dashboard)              │
│    - Next.js 15         │      - Next.js 15                │
│    - Public shopping    │      - User management           │
│    - SEO optimized      │      - Seller tools              │
└───────────┬─────────────┴──────────────┬────────────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│                   (tRPC + Next.js)                          │
└───────────┬─────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Core Services                             │
├──────────────┬──────────────┬──────────────┬───────────────┤
│    Auth      │   Payments   │  Real-time   │    Search     │
│   (Clerk)    │   (Stripe)   │   (Pusher)   │  (Algolia)    │
└──────────────┴──────────────┴──────────────┴───────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer                                  │
├──────────────────────┬──────────────────────────────────────┤
│    PostgreSQL        │         Redis                        │
│    (Primary DB)      │      (Caching)                       │
└──────────────────────┴──────────────────────────────────────┘
```

### Monorepo Structure

```
threadly/
├── apps/
│   ├── web/          # Public marketplace (port 3001)
│   ├── app/          # User dashboard (port 3000)
│   ├── api/          # API service (port 3002)
│   ├── docs/         # Documentation site
│   └── storybook/    # Component library (port 3003)
│
├── packages/         # Shared packages
│   ├── database/     # Prisma schemas & client
│   ├── auth/         # Authentication utilities
│   ├── design-system/# UI components
│   ├── payments/     # Stripe integration
│   ├── real-time/    # WebSocket handling
│   └── [23 more packages...]
│
└── tools/           # Build & development tools
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15, React 19 | SSR, RSC, App Router |
| **Styling** | Tailwind CSS, shadcn/ui | Responsive design |
| **State** | Zustand, React Query | Client state management |
| **Backend** | Node.js, tRPC | Type-safe API |
| **Database** | PostgreSQL, Prisma | Data persistence |
| **Cache** | Redis (Upstash) | Performance optimization |
| **Auth** | Clerk | User management |
| **Payments** | Stripe Connect | Marketplace payments |
| **Real-time** | Pusher | WebSocket connections |
| **Search** | Algolia | Fast product search |
| **Files** | UploadThing | Image storage |
| **Monitoring** | Sentry | Error tracking |
| **Analytics** | Vercel Analytics | Usage metrics |
| **Hosting** | Vercel | Edge deployment |

---

## Feature Documentation

### 1. Authentication & User Management

**Implementation**: Clerk integration with custom user profiles

**Features**:
- Social login (Google, Facebook, Twitter)
- Email/password authentication
- Two-factor authentication
- Role-based access (USER, SELLER, ADMIN)
- Profile customization
- Account verification

**Code Location**: 
- `packages/auth/` - Auth utilities
- `apps/web/app/(auth)/` - Auth pages
- `apps/app/app/(dashboard)/profile/` - Profile management

### 2. Product Listings

**Features**:
- Multi-image upload (up to 10 images)
- Category & subcategory selection
- Condition grading (New, Like New, Good, Fair)
- Size charts and measurements
- Brand verification
- Price suggestions based on market data

**Database Schema**:
```prisma
model Product {
  id          String   @id @default(cuid())
  title       String
  description String
  price       Decimal  @db.Decimal(10, 2)
  images      String[]
  category    Category @relation(...)
  condition   Condition
  seller      User     @relation(...)
  // ... more fields
}
```

### 3. Shopping Cart & Checkout

**Features**:
- Persistent cart across sessions
- Guest checkout option
- Multiple payment methods
- Shipping calculator
- Tax calculation
- Order tracking

**Flow**:
1. Add to cart → 2. Review cart → 3. Shipping info → 4. Payment → 5. Confirmation

### 4. Real-time Messaging

**Implementation**: Pusher Channels with presence

**Features**:
- Buyer-seller chat
- Read receipts
- Typing indicators
- Image sharing in chat
- Message history
- Push notifications

**Security**:
- End-to-end encryption for messages
- Automatic profanity filtering
- Report/block functionality

### 5. Search & Discovery

**Algolia Configuration**:
```javascript
{
  searchableAttributes: [
    'title',
    'description',
    'brand.name',
    'category.name'
  ],
  attributesForFaceting: [
    'category',
    'condition',
    'size',
    'color',
    'price_range'
  ],
  customRanking: [
    'desc(popularity)',
    'desc(created_at)'
  ]
}
```

### 6. Payment Processing

**Stripe Connect Flow**:
1. Seller onboarding → Stripe Connect account
2. Buyer payment → Stripe payment intent
3. Order completion → Funds held in escrow
4. Delivery confirmation → Funds released
5. Platform fee (5%) → Automatically deducted

**Security Features**:
- PCI DSS compliance
- 3D Secure authentication
- Fraud detection
- Chargeback protection

---

## API Documentation

### tRPC Router Structure

```typescript
export const appRouter = createTRPCRouter({
  // Authentication
  auth: {
    me: protectedProcedure.query(),
    updateProfile: protectedProcedure.mutation(),
  },
  
  // Products
  products: {
    list: publicProcedure.query(),
    byId: publicProcedure.query(),
    create: protectedProcedure.mutation(),
    update: protectedProcedure.mutation(),
    delete: protectedProcedure.mutation(),
  },
  
  // Cart
  cart: {
    get: protectedProcedure.query(),
    add: protectedProcedure.mutation(),
    remove: protectedProcedure.mutation(),
    clear: protectedProcedure.mutation(),
  },
  
  // Orders
  orders: {
    create: protectedProcedure.mutation(),
    list: protectedProcedure.query(),
    byId: protectedProcedure.query(),
    updateStatus: protectedProcedure.mutation(),
  },
  
  // Messages
  messages: {
    threads: protectedProcedure.query(),
    byThread: protectedProcedure.query(),
    send: protectedProcedure.mutation(),
  },
});
```

### Key Endpoints

#### Products
- `GET /api/trpc/products.list` - List products with filters
- `GET /api/trpc/products.byId` - Get single product
- `POST /api/trpc/products.create` - Create new listing
- `PUT /api/trpc/products.update` - Update listing
- `DELETE /api/trpc/products.delete` - Remove listing

#### Authentication
- `GET /api/trpc/auth.me` - Current user session
- `PUT /api/trpc/auth.updateProfile` - Update profile

#### Cart Operations
- `GET /api/trpc/cart.get` - Get cart items
- `POST /api/trpc/cart.add` - Add to cart
- `DELETE /api/trpc/cart.remove` - Remove from cart

---

## Database Schema

### Core Models

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  username  String?  @unique
  role      Role     @default(USER)
  
  // Profile
  firstName String?
  lastName  String?
  avatar    String?
  bio       String?
  
  // Seller info
  shopName     String?
  shopBanner   String?
  isVerified   Boolean @default(false)
  rating       Float?
  
  // Relations
  products     Product[]
  orders       Order[]
  reviews      Review[]
  messages     Message[]
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id          String   @id @default(cuid())
  title       String
  description String   @db.Text
  price       Decimal  @db.Decimal(10, 2)
  
  // Details
  condition   Condition
  size        String?
  brand       String?
  color       String?
  material    String?
  
  // Media
  images      String[]
  
  // Relations
  seller      User     @relation(...)
  category    Category @relation(...)
  
  // Status
  status      ProductStatus @default(DRAFT)
  views       Int           @default(0)
  likes       Int           @default(0)
  
  // Search
  @@index([title, description])
  @@index([sellerId, status])
  @@index([categoryId])
}

model Order {
  id          String   @id @default(cuid())
  orderNumber String   @unique
  
  // Parties
  buyer       User     @relation(...)
  seller      User     @relation(...)
  
  // Details
  items       OrderItem[]
  subtotal    Decimal  @db.Decimal(10, 2)
  tax         Decimal  @db.Decimal(10, 2)
  shipping    Decimal  @db.Decimal(10, 2)
  total       Decimal  @db.Decimal(10, 2)
  
  // Payment
  stripePaymentId String?
  platformFee     Decimal @db.Decimal(10, 2)
  sellerPayout    Decimal @db.Decimal(10, 2)
  
  // Status
  status      OrderStatus
  
  @@index([buyerId, status])
  @@index([sellerId, status])
}
```

### Database Indexes

60+ indexes optimized for:
- User lookups (clerkId, email, username)
- Product searches (title, description, category)
- Order queries (buyer, seller, status)
- Message threads (participants, timestamps)

---

## Security Implementation

### Authentication & Authorization

```typescript
// Middleware pattern
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.dbUser) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, user: ctx.user, dbUser: ctx.dbUser } });
});

// Role-based access
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.dbUser.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});
```

### Security Headers

```typescript
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': ContentSecurityPolicy,
};
```

### Input Validation

All inputs validated with Zod schemas:
```typescript
const productSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(5000),
  price: z.number().positive().max(99999),
  images: z.array(z.string().url()).min(1).max(10),
  categoryId: z.string().cuid(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
});
```

### Rate Limiting

Implemented with Upstash Redis:
- API routes: 100 requests/minute
- Auth endpoints: 5 requests/minute
- Search: 30 requests/minute
- File uploads: 10 requests/hour

---

## Deployment Guide

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# Payments
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Real-time
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=...

# Search
ALGOLIA_APP_ID=...
ALGOLIA_ADMIN_KEY=...
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=...

# Storage
UPLOADTHING_SECRET=...
UPLOADTHING_APP_ID=...

# Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Monitoring
SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...
```

### Vercel Configuration

```json
{
  "framework": "nextjs",
  "buildCommand": "turbo build",
  "devCommand": "turbo dev",
  "installCommand": "pnpm install",
  "functions": {
    "apps/web/app/api/trpc/[trpc]/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### Database Migrations

```bash
# Development
pnpm db:push

# Production
pnpm db:migrate:deploy

# Rollback
pnpm prisma migrate resolve --rolled-back
```

---

## Testing Strategy

### Test Coverage Requirements

| Component | Current | Target | Priority |
|-----------|---------|--------|----------|
| API Routes | 45% | 80% | High |
| UI Components | 72% | 90% | Medium |
| Business Logic | 68% | 95% | High |
| E2E Flows | 35% | 70% | High |

### Critical Test Paths

1. **Authentication Flow**
   - Sign up → Email verification → Profile setup
   - Sign in → 2FA → Dashboard access
   - Password reset → Email → New password

2. **Purchase Flow**
   - Search → Product view → Add to cart
   - Cart → Checkout → Payment
   - Order confirmation → Tracking

3. **Seller Flow**
   - Create listing → Upload images → Publish
   - Receive order → Ship → Get paid

### E2E Test Implementation

```typescript
test('complete purchase flow', async ({ page }) => {
  // Sign in
  await page.goto('/sign-in');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Search for product
  await page.fill('[placeholder="Search products..."]', 'vintage jacket');
  await page.press('[placeholder="Search products..."]', 'Enter');
  
  // Add to cart
  await page.click('text=Add to Cart');
  
  // Checkout
  await page.goto('/cart');
  await page.click('text=Checkout');
  
  // Complete payment
  await fillStripeForm(page);
  await page.click('text=Place Order');
  
  // Verify success
  await expect(page).toHaveURL(/\/orders\/[a-zA-Z0-9]+/);
});
```

---

## Performance Optimization

### Current Metrics

| Metric | Value | Target |
|--------|-------|--------|
| First Contentful Paint | 0.8s | <1.0s |
| Largest Contentful Paint | 1.9s | <2.5s |
| Time to Interactive | 2.1s | <3.0s |
| Cumulative Layout Shift | 0.02 | <0.1 |
| Bundle Size (initial) | 98KB | <100KB |

### Optimization Strategies

1. **Code Splitting**
   ```typescript
   const ProductDetails = dynamic(() => import('./ProductDetails'), {
     loading: () => <ProductSkeleton />,
   });
   ```

2. **Image Optimization**
   ```typescript
   <Image
     src={product.image}
     alt={product.title}
     width={400}
     height={400}
     placeholder="blur"
     blurDataURL={product.blurHash}
     loading="lazy"
   />
   ```

3. **Database Query Optimization**
   ```prisma
   const products = await prisma.product.findMany({
     select: {
       id: true,
       title: true,
       price: true,
       images: true,
       _count: { select: { likes: true } }
     },
     take: 20,
     cursor: lastId ? { id: lastId } : undefined,
   });
   ```

4. **Caching Strategy**
   - Static pages: 1 hour CDN cache
   - API responses: 5 minute Redis cache
   - User sessions: 24 hour cache
   - Product images: 30 day browser cache

---

## Monitoring & Analytics

### Key Metrics Dashboard

1. **Business Metrics**
   - Daily active users
   - Gross merchandise value
   - Conversion rate
   - Average order value
   - Platform revenue

2. **Technical Metrics**
   - API response times
   - Error rates
   - Database query performance
   - Cache hit rates
   - CDN bandwidth

3. **User Experience Metrics**
   - Page load times
   - Search relevance
   - Cart abandonment rate
   - Message response time

### Alert Configuration

```typescript
// Sentry alerts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Custom alerts
if (errorRate > 0.01) {
  notifyOps('High error rate detected', { rate: errorRate });
}

if (responseTime.p95 > 500) {
  notifyOps('Slow API responses', { p95: responseTime.p95 });
}
```

### Analytics Implementation

```typescript
// Track key events
analytics.track('Product Viewed', {
  productId: product.id,
  category: product.category,
  price: product.price,
});

analytics.track('Order Completed', {
  orderId: order.id,
  total: order.total,
  itemCount: order.items.length,
});
```

---

## Maintenance & Support

### Regular Maintenance Tasks

**Daily**:
- Monitor error rates
- Check payment processing
- Review security alerts

**Weekly**:
- Database backups verification
- Dependency security updates
- Performance report review

**Monthly**:
- Full security audit
- Database optimization
- User feedback review
- Feature usage analytics

### Support Procedures

1. **User Support**
   - In-app help center
   - Email support: support@threadly.com
   - Response time: <24 hours

2. **Seller Support**
   - Dedicated seller dashboard
   - Seller handbook and guides
   - Priority support channel

3. **Technical Support**
   - On-call rotation schedule
   - Incident response playbook
   - Post-mortem process

---

This comprehensive documentation provides everything needed to understand, maintain, and extend the Threadly platform.