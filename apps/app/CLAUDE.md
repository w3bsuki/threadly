# 🛍️ Seller Dashboard (Next.js App)

**Claude Agent Context for Threadly Seller Dashboard**

---

## 📋 App Overview
This is the **seller-focused web application** built with Next.js 15 using App Router. Sellers use this dashboard to manage their inventory, track sales, communicate with buyers, handle orders, and analyze their business performance on the Threadly marketplace.

## 🏗️ Architecture
```
apps/app/
├── app/                    # Next.js 15 App Router
│   ├── (authenticated)/    # Protected routes for sellers
│   │   ├── admin/          # Admin-only features  
│   │   ├── buying/         # Buyer-side features
│   │   ├── selling/        # Core seller features
│   │   ├── messages/       # Communication system
│   │   └── profile/        # Profile management
│   ├── (unauthenticated)/  # Public routes (sign-in/up)
│   ├── actions/            # Server actions
│   ├── api/                # API routes
│   └── global files        # Layout, error, loading, etc.
├── components/             # Shared React components
├── lib/                    # Utilities, hooks, stores
├── env.ts                  # Environment validation (Next-Forge pattern)
├── middleware.ts           # Security and auth middleware
└── package.json           # Dependencies and scripts
```

## 🧠 Agent Instructions

### When Working in This Directory:
1. **You are working on the SELLER-FOCUSED Next.js web app**
2. **Next.js 15 patterns** - Use async params, App Router, Server Components
3. **TypeScript safety** - No `any` types, strict mode enabled
4. **Performance critical** - Cache database queries, optimize bundle size
5. **Follow Next-Forge patterns** - Modular env, shared packages, security middleware

### Key Principles:
- **Seller efficiency** - Dashboard widgets, bulk operations, quick actions
- **Real-time updates** - Order notifications, message alerts via Pusher
- **Mobile responsive** - Works on tablets and mobile devices
- **Type safety** - Proper TypeScript throughout, Zod validation

## 🛠️ Development Commands

```bash
# Development
pnpm dev                    # Start Next.js dev server (port 3000)
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # ESLint check
pnpm typecheck              # TypeScript validation (REQUIRED before commits)

# Database
pnpm db:push                # Push schema changes
pnpm db:studio              # Open Prisma Studio
pnpm db:seed                # Seed development data

# Testing
pnpm test                   # Run tests
pnpm test:watch             # Watch mode
```

## 🎯 Core Features

### Dashboard (`/selling/dashboard`)
- Sales analytics and charts
- Recent orders overview
- Quick actions (add product, view messages)
- Performance metrics and KPIs

### Product Management (`/selling/listings`)
- Product list with search/filtering
- Add/edit products with image upload
- Bulk operations (price updates, status changes)  
- Inventory management

### Order Management (`/selling/orders`)
- Order list with status filtering
- Order fulfillment workflow
- Shipping management
- Customer communication

### Analytics (`/selling/dashboard`)
- Revenue tracking and trends
- Product performance metrics
- Customer insights
- Sales forecasting

### Messages (`/messages`)
- Real-time chat with buyers
- Message history and search
- File/image sharing
- Push notifications via Pusher

### Profile Management (`/profile`)
- Seller profile settings
- Stripe Connect integration
- Bank account/payout settings
- Account preferences

## 🔧 Next.js 15 Patterns

### Async Params (CRITICAL)
```typescript
// ALWAYS await params in dynamic routes
interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params; // MUST await in Next.js 15
  
  const product = await database.product.findUnique({
    where: { id }
  });
  
  return <ProductDetail product={product} />;
}
```

### Server Actions
```typescript
'use server';

import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';

export async function updateProductAction(
  productId: string,
  data: ProductUpdateInput
) {
  const user = await auth();
  if (!user?.id) throw new Error('Unauthorized');
  
  const product = await database.product.update({
    where: { id: productId, sellerId: user.id },
    data
  });
  
  revalidatePath('/selling/listings');
  return { success: true, product };
}
```

### API Routes
```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await auth();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const products = await database.product.findMany({
      where: { sellerId: user.id }
    });
    
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
```

## 🎨 UI Components

```typescript
// Use shared design system
import { Button, Card, Input } from '@repo/design-system';
import { Badge } from '@repo/design-system/badge';

// Component patterns
export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{product.title}</h3>
        <Badge variant={product.status === 'AVAILABLE' ? 'success' : 'secondary'}>
          {product.status}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{product.description}</p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="outline">
          Edit
        </Button>
        <Button size="sm">
          View
        </Button>
      </div>
    </Card>
  );
}
```

## 🔐 Authentication & Authorization

```typescript
// Middleware-based auth with Clerk
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/selling(.*)',
  '/profile(.*)',
  '/messages(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

// In components/pages
import { auth } from '@repo/auth/server';

export default async function SellingPage() {
  const user = await auth();
  if (!user) redirect('/sign-in');
  
  // Seller-specific logic
}
```

## 💾 Database Patterns

```typescript
// Use transactions for related operations
import { database } from '@repo/database';

export async function createOrderAction(orderData: OrderInput) {
  return await database.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: orderData
    });
    
    await tx.product.update({
      where: { id: orderData.productId },
      data: { status: 'RESERVED' }
    });
    
    return order;
  });
}

// Proper type safety with Prisma
import type { Prisma } from '@prisma/client';

const where: Prisma.ProductWhereInput = {
  sellerId: user.id,
  status: 'AVAILABLE'
};

const products = await database.product.findMany({ where });
```

