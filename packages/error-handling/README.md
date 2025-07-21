# @repo/error-handling

Comprehensive error handling utilities for Threadly's C2C fashion marketplace. This package provides robust error management, retry mechanisms, circuit breakers, React error boundaries, and integration with Sentry for production error monitoring.

## Overview

The error-handling package provides essential error management capabilities:

- **Error Classification**: Standardized error codes and types for consistent handling
- **API Error Handling**: Automatic error processing for Next.js API routes
- **React Error Boundaries**: Component-level error isolation and recovery
- **Retry Mechanisms**: Smart retry logic for transient failures
- **Circuit Breakers**: Protection against cascading failures
- **Logging Integration**: Comprehensive error logging and monitoring
- **Sentry Integration**: Production error tracking and alerting
- **Graceful Shutdown**: Proper cleanup on application termination

## Installation

```bash
pnpm add @repo/error-handling
```

## Dependencies

This package depends on:
- `@sentry/nextjs` - Error monitoring and performance tracking
- `p-retry` - Advanced retry functionality
- `next` - Next.js framework (for API route handling)
- `react` - React framework (for error boundaries)

## API Reference

### Core Error Handling

```typescript
import { 
  AppError, 
  ErrorCodes, 
  handleApiError, 
  withErrorHandler 
} from '@repo/error-handling/error-handler';

// Create custom application errors
throw new AppError(
  'Product not found',
  404,
  ErrorCodes.NOT_FOUND,
  true,
  { productId: 'prod_123' }
);

// Handle API errors automatically
export const GET = withErrorHandler(async (request) => {
  // Your API logic here
  const data = await fetchData();
  return NextResponse.json(data);
});

// Manual error handling in API routes
export async function POST(request: NextRequest) {
  try {
    // Your logic here
  } catch (error) {
    return handleApiError(error, request);
  }
}
```

### React Error Boundaries

```typescript
import { ErrorBoundary, withErrorBoundary } from '@repo/error-handling/error-boundary';

// Wrap components with error boundaries
function App() {
  return (
    <ErrorBoundary 
      level="app"
      onError={(error, errorInfo) => {
        console.log('App error:', error, errorInfo);
      }}
    >
      <YourAppContent />
    </ErrorBoundary>
  );
}

// Component-level error boundary
function ProductList() {
  return (
    <ErrorBoundary 
      level="component" 
      isolate={true}
      resetKeys={[productQuery]}
    >
      <ProductGrid />
    </ErrorBoundary>
  );
}

// HOC pattern
const SafeComponent = withErrorBoundary(MyComponent, {
  level: 'component',
  isolate: true
});
```

### Retry Mechanisms

```typescript
import { 
  withRetry, 
  Retry, 
  fetchWithRetry, 
  isRetryableError 
} from '@repo/error-handling/retry';

// Retry async functions
const result = await withRetry(
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('API failed');
    return response.json();
  },
  {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 10000,
    onFailedAttempt: (error) => {
      console.log(`Attempt ${error.attemptNumber} failed`);
    }
  }
);

// Class method decorator
class DataService {
  @Retry({ retries: 3, minTimeout: 500 })
  async fetchUserData(userId: string) {
    return await this.api.get(`/users/${userId}`);
  }
}

// Retry-enabled fetch
const response = await fetchWithRetry('/api/products', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
});
```

### Circuit Breaker

```typescript
import { CircuitBreaker } from '@repo/error-handling/circuit-breaker';

const breaker = new CircuitBreaker(
  async (data) => {
    // Your operation that might fail
    return await externalApiCall(data);
  },
  {
    failureThreshold: 5,
    resetTimeout: 60000,
    monitoringPeriod: 600000
  }
);

// Use circuit breaker
try {
  const result = await breaker.execute(data);
} catch (error) {
  if (breaker.state === 'OPEN') {
    console.log('Service unavailable, using fallback');
    return fallbackResponse;
  }
  throw error;
}
```

### Error Logging

