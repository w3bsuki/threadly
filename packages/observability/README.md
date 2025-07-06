# @repo/observability

## Overview
Comprehensive observability package for Threadly marketplace providing error tracking (Sentry), structured logging (Logtail), performance monitoring, and marketplace-specific context tracking. Essential for production monitoring and debugging.

## Installation
```bash
pnpm add @repo/observability
```

## Setup & Configuration
Required environment variables:
```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Logtail Configuration
LOGTAIL_SOURCE_TOKEN=...

# Environment
NODE_ENV=production
```

## API Reference

### Error Tracking & Logging
```typescript
import { log, logError, parseError } from '@repo/observability/server';

// Structured logging
log('User action', { 
  userId, 
  action: 'purchase',
  productId 
});

// Error logging with context
logError('Payment failed', error, {
  userId,
  orderId,
  amount
});

// Parse error messages safely
const message = parseError(error);
```

### Sentry Initialization
```typescript
// instrumentation.ts
import { initializeSentry } from '@repo/observability';

export async function register() {
  initializeSentry();
}

// Client-side initialization
import { initializeClientSentry } from '@repo/observability';

initializeClientSentry();
```

### Marketplace Context Tracking
```typescript
import { 
  setUserContext,
  setProductContext,
  setOrderContext,
  trackSearchOperation,
  clearMarketplaceContext
} from '@repo/observability';

// Set user context for all subsequent operations
setUserContext({
  id: userId,
  email: user.email,
  role: user.role,
  plan: 'premium'
});

// Track product interactions
setProductContext({
  id: productId,
  name: product.name,
  category: product.category,
  price: product.price,
  sellerId: product.sellerId
});

// Track order context
setOrderContext({
  id: orderId,
  status: 'processing',
  amount: order.total,
  itemCount: order.items.length
});

// Track search operations
trackSearchOperation({
  query: searchQuery,
  filters: { category, priceRange },
  resultCount: results.length,
  responseTime: performance.now() - startTime
});
```

### API Monitoring
```typescript
import { withAPIMonitoring, trackDatabaseOperation } from '@repo/observability';

// Wrap API routes with monitoring
export const GET = withAPIMonitoring(
  async (request) => {
    // Your API logic
    return NextResponse.json(data);
  },
  {
    operationName: 'getProducts',
    trackPerformance: true
  }
);

// Track specific operations
await trackDatabaseOperation(
  'findProducts',
  async () => {
    return database.product.findMany({ where: filters });
  },
  { userId, filters }
);
```

### Performance Tracking
```typescript
import { 
  trackApiPerformance,
  trackPaymentOperation,
  trackImageOperation,
  trackBusinessOperation 
} from '@repo/observability';

// API performance
await trackApiPerformance('products.list', async () => {
  return fetchProducts();
});

// Payment operations
await trackPaymentOperation('stripe.charge', async () => {
  return stripe.charges.create(params);
}, { amount, currency });

// Image operations
await trackImageOperation('upload', async () => {
  return uploadToStorage(file);
}, { fileSize, mimeType });

// Business metrics
await trackBusinessOperation('checkout.complete', {
  orderId,
  amount,
  itemCount,
  paymentMethod
});
```

### Production Monitoring Utilities
```typescript
import { 
  validateMonitoringConfig,
  getProductionMonitoringConfig,
  validateProductionReadiness 
} from '@repo/observability';

// Validate monitoring setup
const isValid = validateMonitoringConfig();

// Get monitoring configuration
const config = getProductionMonitoringConfig();

// Check production readiness
const { isReady, issues } = validateProductionReadiness();
```

## Usage Examples

### Next.js Configuration
```typescript
// next.config.ts
import { withSentry, withLogging } from '@repo/observability/next-config';

const config = withLogging(
  withSentry({
    // Your Next.js config
  })
);

export default config;
```

### Error Boundary Integration
```typescript
import { ErrorBoundary } from '@sentry/nextjs';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary fallback={ErrorFallback} showDialog>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### Server Action Monitoring
```typescript
'use server';

import { log, logError, setUserContext } from '@repo/observability';

export async function createProduct(formData: FormData) {
  try {
    const user = await auth();
    setUserContext({ id: user.id, email: user.email });
    
    log('Creating product', { userId: user.id });
    
    const product = await database.product.create({ data });
    
    log('Product created', { 
      productId: product.id,
      userId: user.id 
    });
    
    return { success: true, product };
  } catch (error) {
    logError('Failed to create product', error, { userId });
    throw error;
  }
}
```

### API Route Error Handling
```typescript
import { parseError, logError } from '@repo/observability/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Process request
    return NextResponse.json({ success: true });
  } catch (error) {
    logError('API error', error, { 
      path: request.url,
      method: 'POST' 
    });
    
    const message = parseError(error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
```

### Custom Error Reporting
```typescript
import { createErrorReportingUtils } from '@repo/observability';

const { reportError, reportWarning } = createErrorReportingUtils({
  service: 'payment-processor',
  environment: 'production'
});

// Report critical errors
reportError(new Error('Payment gateway timeout'), {
  orderId,
  amount,
  gateway: 'stripe'
});

// Report warnings
reportWarning('Slow database query', {
  query: 'findProducts',
  duration: 5000
});
```

## Testing
```bash
# Type checking
pnpm typecheck

# Verify Sentry configuration
npx @sentry/wizard@latest -i nextjs
```

## Monitoring Dashboard
Access your monitoring data:
- **Sentry**: https://sentry.io/organizations/[your-org]/projects/
- **Logtail**: https://logtail.com/team/[your-team]/tail

## Best Practices

1. **Always Set Context**: Use `setUserContext` at the beginning of operations
2. **Log Structured Data**: Include relevant metadata in all log calls
3. **Track Key Operations**: Monitor database, API, and payment operations
4. **Clear Sensitive Data**: Never log passwords, tokens, or credit card info
5. **Use Error Boundaries**: Wrap components with Sentry's ErrorBoundary
6. **Monitor Performance**: Track slow operations and set up alerts

## Performance Impact
- Minimal overhead (~5ms per operation)
- Async logging doesn't block main thread
- Sampling rates configurable for high-traffic apps
- Local buffering for network efficiency

## Dependencies
- **@sentry/nextjs**: Error tracking and performance monitoring
- **@logtail/next**: Structured logging service
- **@t3-oss/env-nextjs**: Environment validation
- **server-only**: Ensure server-side only imports