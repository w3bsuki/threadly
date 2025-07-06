# @repo/analytics

Comprehensive analytics tracking for Threadly's C2C fashion marketplace. This package provides multi-platform analytics integration with PostHog, Google Analytics, and Vercel Analytics for complete user behavior tracking and business insights.

## Overview

The analytics package provides robust tracking capabilities for e-commerce events:

- **Multi-Platform Analytics**: PostHog, Google Analytics, and Vercel Analytics
- **E-commerce Tracking**: Product views, cart events, checkout flow, and orders
- **User Behavior**: Navigation, search, engagement, and social interactions
- **Type Safety**: Full TypeScript support with predefined event schemas
- **Server & Client**: Both server-side and client-side tracking capabilities
- **React Integration**: Custom hooks for easy React component integration
- **Privacy Compliant**: GDPR and privacy-conscious tracking implementation

## Installation

```bash
pnpm add @repo/analytics
```

## Setup & Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# PostHog (Primary Analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_project_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Google Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Vercel Analytics is enabled automatically on Vercel deployments
```

### Provider Setup

Wrap your app with the analytics provider:

```typescript
// app/layout.tsx
import { AnalyticsProvider } from '@repo/analytics';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

## Dependencies

This package depends on:
- `@next/third-parties` - Google Analytics integration
- `@t3-oss/env-nextjs` - Environment variable validation
- `@vercel/analytics` - Vercel Analytics integration
- `posthog-js` - PostHog client-side SDK
- `posthog-node` - PostHog server-side SDK
- `react` - React framework
- `server-only` - Server-side only code protection
- `zod` - Schema validation

## API Reference

### Client-Side Tracking

```typescript
import { useAnalyticsEvents } from '@repo/analytics';

function ProductPage({ product }: { product: any }) {
  const {
    trackProductView,
    trackProductFavorite,
    trackCartAdd,
    trackPageView
  } = useAnalyticsEvents();

  useEffect(() => {
    // Track page view
    trackPageView(`/product/${product.id}`, product.title);
    
    // Track product view
    trackProductView(product);
  }, [product.id]);

  const handleAddToCart = () => {
    trackCartAdd(product);
    // Add to cart logic
  };

  const handleFavorite = (isFavorited: boolean) => {
    trackProductFavorite(product, isFavorited);
    // Favorite logic
  };

  return (
    <div>
      <h1>{product.title}</h1>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={() => handleFavorite(true)}>Favorite</button>
    </div>
  );
}
```

### Server-Side Tracking

```typescript
// app/api/orders/route.ts
import { analytics } from '@repo/analytics/posthog/server';
import { AnalyticsEvents, createOrderProperties } from '@repo/analytics/events';

export async function POST(request: Request) {
  const { userId, orderData } = await request.json();
  
  // Process order...
  const order = await createOrder(orderData);
  
  // Track order completion
  await analytics.capture({
    distinctId: userId,
    event: AnalyticsEvents.ORDER_COMPLETED,
    properties: createOrderProperties(order)
  });
  
  return Response.json({ success: true, order });
}
```

### Event Definitions

```typescript
import { 
  AnalyticsEvents,
  createProductProperties,
  createSearchProperties,
  createOrderProperties 
} from '@repo/analytics/events';

// Available events
console.log(AnalyticsEvents.PRODUCT_VIEWED);           // "Product Viewed"
console.log(AnalyticsEvents.PRODUCT_ADDED_TO_CART);    // "Product Added to Cart"
console.log(AnalyticsEvents.CHECKOUT_STARTED);         // "Checkout Started"
console.log(AnalyticsEvents.ORDER_COMPLETED);          // "Order Completed"
console.log(AnalyticsEvents.PRODUCTS_SEARCHED);        // "Products Searched"

// Property helpers
const productProps = createProductProperties(product);
const searchProps = createSearchProperties(query, resultsCount, category, filters);
const orderProps = createOrderProperties(order);
```

## Usage Examples

### Complete E-commerce Tracking

