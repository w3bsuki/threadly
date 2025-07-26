# Next.js 15 Best Practices Research (2025)

## Executive Summary

This document provides comprehensive research on Next.js 15 best practices for 2025, covering server components, app router patterns, performance optimization, security, and testing strategies. These findings will inform architectural decisions for the Threadly project.

## 1. Server Components Best Practices

### Core Principles

**Default to Server Components**
- Next.js 15 uses Server Components by default for optimal performance
- No additional configuration needed to adopt them
- Reduces client-side JavaScript bundle size significantly

**Code Example: Server Component**
```typescript
// app/products/page.tsx - Server Component by default
async function ProductsPage() {
  const products = await db.products.findMany()
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

**Client Component Usage**
```typescript
// components/LikeButton.tsx
'use client' // Directive for client component

import { useState } from 'react'

export function LikeButton() {
  const [liked, setLiked] = useState(false)
  return <button onClick={() => setLiked(!liked)}>Like</button>
}
```

### Data Fetching Patterns

**Server-Side Data Fetching**
- Direct access to backend resources (databases, APIs)
- Keeps sensitive information (API keys, tokens) secure
- Reduces client-server communication overhead

**Code Example: Secure Data Fetching**
```typescript
// app/api/products/route.ts
export async function GET() {
  // API key stays on server
  const products = await fetch(process.env.BACKEND_API, {
    headers: { 'X-API-Key': process.env.API_KEY }
  })
  
  return Response.json(await products.json())
}
```

### Async APIs Pattern

**New in Next.js 15: Async Request APIs**
```typescript
// Before (Next.js 14)
import { cookies } from 'next/headers'
const cookieStore = cookies()

// Now (Next.js 15)
import { cookies } from 'next/headers'
const cookieStore = await cookies()
```

### Streaming and Suspense

**Progressive Rendering Pattern**
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { DashboardSkeleton } from './skeleton'

export default function Dashboard() {
  return (
    <>
      <Header /> {/* Renders immediately */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent /> {/* Async component */}
      </Suspense>
    </>
  )
}
```

## 2. App Router Patterns and Conventions

### File Structure Conventions

```
app/
├── layout.tsx          # Root layout
├── page.tsx           # Home page
├── loading.tsx        # Loading UI
├── error.tsx          # Error boundary
├── not-found.tsx      # 404 page
├── products/
│   ├── page.tsx       # Products listing
│   ├── [id]/          # Dynamic route
│   │   └── page.tsx   # Product detail
│   └── layout.tsx     # Products layout
└── api/
    └── products/
        └── route.ts   # API endpoint
```

### Advanced Routing Patterns

**Route Groups**
```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (marketing)/
│   ├── about/page.tsx
│   └── blog/page.tsx
└── (app)/
    ├── dashboard/page.tsx
    └── settings/page.tsx
```

**Parallel Routes**
```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <>
      {children}
      <div className="flex">
        {analytics}
        {team}
      </div>
    </>
  )
}
```

### Caching Changes in Next.js 15

**Default Behavior Change**
```typescript
// Next.js 15: GET routes are NOT cached by default
export async function GET() {
  const data = await fetchLatestData()
  return Response.json(data)
}

// To enable caching
export async function GET() {
  const data = await fetchLatestData()
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate'
    }
  })
}
```

## 3. Performance Optimization Techniques

### Turbopack Optimization

- Stable in development with Next.js 15
- Significantly faster build times
- Powers high-traffic sites in production

### Bundle Size Reduction

**Dynamic Imports**
```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false // Only load on client
})
```

**Selective Imports**
```typescript
// Bad
import _ from 'lodash'

// Good
import debounce from 'lodash/debounce'
```

### Image Optimization

```typescript
import Image from 'next/image'

export function ProductImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={500}
      height={300}
      placeholder="blur"
      blurDataURL={blurUrl}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
```

### Edge Functions

```typescript
// app/api/geo/route.ts
export const runtime = 'edge' // Enable edge runtime

export async function GET(request: Request) {
  const country = request.headers.get('x-vercel-ip-country')
  return Response.json({ country })
}
```

### Performance Monitoring

```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registerOTel } = await import('./instrumentation.node')
    await registerOTel()
  }
}
```

## 4. Security Best Practices

### Critical Update: CVE-2025-29927

**⚠️ IMPORTANT: Middleware is no longer safe for authentication**

### Data Access Layer (DAL) Approach

```typescript
// lib/dal.ts
import { auth } from '@/auth'
import { cache } from 'react'

export const getUser = cache(async () => {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user
})

// Usage in Server Component
export default async function ProfilePage() {
  const user = await getUser() // Throws if not authenticated
  return <Profile user={user} />
}
```

