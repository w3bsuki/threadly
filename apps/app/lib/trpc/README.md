# tRPC Client Integration - App Platform

This directory contains the tRPC client setup for the app platform, providing type-safe API calls optimized for seller dashboard and marketplace management features.

## Architecture Overview

The App platform tRPC setup includes:

- **Provider**: `AppTRPCProvider` - App-specific tRPC and React Query configuration
- **Client**: `trpc` - The main tRPC client instance
- **Hooks**: App-specific hooks for seller dashboard, product management, and analytics
- **Migration Helpers**: Utilities for gradual migration from existing server actions

## Quick Start

### 1. Dashboard Stats

```tsx
import { trpc } from '~/lib/trpc';

export function DashboardStats() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 5 * 60 * 1000, // Consider stale after 5 minutes
  });
  
  if (isLoading) return <div>Loading dashboard...</div>;
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3>Total Sales</h3>
        <p className="text-2xl font-bold">${stats?.totalSales || 0}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3>Active Listings</h3>
        <p className="text-2xl font-bold">{stats?.activeListings || 0}</p>
      </div>
    </div>
  );
}
```

### 2. Seller Products Management

```tsx
export function SellerProductsList({ sellerId }) {
  const { data: products, isLoading } = trpc.products.listBySeller.useQuery(
    { sellerId },
    { enabled: !!sellerId }
  );
  
  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      // Refresh seller's products and dashboard stats
      utils.products.listBySeller.invalidate({ sellerId });
      utils.dashboard.stats.invalidate();
    }
  });
  
  return (
    <div>
      {products?.map(product => (
        <div key={product.id} className="border p-4 rounded">
          <h3>{product.title}</h3>
          <p>${product.price}</p>
          <button 
            onClick={() => updateProduct.mutate({
              id: product.id,
              status: product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
            })}
          >
            Toggle Status
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 3. Orders Management with Infinite Scrolling

```tsx
export function OrdersList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = trpc.orders.list.useInfiniteQuery(
    { limit: 20, status: 'pending' },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    }
  );
  
  return (
    <div className="space-y-4">
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.orders.map(order => (
            <div key={order.id} className="border p-4 rounded">
              <h3>Order #{order.orderNumber}</h3>
              <p>Total: ${order.total}</p>
              <p>Status: {order.status}</p>
            </div>
          ))}
        </div>
      ))}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

## App Platform Specific Features

### 1. Seller Analytics

```tsx
export function SellerAnalytics() {
  const { data: analytics } = trpc.analytics.seller.useQuery(
    { timeRange: '30d' },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 60000 // Refresh every minute
    }
  );
  
  return (
    <div>
      <h2>Sales Analytics</h2>
      <p>Revenue: ${analytics?.revenue}</p>
      <p>Orders: {analytics?.orderCount}</p>
      <p>Conversion Rate: {analytics?.conversionRate}%</p>
    </div>
  );
}
```

### 2. Real-time Messages

```tsx
export function MessagesPanel({ conversationId }) {
  // Query existing messages
  const { data: messages } = trpc.messages.list.useQuery(
    { conversationId },
    { enabled: !!conversationId }
  );
  
  // Subscribe to new messages (when WebSocket support is added)
  trpc.messages.onNewMessage.useSubscription(
    { conversationId },
    {
      enabled: !!conversationId,
      onData: (newMessage) => {
        // Handle new message
        console.log('New message:', newMessage);
      }
    }
  );
  
  return (
    <div className="h-96 overflow-y-auto">
      {messages?.map(message => (
        <div key={message.id} className="p-2 border-b">
          <strong>{message.sender.name}:</strong> {message.content}
        </div>
      ))}
    </div>
  );
}
```

### 3. Bulk Operations

```tsx
export function BulkProductActions({ selectedProducts }) {
  const utils = trpc.useUtils();
  
  const bulkUpdate = trpc.products.bulkUpdate.useMutation({
    onSuccess: () => {
      // Invalidate all product-related queries
      utils.products.invalidate();
      utils.dashboard.stats.invalidate();
    }
  });
  
  const handleBulkStatusChange = (status: string) => {
    bulkUpdate.mutate({
      productIds: selectedProducts,
      updates: { status }
    });
  };
  
  return (
    <div className="flex gap-2">
      <button 
        onClick={() => handleBulkStatusChange('ACTIVE')}
        disabled={bulkUpdate.isLoading}
      >
        Activate Selected
      </button>
      <button 
        onClick={() => handleBulkStatusChange('INACTIVE')}
        disabled={bulkUpdate.isLoading}
      >
        Deactivate Selected
      </button>
    </div>
  );
}
```

## Migration from Server Actions

### Gradual Migration Approach

```tsx
import { useDualImplementation } from '~/lib/trpc/migration-helpers';

export function ProductManagementForm() {
  const updateProduct = useDualImplementation(
    // Existing server action
    async (data) => {
      'use server';
      // Server action implementation
      return await updateProductAction(data);
    },
    // New tRPC procedure
    trpc.products.update,
    'products' // Feature flag
  );
  
  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData);
      
      try {
        await updateProduct.execute(data);
        console.log('Using:', updateProduct.isUsingTRPC ? 'tRPC' : 'Server Action');
      } catch (error) {
        console.error('Update failed:', error);
      }
    }}>
      {/* Form fields */}
    </form>
  );
}
```