```typescript
import { useAnalyticsEvents } from '@repo/analytics';

function EcommerceTracker() {
  const {
    identify,
    trackProductView,
    trackCartAdd,
    trackCheckoutStart,
    trackOrderComplete,
    trackSearchQuery,
    trackUserSignUp
  } = useAnalyticsEvents();

  // Identify user on login
  const handleUserLogin = (user: any) => {
    identify(user.id, {
      email: user.email,
      name: user.name,
      userType: user.role,
      signupDate: user.createdAt
    });
  };

  // Track product interactions
  const handleProductView = (product: any) => {
    trackProductView(product);
  };

  // Track cart actions
  const handleAddToCart = (product: any) => {
    trackCartAdd(product);
  };

  // Track search
  const handleSearch = (query: string, results: any[]) => {
    trackSearchQuery(query, results.length);
  };

  // Track checkout flow
  const handleCheckoutStart = (cart: any) => {
    trackCheckoutStart(cart.total, cart.items.length);
  };

  // Track order completion
  const handleOrderComplete = (order: any) => {
    trackOrderComplete(order);
  };

  return (
    <div>
      {/* Your components */}
    </div>
  );
}
```

### Custom Event Tracking

```typescript
import { useAnalyticsEvents } from '@repo/analytics';

function CustomTracking() {
  const { track } = useAnalyticsEvents();

  const handleCustomAction = () => {
    track('Custom Action', {
      button_name: 'hero_cta',
      page_section: 'header',
      user_segment: 'new_visitor'
    });
  };

  const handleFeatureUsage = (featureName: string) => {
    track('Feature Used', {
      feature_name: featureName,
      timestamp: new Date().toISOString(),
      user_tier: 'premium'
    });
  };

  return (
    <div>
      <button onClick={handleCustomAction}>
        Custom Action
      </button>
      <button onClick={() => handleFeatureUsage('advanced_search')}>
        Use Advanced Search
      </button>
    </div>
  );
}
```

### Search Analytics

```typescript
import { useAnalyticsEvents } from '@repo/analytics';

function SearchPage() {
  const { trackSearchQuery, trackSearchFilters, trackLoadMore } = useAnalyticsEvents();

  const handleSearch = (query: string, results: any[], filters: any) => {
    // Track the search
    trackSearchQuery(query, results.length, filters);
  };

  const handleFilterChange = (filters: any) => {
    // Track filter usage
    trackSearchFilters(filters);
  };

  const handleLoadMore = (currentCount: number) => {
    // Track pagination
    trackLoadMore('products', currentCount);
  };

  return (
    <div>
      <SearchBox onSearch={handleSearch} />
      <SearchFilters onChange={handleFilterChange} />
      <ProductGrid />
      <button onClick={() => handleLoadMore(20)}>
        Load More
      </button>
    </div>
  );
}
```

### Cart and Checkout Tracking

```typescript
import { useAnalyticsEvents } from '@repo/analytics';

function CartCheckoutFlow() {
  const {
    trackCartView,
    trackCartAdd,
    trackCartRemove,
    trackCheckoutStart,
    trackOrderComplete
  } = useAnalyticsEvents();

  const cart = useCart();

  // Track cart view
  useEffect(() => {
    if (cart.items.length > 0) {
      trackCartView(cart.total, cart.items.length);
    }
  }, [cart.total, cart.items.length]);

  const handleAddToCart = (product: any) => {
    trackCartAdd(product);
    cart.addItem(product);
  };

  const handleRemoveFromCart = (product: any) => {
    trackCartRemove(product);
    cart.removeItem(product.id);
  };

  const handleCheckoutStart = () => {
    trackCheckoutStart(cart.total, cart.items.length);
    // Navigate to checkout
  };

  const handleOrderComplete = (order: any) => {
    trackOrderComplete(order);
    // Show success page
  };

  return (
    <div>
      <CartItems 
        items={cart.items}
        onRemove={handleRemoveFromCart}
      />
      <button onClick={handleCheckoutStart}>
        Checkout
      </button>
    </div>
  );
}
```

### Mobile-Specific Events

```typescript
import { useAnalyticsEvents } from '@repo/analytics';

function MobileApp() {
  const { trackPullToRefresh, track } = useAnalyticsEvents();

  const handlePullToRefresh = () => {
    trackPullToRefresh('product_list');
    // Refresh logic
  };

  const handleSwipeGesture = (direction: string) => {
    track('Swipe Gesture', {
      direction,
      screen: 'product_gallery'
    });
  };

  const handleAppStateChange = (state: string) => {
    track('App State Changed', {
      state,
      timestamp: Date.now()
    });
  };

  return (
    <div>
      <PullToRefresh onRefresh={handlePullToRefresh}>
        <ProductList />
      </PullToRefresh>
    </div>
  );
}
```

