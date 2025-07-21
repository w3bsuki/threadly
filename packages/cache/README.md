# @repo/cache

## Overview
High-performance caching layer for Threadly marketplace using Redis (Upstash) with fallback to in-memory cache. Provides type-safe caching with automatic serialization, TTL management, and tag-based invalidation.

## Installation
```bash
pnpm add @repo/cache
```

## Setup & Configuration
Required environment variables:
```env
UPSTASH_REDIS_URL=https://...upstash.io
UPSTASH_REDIS_TOKEN=AX...
CACHE_DEFAULT_TTL=300  # Optional, defaults to 5 minutes
```

## API Reference

### CacheService Interface
```typescript
interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttl: number): Promise<void>;
  clear(): Promise<void>;
  invalidateByTag(tag: string): Promise<void>;
  getStats(): Promise<CacheStats>;
}

interface CacheOptions {
  ttl?: number;    // Time to live in seconds
  tags?: string[];  // For cache invalidation
}
```

### Predefined Cache Keys
```typescript
import { CACHE_KEYS, CACHE_TTL, CACHE_TAGS } from '@repo/cache';

// Product caching
const key = CACHE_KEYS.PRODUCT(productId);
const products = await cache.get(CACHE_KEYS.TRENDING_PRODUCTS);

// User-specific caching
const profile = await cache.get(CACHE_KEYS.USER_PROFILE(userId));
const favorites = await cache.get(CACHE_KEYS.USER_FAVORITES(userId));

// Search results
const results = await cache.get(CACHE_KEYS.SEARCH_RESULTS(query));
```

### TTL Constants
```typescript
CACHE_TTL.SHORT      // 5 minutes
CACHE_TTL.MEDIUM     // 30 minutes
CACHE_TTL.LONG       // 2 hours
CACHE_TTL.VERY_LONG  // 24 hours
CACHE_TTL.WEEK       // 7 days
```

### Cache Tags
```typescript
CACHE_TAGS.PRODUCTS      // Product-related caches
CACHE_TAGS.USERS         // User-related caches
CACHE_TAGS.CATEGORIES    // Category caches
CACHE_TAGS.ORDERS        // Order caches
CACHE_TAGS.NOTIFICATIONS // Notification caches
CACHE_TAGS.CONVERSATIONS // Message caches
CACHE_TAGS.SEARCH        // Search result caches
```

## Usage Examples

### Basic Caching
```typescript
import { getCacheService } from '@repo/cache';

const cache = getCacheService();

// Set value with default TTL
await cache.set('user:123', userData);

// Set with custom TTL
await cache.set('product:456', productData, { 
  ttl: CACHE_TTL.LONG 
});

// Get cached value
const user = await cache.get<User>('user:123');

// Delete from cache
await cache.del('user:123');
```

### Pattern: Cache-Aside with Database
```typescript
import { getCacheService, CACHE_KEYS, CACHE_TTL } from '@repo/cache';
import { database } from '@repo/database';

async function getProduct(id: string) {
  const cache = getCacheService();
  const key = CACHE_KEYS.PRODUCT(id);
  
  // Try cache first
  const cached = await cache.get<Product>(key);
  if (cached) return cached;
  
  // Fetch from database
  const product = await database.product.findUnique({
    where: { id },
    include: { images: true, seller: true }
  });
  
  if (product) {
    // Cache for future requests
    await cache.set(key, product, { 
      ttl: CACHE_TTL.MEDIUM,
      tags: [CACHE_TAGS.PRODUCTS]
    });
  }
  
  return product;
}
```

### Tag-based Invalidation
```typescript
// Cache products with tags
await cache.set(CACHE_KEYS.PRODUCT(id), product, {
  tags: [CACHE_TAGS.PRODUCTS, `seller:${sellerId}`]
});

// Invalidate all products
await cache.invalidateByTag(CACHE_TAGS.PRODUCTS);

// Invalidate specific seller's products
await cache.invalidateByTag(`seller:${sellerId}`);
```

### Remember Pattern
```typescript
import { remember } from '@repo/cache';

// Automatically handles caching logic
const product = await remember(
  CACHE_KEYS.PRODUCT(id),
  async () => {
    return database.product.findUnique({ where: { id } });
  },
  { ttl: CACHE_TTL.MEDIUM }
);
```

### Cache Middleware for API Routes
```typescript
import { withCache } from '@repo/cache';

// Wrap API handler with caching
export const GET = withCache(
  async (request) => {
    const products = await getProducts();
    return NextResponse.json(products);
  },
  {
    ttl: CACHE_TTL.SHORT,
    keyGenerator: (req) => `api:products:${req.nextUrl.searchParams}`
  }
);
```

### Cache Stats Monitoring
```typescript
const stats = await cache.getStats();
console.log(`Cache hit rate: ${stats.hitRate}%`);
console.log(`Total operations: ${stats.totalOperations}`);
```

## Testing
```bash
# Type checking
pnpm typecheck

# Build package
pnpm build

# Development mode with watch
pnpm dev
```

## Implementation Details

### Redis Cache (Primary)
- Uses Upstash Redis for distributed caching
- Automatic JSON serialization/deserialization
- Supports complex data types
- Tag-based invalidation with Redis sets
- Connection pooling and retry logic

### Memory Cache (Fallback)
- In-memory LRU cache with max size limits
- Used when Redis is unavailable
- Automatic memory pressure handling
- No tag support (uses key prefix matching)

### Error Handling
- Graceful fallback to memory cache on Redis errors
- Non-blocking cache operations (errors logged, not thrown)
- Circuit breaker pattern for Redis connection issues

## Best Practices

1. **Use Predefined Keys**: Always use `CACHE_KEYS` constants for consistency
2. **Set Appropriate TTLs**: Choose TTL based on data volatility
3. **Tag Your Caches**: Use tags for easy bulk invalidation
4. **Monitor Hit Rates**: Use `getStats()` to optimize cache usage
5. **Cache at the Right Level**: Cache computed/aggregated data, not raw DB records

## Performance Considerations

- Redis operations are async and non-blocking
- Batch operations when possible
- Use pipeline for multiple operations
- Consider cache warming for critical data
- Monitor memory usage with memory cache

## Dependencies
- **@upstash/redis**: Serverless Redis client
- **@repo/error-handling**: Error tracking and circuit breaker
- **@t3-oss/env-nextjs**: Environment validation
- **zod**: Schema validation