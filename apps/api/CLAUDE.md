# 🔌 API App (Backend Services)

**Claude Agent Context for Threadly API Application**

---

## 📋 App Overview
This is the **backend API service** powering the Threadly marketplace. Handles authentication, payments, data management, and business logic. Built with Next.js 15 API routes, Prisma, and PostgreSQL.

## 🏗️ Architecture
```
apps/api/
├── app/
│   ├── api/          # API route handlers
│   │   ├── auth/     # Authentication endpoints
│   │   ├── products/ # Product CRUD operations
│   │   ├── users/    # User management
│   │   ├── orders/   # Order processing
│   │   └── webhooks/ # External service webhooks
├── lib/              # Utilities and middleware
├── types/            # TypeScript definitions
└── package.json      # Dependencies and scripts
```

## 🧠 Agent Instructions

### When Working in This Directory:
1. **You are working on the BACKEND API service**
2. **Security is paramount** - Validate all inputs, sanitize data
3. **Performance matters** - Optimize database queries and caching
4. **Follow REST/GraphQL conventions** - Consistent API design

### Key Principles:
- **Security first** - Authentication, authorization, input validation
- **Data integrity** - Proper validation and error handling
- **Scalability** - Efficient queries and caching strategies
- **Observability** - Comprehensive logging and monitoring

## 🛠️ Development Commands

```bash
# Development
pnpm dev                    # Start API server on :3001
pnpm build                  # Production build
pnpm start                  # Start production server
pnpm lint                   # ESLint check
pnpm lint:fix               # Auto-fix linting issues
pnpm typecheck              # TypeScript validation

# Database (from root)
pnpm db:push                # Push schema changes
pnpm db:migrate             # Create and run migrations
pnpm db:studio              # Database browser
pnpm db:seed                # Seed test data
pnpm db:reset               # Reset database

# Testing
pnpm test                   # Run API tests
pnpm test:integration       # Integration tests
pnpm test:coverage          # Coverage report
```

## 🎯 Core API Routes

### Authentication (`/api/auth`)
```typescript
POST   /api/auth/signup          # User registration
POST   /api/auth/signin          # User login
POST   /api/auth/refresh         # Refresh tokens
DELETE /api/auth/signout         # Logout
```

### Products (`/api/products`)
```typescript
GET    /api/products             # List products (public)
GET    /api/products/[id]        # Get product details
POST   /api/products             # Create product (sellers only)
PUT    /api/products/[id]        # Update product (owner only)
DELETE /api/products/[id]        # Delete product (owner only)
```

### Orders (`/api/orders`)
```typescript
GET    /api/orders               # User's orders
POST   /api/orders               # Create order
GET    /api/orders/[id]          # Order details
PUT    /api/orders/[id]/status   # Update order status (seller)
```

### Users (`/api/users`)
```typescript
GET    /api/users/profile        # Current user profile
PUT    /api/users/profile        # Update profile
GET    /api/users/[id]           # Public user info
POST   /api/users/favorites      # Add to favorites
```

### Webhooks (`/api/webhooks`)
```typescript
POST   /api/webhooks/stripe      # Stripe payment events
POST   /api/webhooks/clerk       # Clerk auth events
```

## 🗄️ Database Access

```typescript
// Using Prisma ORM
import { database } from '@repo/database';

// Optimized queries with proper relations
const products = await database.product.findMany({
  include: {
    images: { orderBy: { displayOrder: 'asc' } },
    seller: { select: { id: true, firstName: true } },
    _count: { select: { favorites: true } }
  },
  where: { status: 'ACTIVE' },
  orderBy: { createdAt: 'desc' },
  take: 20
});

// Always use transactions for related operations
await database.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });
  await tx.product.update({
    where: { id: productId },
    data: { quantity: { decrement: 1 } }
  });
});
```

## 🔐 Authentication & Authorization

```typescript
// Clerk integration
import { auth } from '@clerk/nextjs';

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // User is authenticated
}

// Role-based authorization
const user = await database.user.findUnique({
  where: { clerkId: userId },
  select: { role: true }
});

if (user?.role !== 'SELLER') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

## 💳 Payment Processing

```typescript
// Stripe integration
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: totalAmount,
  currency: 'usd',
  metadata: {
    orderId: order.id,
    buyerId: user.id
  }
});