## Event Schema

### Product Events

```typescript
interface ProductEventProps {
  product_id: string;
  product_name: string;
  product_brand?: string;
  product_category?: string;
  product_price: number;
  product_condition?: string;
  product_size?: string;
  seller_id?: string;
  seller_name?: string;
}
```

### Search Events

```typescript
interface SearchEventProps {
  search_query: string;
  search_results_count?: number;
  search_category?: string;
  search_filters?: Record<string, any>;
}
```

### Order Events

```typescript
interface OrderEventProps {
  order_id: string;
  order_total: number;
  order_item_count: number;
  payment_method?: string;
  shipping_method?: string;
  seller_ids?: string[];
}
```

## Available Events

### Product Events
- `Product Viewed`
- `Product Quick View Opened`
- `Product Favorited` / `Product Unfavorited`
- `Product Shared`
- `Product Listed`

### Cart Events
- `Product Added to Cart`
- `Product Removed from Cart`
- `Cart Viewed`
- `Cart Cleared`

### Checkout Events
- `Checkout Started`
- `Checkout Step Completed`
- `Payment Info Entered`
- `Order Completed`
- `Order Cancelled`

### Search Events
- `Products Searched`
- `Search Results Viewed`
- `Search Filters Applied`
- `Search Filters Cleared`

### User Events
- `User Signed Up`
- `User Signed In`
- `User Signed Out`
- `Profile Updated`
- `Profile Viewed`

### Social Events
- `User Followed`
- `User Unfollowed`
- `Message Sent`
- `Message Viewed`

## Configuration

### PostHog Configuration

```typescript
// Custom PostHog configuration
import { PostHogProvider } from '@repo/analytics/posthog/client';

<PostHogProvider
  options={{
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.opt_out_capturing();
      }
    },
    capture_pageview: false, // We handle this manually
    capture_pageleave: true,
  }}
>
  {children}
</PostHogProvider>
```

### Privacy and Compliance

```typescript
import { useAnalyticsEvents } from '@repo/analytics';

function PrivacyCompliantTracking() {
  const { track } = useAnalyticsEvents();

  // Only track if user has consented
  const trackWithConsent = (event: string, properties: any) => {
    if (hasAnalyticsConsent()) {
      track(event, properties);
    }
  };

  // Anonymize sensitive data
  const trackAnonymized = (event: string, properties: any) => {
    const anonymizedProps = {
      ...properties,
      user_id: undefined, // Remove user ID
      ip_address: undefined, // Remove IP
      email: undefined, // Remove email
    };
    track(event, anonymizedProps);
  };

  return <div>/* Component */</div>;
}
```

## Error Tracking

```typescript
import { useAnalyticsEvents } from '@repo/analytics';

function ErrorTracking() {
  const { trackError } = useAnalyticsEvents();

  useEffect(() => {
    const handleError = (error: Error) => {
      trackError(error, {
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [trackError]);

  return <div>/* Component */</div>;
}
```

## Server-Side API Routes

```typescript
// app/api/analytics/track/route.ts
import { analytics } from '@repo/analytics/posthog/server';
import { auth } from '@repo/auth/server';

export async function POST(request: Request) {
  const { userId } = auth();
  const { event, properties } = await request.json();

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await analytics.capture({
    distinctId: userId,
    event,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      source: 'api'
    }
  });

  return Response.json({ success: true });
}
```

## Performance Considerations

- Events are batched and sent asynchronously
- Client-side tracking is non-blocking
- Server-side events are flushed immediately for serverless environments
- Mock analytics are used when keys are not configured
- Automatic retry logic for failed events

## Testing

```bash
# Run analytics package tests
pnpm test packages/analytics

# Test specific providers
pnpm test packages/analytics/posthog
```

## Integration Notes

This package integrates with:
- PostHog for comprehensive product analytics
- Google Analytics for web analytics
- Vercel Analytics for performance metrics
- Authentication system for user identification
- E-commerce flows for business metrics

## Privacy & GDPR

- Supports opt-out mechanisms
- Anonymization helpers included
- Cookie-less tracking options
- GDPR-compliant by design
- User consent management ready

## Version History

- `0.0.0` - Initial release with multi-platform analytics
- PostHog, Google Analytics, and Vercel integration
- Comprehensive e-commerce event tracking
- TypeScript support with type-safe events
- React hooks for easy integration