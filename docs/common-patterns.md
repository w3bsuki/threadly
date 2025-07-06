# Common Integration Patterns

This document identifies and explains recurring integration patterns used throughout the Threadly marketplace monorepo. These patterns ensure consistency, maintainability, and follow Next-Forge best practices.

## Table of Contents

1. [Auth + Database Pattern](#auth--database-pattern)
2. [Cache-Aside Pattern](#cache-aside-pattern)
3. [Service Layer Pattern](#service-layer-pattern)
4. [Error Boundary Pattern](#error-boundary-pattern)
5. [Validation Pipeline Pattern](#validation-pipeline-pattern)
6. [Real-time Event Pattern](#real-time-event-pattern)
7. [Search Integration Pattern](#search-integration-pattern)
8. [Monitoring Wrapper Pattern](#monitoring-wrapper-pattern)
9. [Rate Limiting Pattern](#rate-limiting-pattern)
10. [Transaction Coordination Pattern](#transaction-coordination-pattern)

## Auth + Database Pattern

### Overview
The most common pattern in the codebase - integrating Clerk authentication with database operations.

### Pattern Structure
```typescript
// 1. Verify authentication
const user = await currentUser();
if (!user) redirect('/sign-in');

// 2. Get or create database user
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

// 3. Use database user ID for operations
const result = await database.someTable.create({
  data: {
    userId: dbUser.id, // Always use database ID
    // ... other fields
  }
});
```

### Usage Examples
- **Product Creation**: `apps/app/app/(authenticated)/selling/new/actions/create-product.ts`
- **Message Sending**: `packages/messaging/server.ts`
- **Order Creation**: `apps/app/app/(authenticated)/buying/checkout/actions/create-order.ts`

### Best Practices
1. Always check for `null` user
2. Handle database user creation gracefully
3. Use database user ID, never Clerk ID for foreign keys
4. Cache user lookups when possible

## Cache-Aside Pattern

### Overview
Standard caching pattern where application manages cache directly - check cache first, fallback to source, then update cache.

### Pattern Structure
```typescript
class ServiceWithCache {
  private cache = getCacheService();

  async getData(key: string): Promise<Data> {
    // 1. Try cache first
    const cached = await this.cache.get(key);
    if (cached) return cached;

    // 2. Fallback to source (database/API)
    const data = await this.fetchFromSource(key);

    // 3. Update cache for next time
    await this.cache.set(key, data, { ttl: CACHE_TTL.MEDIUM });

    return data;
  }

  // Convenience method using cache.remember()
  async getDataWithRemember(key: string): Promise<Data> {
    return this.cache.remember(
      key,
      () => this.fetchFromSource(key),
      CACHE_TTL.MEDIUM
    );
  }
}
```

### Usage Examples
- **Search Results**: `packages/search/src/search-service.ts`
- **Product Data**: `packages/commerce/products/queries.ts`
- **User Profiles**: `packages/cache/src/cache-service.ts`

### Cache Invalidation Pattern
```typescript
// On updates, invalidate related cache
async updateProduct(productId: string, updates: ProductUpdate) {
  const product = await database.product.update({
    where: { id: productId },
    data: updates
  });

  // Invalidate related cache entries
  await Promise.all([
    this.cache.del(CACHE_KEYS.PRODUCT(productId)),
    this.cache.invalidateByTag(CACHE_TAGS.PRODUCTS),
    this.searchService.reindexProduct(productId)
  ]);

  return product;
}
```

## Service Layer Pattern

### Overview
Encapsulation of business logic into service classes that integrate multiple packages.

### Pattern Structure
```typescript
export class BusinessService {
  private database = database;
  private cache = getCacheService();
  private search = getSearchService();

  async performBusinessOperation(data: InputData): Promise<Result> {
    // 1. Validate input
    const validated = businessSchema.parse(data);

    // 2. Check cache
    const cacheKey = `business:${data.id}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    // 3. Database transaction
    const result = await this.database.$transaction(async (tx) => {
      const entity = await tx.entity.create({ data: validated });
      await tx.audit.create({ 
        data: { entityId: entity.id, action: 'CREATE' }
      });
      return entity;
    });

    // 4. Update search index
    await this.search.indexEntity(result.id);

    // 5. Cache result
    await this.cache.set(cacheKey, result, { ttl: CACHE_TTL.LONG });

    return result;
  }
}
```

### Usage Examples
- **MarketplaceSearchService**: `packages/search/src/search-service.ts`
- **MarketplaceCacheService**: `packages/cache/src/cache-service.ts`
- **MessagingService**: `packages/messaging/server.ts`

## Error Boundary Pattern

### Overview
Comprehensive error handling that integrates logging, monitoring, and user-friendly responses.

### Pattern Structure
```typescript
export function withErrorBoundary<T extends any[]>(
  operation: (...args: T) => Promise<any>,
  context: string
) {
  return async (...args: T) => {
    try {
      return await operation(...args);
    } catch (error) {
      // 1. Log error with context
      logError(`${context} failed:`, error);

      // 2. Capture for monitoring
      withScope((scope) => {
        scope.setTag('operation', context);
        scope.setLevel('error');
        captureException(error);
      });

      // 3. Return user-friendly error
      if (error instanceof ValidationError) {
        return { success: false, error: error.message };
      }

      if (error instanceof DatabaseError) {
        return { success: false, error: 'Database operation failed' };
      }

      return { success: false, error: 'An unexpected error occurred' };
    }
  };
}
```

### Usage Examples
- **API Route Wrapper**: `packages/observability/api-monitoring.ts`
- **Database Operations**: `packages/error-handling/api-wrapper.ts`
- **Message Sending**: `packages/messaging/server.ts`

## Validation Pipeline Pattern

### Overview
Multi-stage validation combining schema validation, sanitization, and security checks.

### Pattern Structure
```typescript
export async function validateAndSanitize<T>(
  input: unknown,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    // 1. Schema validation
    const validated = schema.parse(input);

    // 2. Security sanitization
    const sanitized = deepSanitize(validated);

    // 3. Business rule validation
    const businessValidated = await validateBusinessRules(sanitized);

    return { success: true, data: businessValidated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: `Validation failed: ${error.errors[0]?.message}` 
      };
    }
    
    return { success: false, error: 'Validation failed' };
  }
}

// Helper for deep sanitization
function deepSanitize<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeForDisplay(obj) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(deepSanitize) as T;
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      (sanitized as any)[key] = deepSanitize(value);
    }
    return sanitized;
  }
  
  return obj;
}
```

### Usage Examples
- **Product Creation**: `apps/app/app/(authenticated)/selling/new/actions/create-product.ts`
- **Message Validation**: `packages/messaging/server.ts`
- **User Profile Updates**: `apps/app/app/(authenticated)/profile/actions/profile-actions.ts`

## Real-time Event Pattern

### Overview
Pattern for coordinating real-time events with database updates and cache invalidation.

### Pattern Structure
```typescript
export async function performOperationWithRealTime<T>(
  operation: () => Promise<T>,
  eventData: EventData
): Promise<T> {
  // 1. Perform database operation
  const result = await operation();

  // 2. Send real-time notification
  try {
    const pusher = getPusherServer(config);
    await pusher.trigger(eventData.channel, eventData.event, {
      ...eventData.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Don't fail main operation if real-time fails
    logError('Real-time notification failed:', error);
  }

  // 3. Invalidate relevant cache
  if (eventData.cacheKeys) {
    await Promise.all(
      eventData.cacheKeys.map(key => cache.del(key))
    );
  }

  return result;
}
```

### Usage Examples
- **Message Sending**: `packages/messaging/server.ts`
- **Order Updates**: Order status changes
- **Product Updates**: Inventory changes

## Search Integration Pattern

### Overview
Pattern for keeping search index synchronized with database changes.

### Pattern Structure
```typescript
export async function updateWithSearchSync<T>(
  databaseOperation: () => Promise<T>,
  searchUpdate: (result: T) => Promise<void>
): Promise<T> {
  // 1. Perform database operation
  const result = await databaseOperation();

  // 2. Update search index (non-blocking)
  searchUpdate(result).catch(error => {
    logError('Search index update failed:', error);
    // Queue for retry or manual reindex
  });

  return result;
}

// Specific implementation for products
export async function updateProductWithSearch(
  productId: string,
  updates: ProductUpdate
): Promise<Product> {
  return updateWithSearchSync(
    () => database.product.update({
      where: { id: productId },
      data: updates,
      include: { seller: true, images: true, category: true }
    }),
    async (product) => {
      const searchService = getSearchService();
      await searchService.indexProduct(product.id);
    }
  );
}
```

### Usage Examples
- **Product Updates**: Product management actions
- **User Profile Changes**: Search index updates
- **Category Changes**: Bulk reindexing

## Monitoring Wrapper Pattern

### Overview
Consistent monitoring and performance tracking across operations.

### Pattern Structure
```typescript
export function withMonitoring<T extends any[]>(
  operation: (...args: T) => Promise<any>,
  operationName: string,
  tags: Record<string, string> = {}
) {
  return async (...args: T) => {
    const startTime = Date.now();
    
    return withScope(async (scope) => {
      // Set monitoring context
      scope.setTag('operation', operationName);
      Object.entries(tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });

      try {
        const result = await operation(...args);
        const duration = Date.now() - startTime;
        
        // Log successful operation
        log.info(`${operationName} completed`, {
          operation: operationName,
          duration,
          success: true,
          ...tags
        });

        scope.setTag('success', 'true');
        scope.setTag('duration', duration.toString());

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        // Log failed operation
        logError(`${operationName} failed:`, error);
        
        scope.setTag('success', 'false');
        scope.setTag('duration', duration.toString());
        scope.setLevel('error');
        
        captureException(error);
        throw error;
      }
    });
  };
}
```

### Usage Examples
- **Database Operations**: `packages/observability/api-monitoring.ts`
- **External API Calls**: Stripe, Algolia operations
- **Business Logic**: Complex multi-step operations

## Rate Limiting Pattern

### Overview
Consistent rate limiting across API endpoints with proper error handling.

### Pattern Structure
```typescript
export async function withRateLimit(
  request: NextRequest,
  rateLimiter: RateLimiter,
  operation: () => Promise<NextResponse>
): Promise<NextResponse> {
  // 1. Check rate limit
  const rateLimitResult = await checkRateLimit(rateLimiter, request);
  
  if (!rateLimitResult.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter
      }),
      { 
        status: 429,
        headers: rateLimitResult.headers
      }
    );
  }

  // 2. Perform operation
  const response = await operation();

  // 3. Add rate limit headers to response
  if (rateLimitResult.remaining !== undefined) {
    response.headers.set('X-RateLimit-Remaining', 
      rateLimitResult.remaining.toString()
    );
  }

  return response;
}
```

### Usage Examples
- **API Routes**: All public endpoints
- **Authentication**: Login/register endpoints
- **Upload Operations**: File upload endpoints

## Transaction Coordination Pattern

### Overview
Pattern for coordinating database transactions with external service calls.

### Pattern Structure
```typescript
export async function coordinatedTransaction<T>(
  databaseOps: (tx: PrismaTransaction) => Promise<T>,
  externalOps: (result: T) => Promise<void>,
  rollbackOps?: (result: T) => Promise<void>
): Promise<T> {
  let result: T;
  
  // 1. Database transaction
  try {
    result = await database.$transaction(databaseOps);
  } catch (error) {
    logError('Database transaction failed:', error);
    throw error;
  }

  // 2. External operations
  try {
    await externalOps(result);
    return result;
  } catch (error) {
    // 3. Rollback if external operations fail
    logError('External operations failed, attempting rollback:', error);
    
    if (rollbackOps) {
      try {
        await rollbackOps(result);
      } catch (rollbackError) {
        logError('Rollback failed:', rollbackError);
        // Alert monitoring - critical state
      }
    }
    
    throw error;
  }
}
```

### Usage Examples
- **Payment Processing**: Database + Stripe coordination
- **Order Creation**: Inventory + payment processing
- **Product Creation**: Database + search indexing

## Pattern Usage Guidelines

### When to Use Each Pattern

#### Auth + Database Pattern
- **Use**: Any authenticated operation requiring database access
- **Don't Use**: Public endpoints or client-side operations

#### Cache-Aside Pattern  
- **Use**: Expensive database queries, search results, computed data
- **Don't Use**: Frequently changing data, simple lookups

#### Service Layer Pattern
- **Use**: Complex business logic, multi-package coordination
- **Don't Use**: Simple CRUD operations, direct database access

#### Error Boundary Pattern
- **Use**: All external integrations, user-facing operations
- **Don't Use**: Internal utility functions (use regular try/catch)

#### Validation Pipeline Pattern
- **Use**: User input, external data, security-sensitive operations
- **Don't Use**: Internal data transformations, trusted sources

### Performance Considerations

1. **Caching**: Implement at pattern boundaries
2. **Monitoring**: Add to all public-facing patterns
3. **Rate Limiting**: Apply to all external-facing patterns
4. **Transaction Scope**: Keep database transactions minimal

### Testing Patterns

1. **Mock External Dependencies**: At pattern boundaries
2. **Test Error Scenarios**: For each error boundary
3. **Integration Tests**: For complex pattern combinations
4. **Performance Tests**: For cached patterns

### Anti-Patterns to Avoid

1. **Direct Database Access**: Always use the auth + database pattern
2. **Inconsistent Error Handling**: Use error boundary pattern
3. **Missing Validation**: Always validate user input
4. **Circular Dependencies**: Follow layer architecture
5. **Tight Coupling**: Use service layer for coordination

## Pattern Evolution

### Version 1.0 Patterns
- Basic auth + database integration
- Simple cache-aside implementation
- Manual error handling

### Version 2.0 Patterns (Current)
- Comprehensive monitoring integration
- Standardized validation pipeline
- Real-time event coordination
- Advanced rate limiting

### Version 3.0 Patterns (Planned)
- Circuit breaker integration
- Advanced caching strategies
- Distributed transaction coordination
- ML-powered pattern optimization