import { 
  useTRPCErrorHandler,
  useOptimisticUpdate,
  useTRPCMutation,
  useTRPCInfiniteQuery,
  useMigrationFlag,
  migrationConfig
} from '@repo/api/utils/api/trpc';
import { trpc } from './client';

// Re-export common hooks
export {
  useTRPCErrorHandler,
  useOptimisticUpdate,
  useTRPCMutation,
  useTRPCInfiniteQuery,
  useMigrationFlag,
  migrationConfig
};

// App-specific hooks
export function useAppTRPCUtils() {
  return trpc.useUtils();
}

// Example usage hooks for common app platform patterns
export function useDashboardStatsQuery() {
  return trpc.dashboard.stats.useQuery(undefined, {
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard stats
    refetchOnWindowFocus: false,
  });
}

export function useOrdersInfiniteQuery(filters?: any) {
  return useTRPCInfiniteQuery(
    trpc.orders.list,
    filters || {},
    {
      enabled: true,
      refetchOnWindowFocus: false,
    }
  );
}

// Seller-specific hooks for app platform
export function useSellerProductsQuery(sellerId?: string) {
  return trpc.products.listBySeller.useQuery(
    { sellerId: sellerId! },
    {
      enabled: !!sellerId,
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useUpdateProductMutation() {
  const utils = trpc.useUtils();
  
  return trpc.products.update.useMutation({
    onSuccess: (data) => {
      // Update the specific product in cache
      utils.products.getById.setData({ id: data.id }, data);
      // Invalidate related lists
      utils.products.listBySeller.invalidate();
      utils.dashboard.stats.invalidate();
    },
  });
}

// Real-time hooks for app platform
export function useMessagesSubscription(conversationId?: string) {
  // This would be implemented when WebSocket/SSE support is added
  return trpc.messages.subscribe.useSubscription(
    { conversationId: conversationId! },
    {
      enabled: !!conversationId,
    }
  );
}