# Best Practices

## 🎯 Next-Forge Development Guidelines

This document outlines the essential best practices for developing with Next-Forge patterns in the Threadly project.

## 🏗️ Architecture Principles

### 1. Separation of Concerns

**Applications vs Packages**
- **Apps** contain business logic specific to their domain
- **Packages** contain reusable, domain-agnostic functionality
- **Never import between apps** - use shared packages instead

```typescript
// ❌ DON'T: Import from other apps
import { userHelper } from '../../web/src/lib/helpers';

// ✅ DO: Create shared package
import { userHelper } from '@repo/utils/user';
```

**Server vs Client Code**
- **Server Components by default** - Use for data fetching and static content
- **Client Components sparingly** - Only for interactivity and state
- **Server Actions** for mutations - Keep business logic on server

```typescript
// ❌ DON'T: Fetch data in client components
'use client';
export function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('/api/products').then(/* ... */);
  }, []);
}

// ✅ DO: Use server components for data fetching
export async function ProductList() {
  const products = await database.product.findMany();
  
  return <ProductListClient products={products} />;
}
```

### 2. Type Safety First

**Strict TypeScript Configuration**
- **No `any` types** - Use proper typing or `unknown` with type guards
- **Strict mode enabled** - Full TypeScript strict configuration
- **Runtime validation** - Use Zod for API inputs and environment variables

```typescript
// ❌ DON'T: Use any types
const handleSubmit = (data: any) => {
  // Dangerous - no type safety
};

// ✅ DO: Use proper types with validation
const formSchema = z.object({
  title: z.string().min(1),
  price: z.number().positive(),
});

const handleSubmit = (data: z.infer<typeof formSchema>) => {
  // Type safe and runtime validated
};
```

**Database Types**
- **Use Prisma generated types** - Never manually type database models
- **Proper relations** - Include necessary relations in queries
- **Decimal handling** - Use `@repo/utils/decimal` for monetary values

```typescript
// ❌ DON'T: Manual database types
interface Product {
  id: string;
  title: string;
  price: number; // Wrong type for currency
}

// ✅ DO: Use Prisma types with proper Decimal handling
import { type Prisma } from '@repo/database';
import { decimalToNumber } from '@repo/utils/decimal';

const product = await database.product.findUnique({
  where: { id },
  include: { seller: true, images: true }
});

const priceNumber = decimalToNumber(product.price);
```

### 3. Next.js 15 Patterns

**Async Params (Critical)**
```typescript
// ❌ DON'T: Access params directly in Next.js 15
export default function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id); // Will break
}

// ✅ DO: Always await params in Next.js 15
export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params; // Must await in Next.js 15
  const product = await getProduct(id);
}
```

**Server Actions**
```typescript
// ✅ Proper server action pattern
'use server';

import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
  const user = await auth();
  if (!user?.userId) throw new Error('Unauthorized');
  
  const validatedData = createProductSchema.parse({
    title: formData.get('title'),
    price: Number(formData.get('price')),
  });
  
  const product = await database.product.create({
    data: {
      ...validatedData,
      sellerId: user.userId,
    },
  });
  
  revalidatePath('/selling/listings');
  return { success: true, product };
}
```

## 🔐 Security Best Practices

### 1. Input Validation

**All User Inputs Must Be Validated**
```typescript
// ✅ API route with proper validation
import { z } from 'zod';
import { validateBody } from '@repo/validation/middleware';

const createProductSchema = z.object({
  title: z.string().min(3).max(100),
  price: z.number().positive().max(999999),
  description: z.string().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, createProductSchema);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validation.errors },
      { status: 400 }
    );
  }
  
  // Use validation.data - it's type-safe and validated
}
```

**Input Sanitization**
```typescript
import { sanitizeForDisplay, filterProfanity } from '@repo/validation/sanitize';

// ✅ Sanitize user content
const sanitizedTitle = filterProfanity(sanitizeForDisplay(title));
const sanitizedDescription = sanitizeHtml(description, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
  ALLOWED_ATTR: [],
});
```

### 2. Authentication Patterns

