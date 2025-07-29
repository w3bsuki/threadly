'use client';

import { trpc } from './client';
import { useDualImplementation, withTRPCMigration } from './migration-helpers';

// Example 1: Basic tRPC query usage
export function ProductsList() {
  const { data: products, isLoading, error } = trpc.products.list.useQuery({
    limit: 20,
    category: 'electronics'
  });
  
  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {products?.map(product => (
        <div key={product.id}>{product.title}</div>
      ))}
    </div>
  );
}

// Example 2: tRPC mutation with optimistic updates
export function AddToCartButton({ productId }: { productId: string }) {
  const utils = trpc.useUtils();
  
  const addToCart = trpc.cart.addItem.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await utils.cart.get.cancel();
      
      // Snapshot the previous value
      const previousCart = utils.cart.get.getData();
      
      // Optimistically update cart
      utils.cart.get.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: [...old.items, variables]
        };
      });
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCart) {
        utils.cart.get.setData(undefined, context.previousCart);
      }
    },
    onSettled: () => {
      // Refetch after error or success
      utils.cart.get.invalidate();
    }
  });
  
  return (
    <button 
      onClick={() => addToCart.mutate({ productId, quantity: 1 })}
      disabled={addToCart.isLoading}
    >
      {addToCart.isLoading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}

// Example 3: Migration helper usage
export function SearchComponent() {
  const searchProducts = useDualImplementation(
    // Server action fallback
    async (query: string) => {
      const response = await fetch('/api/search', {
        method: 'POST',
        body: JSON.stringify({ query })
      });
      return response.json();
    },
    // tRPC procedure (when available)
    trpc.search.products,
    'search'
  );
  
  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const query = formData.get('query') as string;
      
      try {
        const results = await searchProducts.execute(query);
        console.log('Search results:', results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }}>
      <input name="query" placeholder="Search products..." />
      <button type="submit" disabled={searchProducts.isPending}>
        {searchProducts.isPending ? 'Searching...' : 'Search'}
      </button>
      {searchProducts.isUsingTRPC && (
        <span className="text-xs text-green-600">Using tRPC</span>
      )}
    </form>
  );
}

// Example 4: Infinite scrolling with tRPC
export function InfiniteProductsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = trpc.products.infinite.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  
  if (isLoading) return <div>Loading...</div>;
  
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
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

// Example 5: Server-side data fetching helper
export async function getServerSideProps() {
  // This would be used in pages or server components
  // TODO: Implement proper server-side tRPC client
  return {
    props: {
      // trpcState: trpcSSR.dehydrate(),
    }
  };
}

// Example usage patterns for different scenarios:

// Pattern 1: Simple query
const useProducts = () => trpc.products.list.useQuery();

// Pattern 2: Query with variables
const useProduct = (id: string) => 
  trpc.products.getById.useQuery({ id }, { enabled: !!id });

// Pattern 3: Mutation with error handling
const useCreateProduct = () => {
  const utils = trpc.useUtils();
  return trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to create product:', error);
      // Could show toast notification here
    }
  });
};