### Feature Flag Configuration

Control migration via environment variables:

```bash
# App platform specific features
NEXT_PUBLIC_TRPC_FEATURES=dashboard,products,orders,analytics

# Or enable all features
NEXT_PUBLIC_TRPC_FEATURES=all
```

## App-Specific Hook Patterns

### 1. Seller-Focused Hooks

```tsx
// Hook for seller's own products
const useMyProducts = () => {
  const { data: user } = trpc.auth.getUser.useQuery();
  return trpc.products.listBySeller.useQuery(
    { sellerId: user?.id },
    { enabled: !!user?.id }
  );
};

// Hook for seller analytics
const useSellerDashboard = (timeRange = '30d') => {
  return trpc.analytics.seller.useQuery(
    { timeRange },
    {
      staleTime: 5 * 60 * 1000,
      refetchInterval: 30000
    }
  );
};
```

### 2. Optimistic Updates for Better UX

```tsx
const useOptimisticProductUpdate = () => {
  const utils = trpc.useUtils();
  
  return trpc.products.update.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await utils.products.getById.cancel({ id: variables.id });
      
      // Snapshot previous value
      const previousProduct = utils.products.getById.getData({ id: variables.id });
      
      // Optimistically update
      utils.products.getById.setData({ id: variables.id }, (old) => ({
        ...old!,
        ...variables,
      }));
      
      return { previousProduct };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProduct) {
        utils.products.getById.setData(
          { id: variables.id },
          context.previousProduct
        );
      }
    },
    onSettled: (data) => {
      // Refetch to ensure consistency
      if (data) {
        utils.products.getById.invalidate({ id: data.id });
        utils.dashboard.stats.invalidate();
      }
    }
  });
};
```

## Performance Optimization

### 1. Query Caching Strategy

```tsx
// Long-lived dashboard data
const { data: stats } = trpc.dashboard.stats.useQuery(undefined, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes in cache
});

// Frequently changing order data
const { data: orders } = trpc.orders.recent.useQuery(undefined, {
  staleTime: 30 * 1000, // 30 seconds
  refetchInterval: 60000, // Refetch every minute
});
```

### 2. Background Updates

```tsx
// Keep dashboard fresh in background
const { data } = trpc.dashboard.stats.useQuery(undefined, {
  refetchInterval: 30000,
  refetchIntervalInBackground: true,
});
```

### 3. Selective Invalidation

```tsx
// After updating a product, only invalidate related queries
const updateProduct = trpc.products.update.useMutation({
  onSuccess: (updatedProduct) => {
    // Specific product
    utils.products.getById.setData({ id: updatedProduct.id }, updatedProduct);
    
    // Related lists
    utils.products.listBySeller.invalidate({ sellerId: updatedProduct.sellerId });
    utils.dashboard.stats.invalidate();
    
    // Don't invalidate unrelated data
    // utils.products.invalidate(); // ❌ Too broad
  }
});
```

## Error Handling

### App-Specific Error Handler

```tsx
import { useTRPCErrorHandler } from '~/lib/trpc/hooks';

export function useAppErrorHandler() {
  const baseHandler = useTRPCErrorHandler();
  
  return useCallback((error: any) => {
    baseHandler(error);
    
    // App-specific error handling
    if (error?.data?.code === 'SELLER_SUSPENDED') {
      // Redirect to suspension notice
      window.location.href = '/suspended';
    } else if (error?.data?.code === 'INSUFFICIENT_PERMISSIONS') {
      // Show upgrade prompt
      console.log('Show upgrade prompt');
    }
  }, [baseHandler]);
}
```

## Development Tools

### Migration Status Monitoring

```tsx
import { AppMigrationStatus } from '~/lib/trpc/migration-helpers';

export function DevelopmentTools() {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 left-4 space-y-2">
      <AppMigrationStatus feature="dashboard" />
      <AppMigrationStatus feature="products" />
      <AppMigrationStatus feature="orders" />
    </div>
  );
}
```

### Query Inspection

```tsx
// Log query states in development
const { data, isLoading, error, dataUpdatedAt } = trpc.dashboard.stats.useQuery();

if (process.env.NODE_ENV === 'development') {
  console.log('Dashboard stats:', { data, isLoading, error, dataUpdatedAt });
}
```

## Testing Considerations

### Mock tRPC Calls

```tsx
// In tests, mock tRPC calls
const mockTRPC = {
  dashboard: {
    stats: {
      useQuery: jest.fn(() => ({
        data: { totalSales: 1000, activeListings: 25 },
        isLoading: false,
        error: null
      }))
    }
  }
};
```

### Integration Testing

```tsx
// Test both server action and tRPC implementations
describe('Product Management', () => {
  it('should work with server actions', () => {
    process.env.NEXT_PUBLIC_TRPC_FEATURES = '';
    // Test server action path
  });
  
  it('should work with tRPC', () => {
    process.env.NEXT_PUBLIC_TRPC_FEATURES = 'products';
    // Test tRPC path
  });
});
```

## Next Steps

1. **Complete API Setup**: Ensure tRPC server is properly configured
2. **Authentication Integration**: Connect with your auth system
3. **Real-time Features**: Implement WebSocket subscriptions
4. **Performance Monitoring**: Add metrics for query performance
5. **Error Reporting**: Integrate with error tracking service