// Handle webhooks securely
const sig = headers().get('stripe-signature')!;
const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
```

## 📊 Caching Strategy

```typescript
// Redis caching with Upstash
import { getCacheService } from '@repo/cache';

const cache = getCacheService({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache expensive queries
const products = await cache.remember(
  'products:featured',
  async () => {
    return database.product.findMany({ where: { featured: true } });
  },
  300 // 5 minute cache
);
```

## 🔍 Input Validation

```typescript
// Zod schemas for validation
import { z } from 'zod';

const createProductSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  price: z.number().positive().max(10000),
  categoryId: z.string().uuid(),
  images: z.array(z.string().url()).min(1).max(10)
});

// Validate in route handlers
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  try {
    const data = createProductSchema.parse(body);
    // Process validated data
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid input', details: error.issues },
      { status: 400 }
    );
  }
}
```

## 📝 Error Handling

```typescript
// Standardized error responses
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
  }
}

// Global error handler
function handleAPIError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Resource already exists' },
        { status: 409 }
      );
    }
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## 📊 Logging & Monitoring

```typescript
// Structured logging
import { logger } from '@/lib/logger';

logger.info('Order created', {
  orderId: order.id,
  userId: user.id,
  amount: order.total,
  paymentMethod: 'stripe'
});

// Performance monitoring
const startTime = Date.now();
const result = await expensiveOperation();
const duration = Date.now() - startTime;

logger.info('Operation completed', {
  operation: 'product_search',
  duration,
  resultCount: result.length
});
```

## 🧪 Testing Strategy

```typescript
// API route testing
import { createMocks } from 'node-mocks-http';

describe('/api/products', () => {
  test('GET returns products list', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.products).toBeDefined();
  });
});

// Database integration tests
describe('Product service', () => {
  beforeEach(async () => {
    await database.product.deleteMany();
  });
  
  test('creates product with images', async () => {
    const product = await createProduct(validProductData);
    expect(product.id).toBeDefined();
  });
});
```

## 🔄 Rate Limiting

```typescript
// Rate limiting middleware
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, {
    limit: 10, // 10 requests
    window: 60 // per minute
  });
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  // Process request
}
```

## ⚠️ Security Checklist

- [ ] **Input validation** - All user inputs validated with Zod
- [ ] **Authentication** - JWT tokens validated on protected routes
- [ ] **Authorization** - Role-based access control implemented
- [ ] **SQL injection prevention** - Using Prisma ORM
- [ ] **Rate limiting** - API endpoints protected
- [ ] **CORS configuration** - Properly configured for web app
- [ ] **Environment variables** - Secrets not in code
- [ ] **Error messages** - Don't leak sensitive information

## 🚀 Performance Guidelines

1. **Database Optimization**
   - Use proper indexes
   - Optimize N+1 queries with `include`
   - Use `select` to limit fields
   - Implement pagination

2. **Caching Strategy**
   - Cache expensive queries
   - Use appropriate TTL values
   - Implement cache invalidation

3. **Response Optimization**
   - Compress responses
   - Use CDN for static assets
   - Implement proper HTTP caching headers

## 🌍 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
CLERK_SECRET_KEY="..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."

# Payments
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."

# Cache
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# Monitoring
SENTRY_DSN="..."
```

## 📞 Getting Help

1. **Orchestrator Communication**
   - Check `../../../AGENT_COMM.md` for messages
   - Update progress in `../../../PROGRESS.md`
   - Report blockers in `../../../BLOCKERS.md`

2. **Other Teams**
   - Web team: Working in `apps/web/`
   - Mobile team: Working in `apps/app/`
   - Database: Schema in `packages/database/`

3. **Resources**
   - Database schema: `packages/database/schema.prisma`
   - Shared types: `packages/shared-types/`
   - Root project docs: `CLAUDE.md` (parent directory)

---

## 🎯 Current Priority Areas

*This section is updated by the orchestrator based on current tasks*

- [ ] Optimize product search query performance
- [ ] Implement order status webhooks
- [ ] Add comprehensive API rate limiting
- [ ] Improve error handling consistency
- [ ] Add API documentation with OpenAPI

---

**Remember**: You're the backbone of Threadly. Every API call, every database query, every security measure keeps the marketplace running smoothly and securely! 🔒