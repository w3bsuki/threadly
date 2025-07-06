# Next-Forge Migration Guide

## 🎯 Purpose

This guide provides step-by-step instructions to bring our Threadly codebase into full Next-Forge compliance. Based on the [compliance audit](./next-forge-compliance.md), we have identified specific areas that need attention.

## 📋 Migration Checklist

### ✅ Already Compliant (No Action Required)
- [x] Monorepo architecture with proper app/package separation
- [x] Next.js 15 async params pattern implementation
- [x] Environment variable management with @t3-oss/env-nextjs
- [x] TypeScript strict mode configuration
- [x] Package export patterns (index.ts, server.ts, client.tsx)
- [x] Turborepo build system configuration

### 🔧 High Priority Fixes (Week 1)

#### 1. Fix Deep Import Violations

**Problem**: Some files use deep imports instead of package exports
```typescript
// ❌ Current (incorrect)
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';

// ✅ Target (correct)
import { Button, Input } from '@repo/design-system/components';
```

**Solution**:

1. **Find all deep import violations**:
```bash
# Search for deep imports
grep -r "from '@repo/design-system/components/ui/" apps/
grep -r "from '@repo/design-system/lib/" apps/
```

2. **Update import statements**:
```typescript
// Before
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Card } from '@repo/design-system/components/ui/card';

// After
import { Button, Input, Card } from '@repo/design-system/components';
```

3. **Verify exports in design-system package**:
```typescript
// packages/design-system/components.ts
export { Button } from './components/ui/button';
export { Input } from './components/ui/input';
export { Card } from './components/ui/card';
// ... all other components
```

4. **Run automated fix script**:
```bash
# Create and run fix script
node scripts/fix-design-system-imports.js
```

#### 2. Implement Database Transactions

**Problem**: Related database operations aren't wrapped in transactions

**Current Code**:
```typescript
// ❌ Not atomic - could fail partially
await database.product.update({
  where: { id },
  data: { status: 'SOLD' }
});

await database.order.create({
  data: { productId: id, userId, amount }
});
```

**Solution**:
```typescript
// ✅ Atomic transaction
await database.$transaction(async (tx) => {
  // Update product status
  const product = await tx.product.update({
    where: { id },
    data: { status: 'SOLD' }
  });
  
  // Create order
  const order = await tx.order.create({
    data: { 
      productId: id, 
      userId, 
      amount: product.price 
    }
  });
  
  return { product, order };
});
```

**Files to Update**:
- `apps/app/app/(authenticated)/selling/new/actions/create-product.ts`
- `apps/api/app/api/orders/route.ts`
- `apps/web/app/api/orders/route.ts`

#### 3. Add Basic Caching Layer

**Problem**: No caching implementation for expensive database queries

**Solution**:

1. **Create cache service package**:
```typescript
// packages/cache/src/index.ts
import { Redis } from '@upstash/redis';

export class CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  
  async remember<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.redis.get(key);
    if (cached) return cached as T;
    
    // Execute function and cache result
    const result = await fn();
    await this.redis.setex(key, ttl, JSON.stringify(result));
    return result;
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

export const cache = new CacheService();
```

2. **Update expensive queries**:
```typescript
// Before
const products = await database.product.findMany({
  where: { status: 'AVAILABLE' },
  include: { seller: true, images: true }
});

// After
const products = await cache.remember(
  'products:available',
  () => database.product.findMany({
    where: { status: 'AVAILABLE' },
    include: { seller: true, images: true }
  }),
  300 // 5 minutes
);
```

### ⚠️ Medium Priority (Weeks 2-3)

#### 4. Server vs Client Component Optimization

**Problem**: Some components marked as client components unnecessarily

**Audit Process**:

1. **Find all client components**:
```bash
grep -r "'use client'" apps/
```

2. **Evaluate each component**:
```typescript
// ❌ Unnecessary client component
'use client';
export function ProductDisplay({ product }) {
  return <div>{product.title}</div>; // No interactivity
}

// ✅ Convert to server component
export function ProductDisplay({ product }) {
  return <div>{product.title}</div>;
}
```

3. **Keep client components only for**:
- Interactive elements (buttons, forms)
- State management (useState, useEffect)
- Browser APIs (localStorage, geolocation)
- Third-party client libraries

#### 5. Comprehensive Testing Setup

**Current State**: Minimal testing infrastructure
**Target**: Full testing pyramid implementation

**Step 1: Configure Vitest**
```typescript
// vitest.config.ts (root level)
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./packages/testing/src/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@repo': resolve(__dirname, './packages'),
    },
  },
});
```

**Step 2: Add Testing Utilities**
```typescript
// packages/testing/src/helpers/render.tsx
import { render as rtlRender } from '@testing-library/react';
import { DesignSystemProvider } from '@repo/design-system';

export function render(ui: React.ReactElement, options = {}) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <DesignSystemProvider>
      {children}
    </DesignSystemProvider>
  );
  
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
```

**Step 3: Component Tests**
```typescript
// apps/web/components/__tests__/product-card.test.tsx
import { describe, test, expect } from 'vitest';
import { render, screen } from '@repo/testing';
import { ProductCard } from '../product-card';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    title: 'Test Product',
    price: 29.99,
    images: [{ imageUrl: '/test.jpg' }]
  };

  test('displays product information', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });
});
```

**Step 4: API Route Tests**
```typescript
// apps/api/__tests__/products.test.ts
import { describe, test, expect } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import handler from '../app/api/products/route';

describe('/api/products', () => {
  test('returns products list', async () => {
    await testApiHandler({
      appHandler: { GET: handler.GET },
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        const data = await res.json();
        
        expect(res.status).toBe(200);
        expect(Array.isArray(data.products)).toBe(true);
      },
    });
  });
});
```