## 📊 Real-time Features

```typescript
// Pusher integration for real-time updates
import { pusher } from '@repo/real-time/server';

// Trigger events
await pusher.trigger(`seller-${sellerId}`, 'new-order', {
  orderId: order.id,
  productTitle: product.title,
  buyerName: buyer.name
});

// Client-side listening
import { usePusher } from '@repo/real-time/hooks';

export function OrderNotifications() {
  const user = useUser();
  
  usePusher(`seller-${user?.id}`, 'new-order', (data) => {
    toast.success(`New order for ${data.productTitle}!`);
  });
  
  return null;
}
```

## 🔧 Environment Variables

```typescript
// env.ts - Following Next-Forge pattern
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';
import { auth } from '@repo/auth/keys';
import { database } from '@repo/database/keys';

export const env = createEnv({
  extends: [auth(), database(), ...],
  server: {
    STRIPE_SECRET_KEY: z.string().min(1),
    WEBHOOK_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
});
```

## 📈 Performance Optimization

```typescript
// Caching with Redis
import { getCacheService } from '@repo/cache';

const cache = getCacheService();

export async function getSellerAnalytics(sellerId: string) {
  return await cache.remember(
    `seller-analytics:${sellerId}`,
    async () => {
      return await database.order.aggregate({
        where: { sellerId },
        _sum: { total: true },
        _count: true
      });
    },
    300 // 5 minutes
  );
}

// Image optimization
import Image from 'next/image';

<Image
  src={product.imageUrl}
  alt={product.title}
  width={300}
  height={300}
  className="rounded-lg"
  priority={isAboveFold}
/>
```

## 🧪 Testing Strategy

```typescript
// Component testing
import { render, screen } from '@testing-library/react';
import { ProductCard } from './product-card';

describe('ProductCard', () => {
  test('displays product information', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
  });
});

// API route testing
import { testApiHandler } from 'next-test-api-route-handler';
import handler from './api/products/route';

describe('/api/products', () => {
  test('returns seller products', async () => {
    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        const data = await res.json();
        
        expect(res.status).toBe(200);
        expect(data.products).toBeDefined();
      },
    });
  });
});
```

## ⚠️ Critical Fixes Needed

### 1. Fix TypeScript Safety
```typescript
// WRONG - Found in middleware.ts
const middleware: any = clerkMiddleware(/* ... */);

// CORRECT
export default clerkMiddleware(async (auth, request) => {
  // Properly typed implementation
});
```

### 2. Fix Decimal Handling
```typescript
// Create shared utility instead of complex workarounds
import { decimalToNumber } from '@repo/utils/decimal';

const revenue = decimalToNumber(order.total);
```

### 3. Re-enable Observability
```typescript
// next.config.ts - Fix and re-enable
import { withLogging, withSentry } from '@repo/observability/next-config';

export default withSentry(withLogging(nextConfig));
```

## 🎯 Key Seller Workflows

### Quick Actions Dashboard
- Add new product (one-click flow)
- Respond to messages (template responses)
- Mark orders as shipped
- Update product prices

### Analytics Overview
- Today's revenue vs yesterday
- Top-performing products this week
- Pending orders requiring attention
- Customer satisfaction metrics

### Inventory Management
- Low stock alerts
- Seasonal performance insights
- Price optimization suggestions
- Photo quality recommendations

## 📱 Mobile Responsiveness

```typescript
// Tailwind responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// Mobile-first navigation
export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
      <div className="flex justify-around py-2">
        <NavButton href="/selling/dashboard" icon={Home} label="Dashboard" />
        <NavButton href="/selling/listings" icon={Package} label="Products" />
        <NavButton href="/messages" icon={MessageCircle} label="Messages" />
        <NavButton href="/profile" icon={User} label="Profile" />
      </div>
    </nav>
  );
}
```

## 🚀 Deployment (Vercel)

```bash
# Automatic deployment via Git
git push origin main  # Deploys to production

# Environment variables in Vercel dashboard:
# - All shared package env vars
# - Seller-specific configurations
# - Stripe Connect settings
```

## 📞 Getting Help

1. **Documentation References**
   - Next-Forge docs: `/docs/next-forge-reference/`
   - Audit reports: `/docs/AUDIT_APP_DASHBOARD.md`
   - Main project docs: `/CLAUDE.md`, `/PROJECT.md`

2. **Other Apps**
   - Customer marketplace: `apps/web/`
   - Backend API: `apps/api/`
   - Shared packages: `packages/`

3. **External Resources**
   - Next.js 15 documentation
   - Clerk authentication docs
   - Stripe Connect documentation
   - Prisma documentation

---

## 🎯 Current Priority Areas

- [x] Fix documentation accuracy (React Native → Next.js)
- [ ] Remove all `any` types for proper TypeScript safety
- [ ] Re-enable Sentry and logging (fix build errors)
- [ ] Implement proper Decimal utility package
- [ ] Add comprehensive error boundaries
- [ ] Optimize analytics dashboard with real data
- [ ] Improve mobile responsiveness
- [ ] Add bulk operations for products

---

**Remember**: You're building a professional seller dashboard that needs to handle real business operations. Focus on reliability, performance, and user experience! 💼