```typescript
import { logError } from '@repo/error-handling/error-logger';

// Log errors with context
logError(error, {
  level: 'error',
  tags: { 
    operation: 'checkout',
    userId: user.id 
  },
  extra: {
    orderId: 'order_123',
    amount: 99.99
  },
  request: {
    url: '/api/orders',
    method: 'POST',
    headers: request.headers
  }
});
```

## Usage Examples

### Complete API Error Handling

```typescript
// app/api/products/route.ts
import { 
  withErrorHandler, 
  AppError, 
  ErrorCodes 
} from '@repo/error-handling/error-handler';
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('id');

  if (!productId) {
    throw new AppError(
      'Product ID is required',
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const product = await database.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new AppError(
      'Product not found',
      404,
      ErrorCodes.NOT_FOUND,
      true,
      { productId }
    );
  }

  if (product.status !== 'AVAILABLE') {
    throw new AppError(
      'Product is no longer available',
      409,
      ErrorCodes.PRODUCT_NOT_AVAILABLE,
      true,
      { productId, status: product.status }
    );
  }

  return NextResponse.json(product);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { userId } = auth();
  if (!userId) {
    throw new AppError(
      'Authentication required',
      401,
      ErrorCodes.UNAUTHORIZED
    );
  }

  const body = await request.json();
  
  // Validate seller verification
  const user = await database.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user?.isVerifiedSeller) {
    throw new AppError(
      'Seller verification required',
      403,
      ErrorCodes.SELLER_NOT_VERIFIED,
      true,
      { userId }
    );
  }

  const product = await database.product.create({
    data: {
      ...body,
      sellerId: user.id
    }
  });

  return NextResponse.json(product, { status: 201 });
});
```

### Resilient Data Fetching

