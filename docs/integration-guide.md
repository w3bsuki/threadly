# Package Integration Guide

This guide documents how packages work together in the Threadly marketplace monorepo. Each integration pattern is critical to the system's functionality and follows Next-Forge conventions.

## Table of Contents

1. [Auth + Database Integration](#auth--database-integration)
2. [Cache + Database Optimization](#cache--database-optimization)
3. [Search + Cache + Database](#search--cache--database)
4. [Observability Cross-Package Integration](#observability-cross-package-integration)
5. [Security Middleware Integration](#security-middleware-integration)
6. [Real-time + Messaging Integration](#real-time--messaging-integration)
7. [Commerce Module Integration](#commerce-module-integration)
8. [Error Handling Integration](#error-handling-integration)

## Auth + Database Integration

### Pattern Overview
Authentication (Clerk) integrates with database operations through user ID mapping and automatic user creation.

### Key Components
- `@repo/auth/server` - Server-side auth utilities
- `@repo/database` - Prisma database client

### Integration Example
```typescript
// apps/app/app/(authenticated)/selling/new/actions/create-product.ts
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';

export async function createProduct(input: ProductInput) {
  // 1. Verify authentication
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  // 2. Ensure user exists in database
  let dbUser = await database.user.findUnique({
    where: { clerkId: user.id }
  });

  if (!dbUser) {
    dbUser = await database.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        imageUrl: user.imageUrl || null,
      }
    });
  }

  // 3. Use database user ID for product creation
  const product = await database.product.create({
    data: {
      ...validatedData,
      sellerId: dbUser.id, // Use database ID, not Clerk ID
    }
  });
}
```

### Integration Points
1. **User ID Mapping**: Clerk ID → Database User ID
2. **Automatic User Creation**: First-time users auto-created in database
3. **Session Management**: Auth state drives database queries
4. **Role-Based Access**: Database roles combined with Clerk metadata

## Cache + Database Optimization

### Pattern Overview
Cache layer sits between application logic and database to reduce query load and improve performance.

### Key Components
- `@repo/cache` - Redis/Memory cache service
- `@repo/database` - Database queries

### Integration Example
```typescript
// packages/search/src/search-service.ts
import { getCacheService } from '@repo/cache';
import { database } from '@repo/database';

export class MarketplaceSearchService {
  private cacheService = getCacheService();

  async search(filters: SearchFilters, page = 0, hitsPerPage = 20) {
    // 1. Create cache key
    const cacheKey = this.createSearchCacheKey(filters, page, hitsPerPage);
    
    // 2. Try cache first
    const cachedResult = await this.cacheService.getSearchResults(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // 3. Fallback to search engine
    const result = await this.searchEngine.search(filters, page, hitsPerPage);

    // 4. Cache the result
    await this.cacheService.cacheSearchResults(cacheKey, result);

    return result;
  }

  // Cache-aside pattern
  async remember<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    return this.cacheService.remember(key, fetcher, ttl);
  }
}
```

### Cache Strategies
1. **Cache-Aside**: Check cache → Query database → Update cache
2. **Write-Through**: Update database → Update cache
3. **Cache Invalidation**: Tags-based invalidation for related data
4. **Warm Cache**: Pre-populate critical data

### TTL Configuration
```typescript
// packages/cache/src/types.ts
export const CACHE_TTL = {
  SHORT: 300,      // 5 minutes - Search results, notifications
  MEDIUM: 1800,    // 30 minutes - User profiles, categories
  LONG: 3600,      // 1 hour - Products, trending data
  VERY_LONG: 86400 // 24 hours - Static content, categories
};
```

## Search + Cache + Database

### Pattern Overview
Search functionality integrates with both cache and database for optimal performance and data consistency.

### Integration Flow
1. **Index Products**: Database → Search Engine
2. **Search Queries**: Cache → Search Engine → Cache
3. **Product Updates**: Database → Search Index → Cache Invalidation

### Implementation Example
```typescript
// packages/search/src/search-service.ts
async indexProduct(productId: string): Promise<void> {
  // 1. Fetch from database with relations
  const product = await database.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      seller: { select: { firstName: true, lastName: true } },
      images: true,
      _count: { select: { favorites: true } }
    }
  });

  // 2. Transform for search
  const searchProduct = this.transformProductForSearch(product);
  
  // 3. Update search index
  await this.searchEngine.updateProduct(searchProduct);

  // 4. Invalidate related cache
  await this.cacheService.invalidateProduct(productId);
}
```

### Data Transformation Pipeline
Database Product → Search Product → Cached Result

## Observability Cross-Package Integration

### Pattern Overview
Observability integrates across all packages to provide comprehensive monitoring, logging, and error tracking.

### Key Integration Points

#### 1. API Monitoring Wrapper
```typescript
// packages/observability/api-monitoring.ts
export function withAPIMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  config: APIMonitoringConfig = {}
) {
  return async (...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    
    // Track database, Stripe, cache operations
    let hasDatabase = false;
    let hasStripe = false;
    let cacheHit: boolean | undefined;

    try {
      const response = await withScope(async (scope) => {
        scope.setTag('api.endpoint', endpoint);
        scope.setTag('api.method', method);
        
        return handler(...args);
      });

      // Extract integration flags from response headers
      hasDatabase = response.headers.get('x-database-used') === 'true';
      hasStripe = response.headers.get('x-stripe-used') === 'true';
      cacheHit = response.headers.get('x-cache-status') === 'hit';

      return response;
    } catch (error) {
      // Error tracking with context
      captureException(error);
      throw error;
    }
  };
}
```

#### 2. Database Operation Tracking
```typescript
// Used in database operations
export function trackDatabaseOperation<T>(
  operation: string,
  table: string,
  fn: () => Promise<T>
): Promise<T> {
  return withScope(async (scope) => {
    scope.setTag('db.operation', operation);
    scope.setTag('db.table', table);
    
    const result = await fn();
    
    // Performance tracking
    if (duration > 500) {
      scope.setTag('db.slow', 'true');
    }
    
    return result;
  });
}
```

#### 3. Marketplace Context Tracking
```typescript
// packages/observability/marketplace-context.ts
export function setProductContext(productId: string, categoryId?: string) {
  withScope((scope) => {
    scope.setTag('marketplace.product_id', productId);
    if (categoryId) scope.setTag('marketplace.category_id', categoryId);
  });
}

export function trackSearchOperation(query: string, resultsCount: number) {
  withScope((scope) => {
    scope.setTag('search.query', query);
    scope.setTag('search.results_count', resultsCount.toString());
  });
}
```

## Security Middleware Integration

### Pattern Overview
Security middleware integrates with authentication, rate limiting, and validation across all endpoints.

### Integration Layers

#### 1. Rate Limiting Integration
```typescript
// packages/security/rate-limits.ts
import { checkRateLimit, generalApiLimit } from '@repo/security';

// In API routes
export async function POST(request: NextRequest) {
  // 1. Apply rate limiting
  const rateLimitResult = await checkRateLimit(generalApiLimit, request);
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult);
  }

  // 2. Continue with auth and validation
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Process request
}
```

#### 2. Validation Integration
```typescript
// packages/validation integration
import { sanitizeForDisplay } from '@repo/validation/sanitize';
import { productSchema } from '@repo/validation/schemas';

// Sanitization + Validation pattern
const validatedData = productSchema.parse(input);
const sanitizedData = {
  ...validatedData,
  title: sanitizeForDisplay(validatedData.title),
  description: sanitizeForDisplay(validatedData.description)
};
```

## Real-time + Messaging Integration

### Pattern Overview
Real-time functionality integrates with messaging, notifications, and database updates.

### Integration Example
```typescript
// packages/messaging/server.ts
import { getPusherServer } from '@repo/real-time/server';
import { database } from '@repo/database';

export async function sendMessage(userId: string, data: MessageData) {
  // 1. Create message in database
  const message = await database.message.create({
    data: {
      conversationId: data.conversationId,
      senderId: dbUser.id,
      content: sanitizeForDisplay(data.content),
    }
  });

  // 2. Send real-time notification
  const pusherServer = getPusherServer(config);
  await pusherServer.sendMessage({
    id: message.id,
    conversationId: message.conversationId,
    content: message.content,
    createdAt: message.createdAt,
  });

  // 3. Update conversation timestamp
  await database.conversation.update({
    where: { id: data.conversationId },
    data: { updatedAt: new Date() }
  });
}
```

## Commerce Module Integration

### Pattern Overview
Commerce module integrates cart, checkout, orders, and products with database and cache.

### Key Integrations

#### 1. Cart State Management
```typescript
// packages/commerce/cart/store.ts
import { database } from '@repo/database';
import { getCacheService } from '@repo/cache';

export const useCartStore = create<CartState>((set, get) => ({
  // Sync with database
  syncWithDatabase: async (userId: string) => {
    const cart = await database.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    });
    
    set({ items: cart?.items || [] });
  },

  // Cache cart state
  persistToCache: async () => {
    const cache = getCacheService();
    await cache.set(`cart:${userId}`, get().items, { ttl: 3600 });
  }
}));
```

#### 2. Product Queries Integration
```typescript
// packages/commerce/products/queries.ts
export async function getProducts(filters: ProductFilters) {
  const cache = getCacheService();
  
  return cache.remember(
    `products:${JSON.stringify(filters)}`,
    async () => {
      return database.product.findMany({
        where: filters,
        include: {
          seller: true,
          images: true,
          category: true
        }
      });
    },
    CACHE_TTL.MEDIUM
  );
}
```

## Error Handling Integration

### Pattern Overview
Error handling integrates with observability, logging, and user-facing error boundaries.

### Integration Layers

#### 1. API Error Wrapper
```typescript
// packages/error-handling/api-wrapper.ts
import { parseError } from '@repo/observability/server';
import { captureException } from '@sentry/nextjs';

export function withErrorHandling<T>(fn: () => Promise<T>) {
  return async (): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      // 1. Log to observability
      captureException(error);
      
      // 2. Parse for user-friendly message
      const message = parseError(error);
      
      // 3. Return structured error
      throw new APIError(message, error);
    }
  };
}
```

#### 2. Circuit Breaker Integration
```typescript
// packages/error-handling/circuit-breaker.ts
export class CircuitBreaker {
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      
      // Integrate with observability
      captureException(error);
      throw error;
    }
  }
}
```

## Integration Best Practices

### 1. Package Boundaries
- Use proper exports from package.json
- No deep imports across packages
- Clear separation of concerns

### 2. Error Propagation
- Consistent error handling across packages
- Structured error responses
- Proper logging at integration points

### 3. Performance Optimization
- Cache at integration boundaries
- Monitor cross-package operation performance
- Use proper database transaction scopes

### 4. Testing Integration Points
- Mock external package dependencies
- Test error scenarios
- Verify data consistency across packages

### 5. Monitoring Integration Health
- Track cross-package operation latency
- Monitor cache hit rates
- Alert on integration failures

## Troubleshooting Common Integration Issues

### 1. Cache Inconsistency
**Problem**: Cached data doesn't match database
**Solution**: Implement proper cache invalidation on updates

### 2. Authentication State Mismatch
**Problem**: Clerk user exists but database user doesn't
**Solution**: Implement automatic user creation pattern

### 3. Search Index Drift
**Problem**: Search results don't match database state
**Solution**: Implement webhook-based reindexing

### 4. Real-time Message Delivery
**Problem**: Messages not delivered in real-time
**Solution**: Verify Pusher configuration and error handling

### 5. Rate Limiting False Positives
**Problem**: Valid requests being rate limited
**Solution**: Tune rate limit thresholds and implement bypass logic