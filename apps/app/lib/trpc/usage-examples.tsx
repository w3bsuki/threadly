'use client';

import { trpc } from './client';
import { useDualImplementation, withTRPCMigration } from './migration-helpers';

// Example 1: Seller Dashboard Stats (App platform specific)
export function DashboardStats() {
  const { data: stats, isLoading, error } = trpc.dashboard.stats.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 5 * 60 * 1000, // Consider stale after 5 minutes
  });
  
  if (isLoading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error loading stats: {error.message}</div>;
  
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

// Example 2: Product Management with Optimistic Updates
export function ProductManagement() {
  const utils = trpc.useUtils();
  
  const updateProduct = trpc.products.update.useMutation({
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
      // Always refetch after error or success
      if (data) {
        utils.products.getById.invalidate({ id: data.id });
        utils.dashboard.stats.invalidate();
      }
    }
  });
  
  return (
    <button 
      onClick={() => updateProduct.mutate({ 
        id: 'product-1', 
        title: 'Updated Title',
        price: 99.99
      })}
      disabled={updateProduct.isLoading}
    >
      {updateProduct.isLoading ? 'Updating...' : 'Update Product'}
    </button>
  );
}

// Example 3: Orders Management with Infinite Scrolling
export function OrdersList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = trpc.orders.list.useInfiniteQuery(
    { 
      limit: 20,
      status: 'pending' 
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    }
  );
  
  if (isLoading) return <div>Loading orders...</div>;
  
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
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {isFetchingNextPage ? 'Loading more orders...' : 'Load More Orders'}
        </button>
      )}
    </div>
  );
}

// Example 4: Real-time Messages (App platform specific)
export function MessagesPanel({ conversationId }: { conversationId: string }) {
  // Query for existing messages
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
        console.log('New message received:', newMessage);
        // Update UI with new message
      }
    }
  );
  
  return (
    <div className="h-96 overflow-y-auto">
      {messages?.map(message => (
        <div key={message.id} className="p-2 border-b">
          <div className="font-semibold">{message.sender.name}</div>
          <div>{message.content}</div>
          <div className="text-xs text-gray-500">
            {new Date(message.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// Example 5: Migration helper for server actions
export function CreateProductForm() {
  const createProduct = useDualImplementation(
    // Server action fallback
    async (data: any) => {
      // Server action implementation
      const response = await fetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    // tRPC procedure
    trpc.products.create,
    'products'
  );
  
  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData);
      
      try {
        const result = await createProduct.execute(data);
        console.log('Product created:', result);
      } catch (error) {
        console.error('Failed to create product:', error);
      }
    }}>
      <input name="title" placeholder="Product title" required />
      <input name="price" type="number" placeholder="Price" required />
      <textarea name="description" placeholder="Description" />
      
      <button 
        type="submit" 
        disabled={createProduct.isPending}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        {createProduct.isPending ? 'Creating...' : 'Create Product'}
      </button>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-2">
          Using: {createProduct.isUsingTRPC ? 'tRPC' : 'Server Action'}
        </div>
      )}
    </form>
  );
}

// Common patterns for app platform:

// Pattern 1: Seller-specific queries
const useSellerProducts = (sellerId: string) => 
  trpc.products.listBySeller.useQuery(
    { sellerId }, 
    { enabled: !!sellerId }
  );

// Pattern 2: Analytics queries with caching
const useSellerAnalytics = (timeRange: string) =>
  trpc.analytics.seller.useQuery(
    { timeRange },
    { 
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  );

// Pattern 3: Batch operations
const useBulkUpdateProducts = () => {
  const utils = trpc.useUtils();
  return trpc.products.bulkUpdate.useMutation({
    onSuccess: () => {
      // Invalidate all product-related queries
      utils.products.invalidate();
      utils.dashboard.stats.invalidate();
    }
  });
};