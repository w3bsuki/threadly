import { 
  useTRPCErrorHandler,
  useOptimisticUpdate,
  useTRPCMutation,
  useTRPCInfiniteQuery,
  useMigrationFlag,
  migrationConfig
} from '@repo/api/utils/trpc';
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

// Web-specific hooks
export function useWebTRPCUtils() {
  return trpc.useUtils();
}

// Example usage hooks for common web app patterns
export function useProductsQuery(filters?: any) {
  return trpc.products.list.useQuery(filters, {
    enabled: !!filters,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateProductMutation() {
  const utils = trpc.useUtils();
  
  return trpc.products.create.useMutation({
    onSuccess: () => {
      // Invalidate products list
      utils.products.list.invalidate();
    },
  });
}

// Cart hooks with optimistic updates
export function useAddToCartMutation() {
  const utils = trpc.useUtils();
  
  return trpc.cart.addItem.useMutation({
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await utils.cart.get.cancel();
      
      // Snapshot the previous value
      const previousCart = utils.cart.get.getData();
      
      // Optimistically update the cart
      utils.cart.get.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: [...old.items, variables],
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
      // Always refetch after error or success
      utils.cart.get.invalidate();
    },
  });
}