**Server-Side Authentication**
```typescript
// ✅ Protect API routes
import { auth } from '@repo/auth/server';

export async function POST(request: NextRequest) {
  const user = await auth();
  if (!user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get database user
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.userId }
  });
  
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  // Continue with authenticated logic
}
```

**Middleware Protection**
```typescript
// ✅ Protect routes with middleware
import { clerkMiddleware, createRouteMatcher } from '@repo/auth/server';

const isProtectedRoute = createRouteMatcher([
  '/selling(.*)',
  '/profile(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }
});
```

### 3. Environment Security

**Sensitive Variables**
```typescript
// ✅ Server-only secrets
const env = createEnv({
  server: {
    STRIPE_SECRET_KEY: z.string().startsWith('sk_'), // Server only
    DATABASE_URL: z.string().url(), // Server only
  },
  client: {
    NEXT_PUBLIC_STRIPE_PK: z.string().startsWith('pk_'), // Safe for client
  },
});
```

## 🚀 Performance Optimization

### 1. Database Optimization

**Efficient Queries**
```typescript
// ❌ DON'T: N+1 queries
const products = await database.product.findMany();
for (const product of products) {
  const seller = await database.user.findUnique({ 
    where: { id: product.sellerId }
  });
}

// ✅ DO: Include relations
const products = await database.product.findMany({
  include: {
    seller: {
      select: { id: true, firstName: true, lastName: true }
    },
    images: {
      orderBy: { displayOrder: 'asc' }
    }
  }
});
```

**Pagination**
```typescript
// ✅ Proper pagination pattern
const page = parseInt(searchParams.get('page') || '1');
const limit = parseInt(searchParams.get('limit') || '20');
const skip = (page - 1) * limit;

const [products, total] = await Promise.all([
  database.product.findMany({
    where,
    skip,
    take: limit,
    include: { seller: true }
  }),
  database.product.count({ where })
]);

return {
  products,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPreviousPage: page > 1,
  }
};
```

### 2. Caching Strategy

**Redis Caching**
```typescript
import { getCacheService } from '@repo/cache';

const cache = getCacheService();

// ✅ Cache expensive operations
const getPopularProducts = async () => {
  return await cache.remember(
    'products:popular',
    async () => {
      return await database.product.findMany({
        where: { views: { gt: 100 } },
        orderBy: { views: 'desc' },
        take: 10,
        include: { seller: true }
      });
    },
    300 // 5 minutes
  );
};
```

**Cache Invalidation**
```typescript
// ✅ Invalidate cache after mutations
export async function updateProduct(id: string, data: ProductUpdateInput) {
  const product = await database.product.update({
    where: { id },
    data
  });
  
  // Invalidate related caches
  await cache.invalidate(`product:${id}`);
  await cache.invalidate('products:popular');
  
  return product;
}
```

### 3. Image Optimization

**Next.js Image Component**
```typescript
import Image from 'next/image';

// ✅ Optimized images with proper sizing
<Image
  src={product.imageUrl}
  alt={product.title}
  width={400}
  height={400}
  priority={isAboveFold}
  className="rounded-lg object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

## 🧪 Testing Strategies

### 1. Unit Testing

**Component Testing**
```typescript
import { render, screen } from '@testing-library/react';
import { ProductCard } from './product-card';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    title: 'Test Product',
    price: new Decimal('29.99'),
    images: [{ imageUrl: '/test.jpg' }]
  };

  test('displays product information', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });
});
```

**API Route Testing**
```typescript
import { testApiHandler } from 'next-test-api-route-handler';
import handler from './route';

describe('/api/products', () => {
  test('returns products list', async () => {
    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        const data = await res.json();
        
        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data.products)).toBe(true);
      },
    });
  });
});
```

### 2. Integration Testing

**Database Testing**
```typescript
describe('Product service', () => {
  beforeEach(async () => {
    await database.product.deleteMany();
    await database.user.deleteMany();
  });
  
  test('creates product with seller relationship', async () => {
    const seller = await database.user.create({
      data: { clerkId: 'test-user', email: 'test@test.com' }
    });
    
    const product = await createProduct({
      title: 'Test Product',
      price: new Decimal('29.99'),
      sellerId: seller.id
    });
    
    expect(product.sellerId).toBe(seller.id);
  });
});
```

## 📝 Code Organization

### 1. File Naming Conventions

```
// ✅ Consistent file naming
components/
├── ui/
│   ├── button.tsx           # kebab-case for files
│   ├── input.tsx
│   └── card.tsx
├── product/
│   ├── product-card.tsx     # Feature-specific components
│   ├── product-list.tsx
│   └── product-form.tsx
└── layout/
    ├── header.tsx
    └── sidebar.tsx

