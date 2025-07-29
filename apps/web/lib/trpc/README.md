# tRPC Client Integration - Web App

This directory contains the tRPC client setup for the web application, providing type-safe API calls with React Query integration.

## Architecture Overview

The tRPC client is set up with the following components:

- **Provider**: `WebTRPCProvider` - Wraps the app with tRPC and React Query providers
- **Client**: `trpc` - The main tRPC client instance
- **Hooks**: Custom hooks for common patterns and migration helpers
- **Migration Helpers**: Utilities for gradual migration from server actions

## Quick Start

### 1. Basic Query

```tsx
import { trpc } from '~/lib/trpc';

export function ProductsList() {
  const { data, isLoading, error } = trpc.products.list.useQuery({
    limit: 20,
    category: 'electronics'
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.map(product => (
        <div key={product.id}>{product.title}</div>
      ))}
    </div>
  );
}
```

### 2. Mutation with Optimistic Updates

```tsx
export function AddToCartButton({ productId }) {
  const utils = trpc.useUtils();
  
  const addToCart = trpc.cart.addItem.useMutation({
    onMutate: async (variables) => {
      await utils.cart.get.cancel();
      const previousCart = utils.cart.get.getData();
      
      utils.cart.get.setData(undefined, (old) => ({
        ...old,
        items: [...old.items, variables]
      }));
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        utils.cart.get.setData(undefined, context.previousCart);
      }
    },
    onSettled: () => {
      utils.cart.get.invalidate();
    }
  });
  
  return (
    <button onClick={() => addToCart.mutate({ productId, quantity: 1 })}>
      Add to Cart
    </button>
  );
}
```

### 3. Infinite Queries

```tsx
export function InfiniteProductsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = trpc.products.infinite.useInfiniteQuery(
    { limit: 10 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  
  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.products.map(product => (
            <div key={product.id}>{product.title}</div>
          ))}
        </div>
      ))}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>
          Load More
        </button>
      )}
    </div>
  );
}
```

## Migration from Server Actions

### Using Migration Helpers

The `useDualImplementation` hook allows gradual migration:

```tsx
import { useDualImplementation } from '~/lib/trpc/migration-helpers';

export function CreateProductForm() {
  const createProduct = useDualImplementation(
    // Server action fallback
    async (data) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    // tRPC procedure
    trpc.products.create,
    'products' // Feature flag name
  );
  
  const handleSubmit = async (data) => {
    const result = await createProduct.execute(data);
    console.log('Created:', result);
    console.log('Using:', createProduct.isUsingTRPC ? 'tRPC' : 'Server Action');
  };
}
```

### Feature Flags

Control which features use tRPC via environment variables:

```bash
# Enable tRPC for specific features
NEXT_PUBLIC_TRPC_FEATURES=products,cart,orders

# Enable tRPC for all features  
NEXT_PUBLIC_TRPC_FEATURES=all
```

### Component Migration

Use the HOC for component-level migration:

```tsx
import { withTRPCMigration } from '~/lib/trpc/migration-helpers';

const ServerActionComponent = ({ data }) => {
  // Old server action implementation
  return <div>Server Action: {data}</div>;
};

const TRPCComponent = ({ data }) => {
  // New tRPC implementation
  const { data: trpcData } = trpc.getData.useQuery();
  return <div>tRPC: {trpcData}</div>;
};

export const MigratedComponent = withTRPCMigration(
  'feature-name',
  ServerActionComponent,
  TRPCComponent
);
```

## Error Handling

### Global Error Handler

```tsx
import { useTRPCErrorHandler } from '~/lib/trpc/hooks';

export function MyComponent() {
  const handleError = useTRPCErrorHandler();
  
  const mutation = trpc.something.useMutation({
    onError: handleError
  });
}
```

### Error Boundaries

Wrap components with tRPC error boundaries:

```tsx
import { TRPCErrorBoundary } from '~/lib/trpc/migration-helpers';

export function App() {
  return (
    <TRPCErrorBoundary fallback={<div>Something went wrong</div>}>
      <MyTRPCComponent />
    </TRPCErrorBoundary>
  );
}
```

## Performance Best Practices

### 1. Query Configuration

```tsx
// Set appropriate stale times
const { data } = trpc.products.list.useQuery(filters, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
  retry: 3
});
```

### 2. Optimistic Updates

```tsx
// Use optimistic updates for better UX
const mutation = trpc.updateProduct.useMutation({
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await utils.products.getById.cancel({ id: variables.id });
    
    // Optimistically update
    utils.products.getById.setData({ id: variables.id }, variables);
  }
});
```

### 3. Selective Invalidation

```tsx
// Invalidate specific queries instead of all
utils.products.getById.invalidate({ id: productId }); // ✅ Good
utils.products.invalidate(); // ⚠️  Invalidates all product queries
```

## Development Tools

### React Query Devtools

The devtools are automatically enabled in development mode. Access them via the floating icon in the bottom-right corner.

### Migration Status

In development, see which implementation is being used:

```tsx
import { MigrationStatus } from '~/lib/trpc/migration-helpers';

export function MyComponent() {
  return (
    <div>
      <MigrationStatus feature="products" />
      {/* Your component */}
    </div>
  );
}
```

## Common Patterns

### 1. Dependent Queries

```tsx
const { data: user } = trpc.auth.getUser.useQuery();
const { data: orders } = trpc.orders.list.useQuery(
  { userId: user?.id },
  { enabled: !!user?.id }
);
```

### 2. Background Refetching

```tsx
const { data } = trpc.products.list.useQuery(filters, {
  refetchInterval: 30000, // Refetch every 30 seconds
  refetchIntervalInBackground: true
});
```

### 3. Suspense Support

```tsx
// Enable suspense mode
const { data } = trpc.products.list.useSuspenseQuery(filters);

// Wrap with Suspense boundary
<Suspense fallback={<Loading />}>
  <ProductsList />
</Suspense>
```

## Troubleshooting

### Common Issues

1. **Network Errors**: Check API URL configuration in environment variables
2. **Type Errors**: Ensure tRPC router types are properly imported
3. **Hydration Issues**: Use `ssr: false` for client-only queries
4. **Memory Leaks**: Always cleanup subscriptions in useEffect cleanup

### Debug Mode

Enable debug logging:

```tsx
// In development, log all tRPC calls
if (process.env.NODE_ENV === 'development') {
  trpc.products.list.useQuery.debug = true;
}
```

## Next Steps

1. **Server Setup**: Ensure the tRPC server is properly configured in `apps/api`
2. **Type Safety**: Import proper router types from the API
3. **Authentication**: Integrate with your auth system for protected routes
4. **Subscriptions**: Add WebSocket support for real-time features
5. **Caching**: Implement Redis caching for better performance