#### 6. Performance Optimization Implementation

**Step 1: Add Bundle Analysis**
```javascript
// next.config.ts
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer && process.env.ANALYZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    return config;
  },
};
```

**Step 2: Optimize Database Queries**
```typescript
// Before - N+1 query problem
const products = await database.product.findMany();
for (const product of products) {
  const seller = await database.user.findUnique({ 
    where: { id: product.sellerId }
  });
}

// After - Single query with relations
const products = await database.product.findMany({
  include: {
    seller: {
      select: { 
        id: true, 
        firstName: true, 
        lastName: true 
      }
    }
  }
});
```

**Step 3: Add Database Indexes**
```sql
-- Add to migration
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_status_created 
ON products(status, created_at DESC)
WHERE status = 'AVAILABLE';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_created 
ON products(category_id, created_at DESC)
WHERE status = 'AVAILABLE';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_created 
ON orders(user_id, created_at DESC);
```

### 🔧 Low Priority (Month 1+)

#### 7. Advanced Security Implementation

**Step 1: Rate Limiting Middleware**
```typescript
// packages/security/rate-limits.ts
import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

export class RateLimiter {
  private redis = new Redis({ /* config */ });
  
  async isAllowed(
    identifier: string,
    limit: number,
    window: number
  ): Promise<boolean> {
    const key = `rate_limit:${identifier}`;
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, window);
    }
    
    return current <= limit;
  }
}

export const rateLimiter = new RateLimiter();
```

**Step 2: CSRF Protection**
```typescript
// packages/security/csrf.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateToken, validateToken } from './csrf-utils';

export async function csrfMiddleware(request: NextRequest) {
  if (request.method === 'GET') {
    const response = NextResponse.next();
    const token = generateToken();
    response.headers.set('X-CSRF-Token', token);
    return response;
  }
  
  const token = request.headers.get('X-CSRF-Token');
  if (!token || !validateToken(token)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }
  
  return NextResponse.next();
}
```

#### 8. Advanced Performance Monitoring

**Step 1: Web Vitals Tracking**
```typescript
// lib/performance/web-vitals.ts
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

export function trackWebVitals() {
  function sendMetric(metric: any) {
    // Send to PostHog
    if (window.posthog) {
      window.posthog.capture('web_vital', {
        metric_name: metric.name,
        metric_value: metric.value,
      });
    }
  }
  
  getCLS(sendMetric);
  getFCP(sendMetric);
  getFID(sendMetric);
  getLCP(sendMetric);
  getTTFB(sendMetric);
}
```

**Step 2: Performance Budget**
```typescript
// scripts/performance-budget.ts
const BUDGET = {
  javascript: { initial: 200000, route: 50000 },
  css: { total: 100000, critical: 30000 },
  images: { hero: 200000, product: 100000 },
};

export async function checkPerformanceBudget() {
  const bundleSizes = await analyzeBundleSizes();
  
  const violations = [];
  const totalJS = bundleSizes.reduce((total, bundle) => 
    total + bundle.gzippedSize, 0
  );
  
  if (totalJS > BUDGET.javascript.initial) {
    violations.push(`JavaScript budget exceeded: ${totalJS}`);
  }
  
  if (violations.length > 0) {
    console.error('Performance budget violations:', violations);
    process.exit(1);
  }
}
```

## 🚀 Migration Execution Plan

### Week 1: High Priority Fixes
```bash
# Day 1-2: Fix import violations
npm run fix-imports
npm run lint --fix

# Day 3-4: Add database transactions
# Update all order creation flows
# Update product status changes

# Day 5: Implement basic caching
# Set up Redis connection
# Cache expensive queries
```

### Week 2-3: Testing & Performance
```bash
# Week 2: Testing setup
npm install vitest @testing-library/react @testing-library/jest-dom
npm run test:setup
npm run test # Should achieve 80% coverage

# Week 3: Performance optimization
npm run analyze
npm run optimize-queries
npm run add-indexes
```

### Week 4: Security & Monitoring
```bash
# Security enhancements
npm run add-rate-limiting
npm run add-csrf-protection

# Performance monitoring
npm run setup-web-vitals
npm run setup-performance-budget
```

## 🧪 Validation Process

After each migration step:

1. **Run type checking**: `npm run typecheck`
2. **Run linting**: `npm run lint`
3. **Run tests**: `npm run test`
4. **Run build**: `npm run build`
5. **Validate compliance**: Check against [compliance report](./next-forge-compliance.md)

## 📊 Success Metrics

Track progress with these metrics:

| Metric | Current | Target |
|--------|---------|---------|
| Import Violations | ~15 | 0 |
| TypeScript Errors | 3 | 0 |
| Test Coverage | ~15% | 80% |
| Bundle Size | Unknown | <200KB initial |
| Performance Score | Unknown | >90 |
| Security Score | ~75% | >95% |

## 🆘 Troubleshooting Common Issues

### Import Resolution Issues
```typescript
// If imports break after fixes
// Check package.json exports
{
  "exports": {
    "./components": "./components.ts" // Ensure this exists
  }
}
```

### TypeScript Errors
```bash
# Regenerate types after package changes
npm run typecheck
npx tsc --noEmit --skipLibCheck false
```

### Database Migration Issues
```bash
# If Prisma schema changes break
npx prisma generate
npx prisma db push
```

### Build Failures
```bash
# Clear caches if build fails
npm run clean
rm -rf node_modules
npm install
npm run build
```

## 📝 Documentation Updates

After migration, update:
1. **README.md** - New scripts and commands
2. **CONTRIBUTING.md** - Updated development workflow
3. **Package documentation** - Any new exports or APIs
4. **Deployment guides** - Environment variable changes

---

*This migration guide ensures systematic improvement of Next-Forge compliance while maintaining code quality and functionality.*