// ✅ API routes
app/api/
├── products/
│   ├── route.ts             # Collection endpoints
│   └── [id]/
│       └── route.ts         # Resource endpoints
└── orders/
    ├── route.ts
    └── [id]/
        ├── route.ts
        └── ship/
            └── route.ts
```

### 2. Import Organization

```typescript
// ✅ Import order
// 1. React and Next.js
import React from 'react';
import { NextRequest, NextResponse } from 'next/server';

// 2. External libraries
import { z } from 'zod';
import { clsx } from 'clsx';

// 3. Internal packages (alphabetical)
import { database } from '@repo/database';
import { auth } from '@repo/auth/server';
import { Button } from '@repo/design-system';

// 4. Relative imports (closest first)
import { ProductCard } from '../product-card';
import { validateInput } from './validation';
```

### 3. Component Structure

```typescript
// ✅ Component organization pattern
import type { Product } from '@repo/database';

interface ProductCardProps {
  product: Product;
  onFavorite?: (productId: string) => void;
  className?: string;
}

export function ProductCard({ 
  product, 
  onFavorite, 
  className 
}: ProductCardProps) {
  // Hooks first
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Event handlers
  const handleFavorite = useCallback(() => {
    setIsFavorited(!isFavorited);
    onFavorite?.(product.id);
  }, [isFavorited, onFavorite, product.id]);
  
  // Render
  return (
    <div className={clsx('product-card', className)}>
      {/* Component JSX */}
    </div>
  );
}
```

## 🚨 Common Pitfalls to Avoid

### 1. TypeScript Issues

```typescript
// ❌ DON'T: Any types
const data: any = await request.json();

// ❌ DON'T: Non-null assertions without checking
const user = await getUser()!;

// ❌ DON'T: Ignoring async/await
const params = await params; // This is required in Next.js 15!

// ✅ DO: Proper typing and error handling
const body = await request.json();
const data = schema.parse(body);

const user = await getUser();
if (!user) throw new Error('User not found');

const { id } = await params; // Always await params
```

### 2. Security Mistakes

```typescript
// ❌ DON'T: Expose sensitive data
return NextResponse.json({ 
  user: dbUser // Contains sensitive fields
});

// ❌ DON'T: Trust client data
const userId = request.headers.get('user-id'); // Can be spoofed

// ✅ DO: Select only needed fields
return NextResponse.json({
  user: {
    id: dbUser.id,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName
  }
});

// ✅ DO: Get user from verified token
const { userId } = await auth();
```

### 3. Performance Issues

```typescript
// ❌ DON'T: Fetch in loops
for (const orderId of orderIds) {
  const order = await database.order.findUnique({ where: { id: orderId } });
}

// ❌ DON'T: Overfetch data
const product = await database.product.findMany({
  include: {
    seller: true,
    orders: true,      // Potentially huge
    reviews: true,     // Potentially huge
    favorites: true    // Potentially huge
  }
});

// ✅ DO: Batch operations
const orders = await database.order.findMany({
  where: { id: { in: orderIds } }
});

// ✅ DO: Select only what you need
const products = await database.product.findMany({
  select: {
    id: true,
    title: true,
    price: true,
    seller: {
      select: { firstName: true, lastName: true }
    }
  }
});
```

## 🎯 Summary

Following these best practices ensures:

- **Type Safety** - Comprehensive TypeScript usage with runtime validation
- **Security** - Input validation, authentication, and data protection
- **Performance** - Optimized queries, caching, and bundle sizes
- **Maintainability** - Consistent patterns and clear organization
- **Scalability** - Architecture that grows with your application

Remember: **These patterns are enforced through linting, TypeScript, and code review processes to maintain consistency across the entire codebase.**