```typescript
// lib/api-client.ts
import { 
  withRetry, 
  createRetryFetch, 
  CircuitBreaker 
} from '@repo/error-handling';

class ApiClient {
  private retryFetch = createRetryFetch({
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 5000
  });

  private circuitBreaker = new CircuitBreaker(
    async (url: string, options?: RequestInit) => {
      return this.retryFetch(url, options);
    },
    {
      failureThreshold: 3,
      resetTimeout: 30000
    }
  );

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.circuitBreaker.execute(
      `/api${endpoint}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return withRetry(
      async () => {
        const response = await fetch(`/api${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new AppError(
            errorData.error.message,
            response.status,
            errorData.error.code
          );
        }

        return response.json();
      },
      {
        retries: 2,
        shouldRetry: (error) => {
          // Don't retry client errors
          return error.statusCode >= 500;
        }
      }
    );
  }
}

export const apiClient = new ApiClient();
```

### Component Error Boundaries

```typescript
// components/ProductGrid.tsx
import { ErrorBoundary } from '@repo/error-handling/error-boundary';
import { useProducts } from '@/hooks/use-products';

function ProductGrid({ categoryId }: { categoryId: string }) {
  return (
    <ErrorBoundary 
      level="component"
      isolate={true}
      resetKeys={[categoryId]}
      onError={(error) => {
        // Track component errors
        analytics.track('Component Error', {
          component: 'ProductGrid',
          error: error.message,
          categoryId
        });
      }}
    >
      <ProductGridContent categoryId={categoryId} />
    </ErrorBoundary>
  );
}

function ProductGridContent({ categoryId }: { categoryId: string }) {
  const { products, isLoading, error } = useProducts(categoryId);

  if (isLoading) return <ProductGridSkeleton />;
  if (error) throw error; // Will be caught by error boundary

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Global Error Handler Setup

```typescript
// app/layout.tsx
import { ErrorBoundary } from '@repo/error-handling/error-boundary';
import { gracefulShutdown } from '@repo/error-handling/error-handler';

// Register cleanup handlers
gracefulShutdown.register(async () => {
  console.log('Cleaning up database connections...');
  await database.disconnect();
});

gracefulShutdown.register(async () => {
  console.log('Flushing analytics...');
  await analytics.flush();
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ErrorBoundary level="app">
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### Custom Error Pages

```typescript
// app/error.tsx
'use client';

import { ErrorPage } from '@repo/error-handling/error-pages';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      error={error}
      errorId={error.digest}
      level="page"
      onReset={reset}
    />
  );
}
```

### Error Monitoring Dashboard

```typescript
// app/admin/errors/page.tsx
import { getErrorStats } from '@repo/error-handling/error-logger';

export default async function ErrorsPage() {
  const stats = await getErrorStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Error Monitoring</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Total Errors</h3>
          <p className="text-2xl font-bold text-red-600">{stats.total}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Server Errors (5xx)</h3>
          <p className="text-2xl font-bold text-red-600">
            {Object.entries(stats.byStatusCode)
              .filter(([code]) => parseInt(code) >= 500)
              .reduce((sum, [, count]) => sum + count, 0)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Client Errors (4xx)</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {Object.entries(stats.byStatusCode)
              .filter(([code]) => parseInt(code) >= 400 && parseInt(code) < 500)
              .reduce((sum, [, count]) => sum + count, 0)}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Recent Errors</h3>
        <div className="space-y-2">
          {stats.recentErrors.map((error, index) => (
            <div key={index} className="border-l-4 border-red-500 pl-4">
              <p className="font-medium">{error.message}</p>
              <p className="text-sm text-gray-600">
                {error.statusCode} • {error.timestamp.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Error Codes

### Client Errors (4xx)
- `BAD_REQUEST` - Invalid request format
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found
- `METHOD_NOT_ALLOWED` - HTTP method not supported
- `CONFLICT` - Resource conflict
- `VALIDATION_ERROR` - Input validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

### Server Errors (5xx)
- `INTERNAL_SERVER_ERROR` - Generic server error
- `NOT_IMPLEMENTED` - Feature not implemented
- `BAD_GATEWAY` - Upstream service error
- `SERVICE_UNAVAILABLE` - Service temporarily down
- `GATEWAY_TIMEOUT` - Upstream timeout

### Business Logic Errors
- `INSUFFICIENT_FUNDS` - Payment amount issues
- `PRODUCT_NOT_AVAILABLE` - Product unavailable
- `ORDER_ALREADY_PROCESSED` - Duplicate order processing
- `SELLER_NOT_VERIFIED` - Seller verification required
- `PAYMENT_FAILED` - Payment processing failed

## Configuration

### Environment Variables

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token

# Error Reporting
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_RELEASE=1.0.0
```

### Sentry Setup

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  beforeSend(event) {
    // Filter out sensitive information
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.value?.includes('password')) {
        return null; // Don't send password-related errors
      }
    }
    return event;
  }
});
```

## Testing

```bash
# Run error handling tests
pnpm test packages/error-handling

# Test specific modules
pnpm test packages/error-handling/retry
pnpm test packages/error-handling/error-boundary
```

## Best Practices

1. **Use Specific Error Codes**: Always use appropriate error codes for better debugging
2. **Include Context**: Add relevant context to errors for easier troubleshooting
3. **Fail Fast**: Don't retry client errors (4xx status codes)
4. **Graceful Degradation**: Provide fallbacks when services are unavailable
5. **Monitor Error Rates**: Set up alerts for unusual error patterns
6. **User-Friendly Messages**: Show helpful error messages to users

## Performance Considerations

- Circuit breakers prevent cascade failures
- Retry mechanisms use exponential backoff
- Error boundaries isolate component failures
- Graceful shutdown ensures clean termination
- Error logging is asynchronous and non-blocking

## Integration Notes

This package integrates with:
- Sentry for error monitoring and alerting
- Next.js API routes for automatic error handling
- React components for error boundaries
- Logging systems for error tracking
- Analytics for error metrics

## Version History

- `0.0.0` - Initial release with comprehensive error handling
- API error handling with standardized responses
- React error boundaries with recovery mechanisms
- Retry logic with exponential backoff
- Circuit breaker pattern implementation
- Sentry integration for production monitoring