### Multi-Layered Security

```typescript
// 1. Data Layer Protection
export async function getProducts(userId: string) {
  const user = await getUser()
  if (user.id !== userId) {
    throw new Error('Forbidden')
  }
  return db.products.findMany({ where: { userId } })
}

// 2. Server Action Protection
'use server'

export async function deleteProduct(productId: string) {
  const user = await getUser()
  const product = await db.products.findUnique({
    where: { id: productId }
  })
  
  if (product?.userId !== user.id) {
    throw new Error('Forbidden')
  }
  
  await db.products.delete({ where: { id: productId } })
}

// 3. UI Protection
export default async function AdminPanel() {
  const user = await getUser()
  
  if (user.role !== 'ADMIN') {
    return <AccessDenied />
  }
  
  return <AdminContent />
}
```

### API Route Security

```typescript
// app/api/admin/users/route.ts
import { NextRequest } from 'next/server'
import { getUser } from '@/lib/dal'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (user.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 })
    }
    
    const users = await db.users.findMany()
    return Response.json(users)
  } catch (error) {
    return new Response('Unauthorized', { status: 401 })
  }
}
```

### Security Headers

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'"
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  }
]

export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
}
```

## 5. Testing Strategies

### Unit Testing Setup

```typescript
// jest.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

### Component Testing

```typescript
// __tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/ProductCard'

describe('ProductCard', () => {
  it('renders product information', () => {
    const product = {
      id: '1',
      name: 'Test Product',
      price: 99.99
    }
    
    render(<ProductCard product={product} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
  })
})
```

### E2E Testing with Playwright

```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('should complete purchase successfully', async ({ page }) => {
    // Navigate to product
    await page.goto('/products/test-product')
    
    // Add to cart
    await page.click('[data-testid="add-to-cart"]')
    
    // Go to checkout
    await page.click('[data-testid="checkout-button"]')
    
    // Fill payment details
    await page.fill('[name="cardNumber"]', '4242424242424242')
    await page.fill('[name="expiry"]', '12/25')
    await page.fill('[name="cvc"]', '123')
    
    // Complete order
    await page.click('[data-testid="place-order"]')
    
    // Verify success
    await expect(page).toHaveURL('/checkout/success')
    await expect(page.locator('h1')).toContainText('Order Confirmed')
  })
})
```

### Testing Best Practices

1. **Test Pyramid**
   - Many unit tests (fast, isolated)
   - Some integration tests (API, database)
   - Few E2E tests (critical flows only)

2. **Test Organization**
   ```
   __tests__/
   ├── unit/
   │   ├── components/
   │   └── utils/
   ├── integration/
   │   └── api/
   └── e2e/
       └── flows/
   ```

3. **CI/CD Integration**
   ```yaml
   # .github/workflows/test.yml
   - name: Run tests
     run: |
       pnpm test:unit
       pnpm test:integration
       pnpm test:e2e
   ```

## Key Anti-Patterns to Avoid

### 1. Authentication in Middleware (Deprecated)
```typescript
// ❌ DON'T DO THIS
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  if (!token) {
    return NextResponse.redirect('/login')
  }
}

// ✅ DO THIS INSTEAD
// Use DAL approach shown in security section
```

### 2. Client-Side Data Fetching for Initial Load
```typescript
// ❌ AVOID
'use client'
useEffect(() => {
  fetch('/api/products').then(...)
}, [])

// ✅ PREFER
// Server Component with direct data access
```

### 3. Overusing Client Components
```typescript
// ❌ AVOID making entire pages client components
'use client'
export default function ProductPage() { ... }

// ✅ PREFER granular client components
// Keep interactivity isolated
```

### 4. Ignoring Caching Changes
```typescript
// ❌ Assuming default caching behavior from Next.js 14
// ✅ Be explicit about caching needs in Next.js 15
```

### 5. Blocking Data Fetching
```typescript
// ❌ Sequential fetching
const user = await getUser()
const products = await getProducts()
const orders = await getOrders()

// ✅ Parallel fetching
const [user, products, orders] = await Promise.all([
  getUser(),
  getProducts(),
  getOrders()
])
```

## Conclusion

Next.js 15 in 2025 emphasizes:
- Server-first architecture with React Server Components
- Explicit caching control
- Multi-layered security (not relying on middleware)
- Performance through streaming and edge functions
- Comprehensive testing strategies

These practices ensure scalable, secure, and performant applications while maintaining excellent developer experience.