import { useCallback } from 'react';
import { trpc } from './client';
import type { RouterInputs } from './client';

// Common tRPC hook patterns
export function useTRPCErrorHandler() {
  return useCallback((error: any) => {
    console.error('tRPC Error:', error);
    
    // Handle different error types
    if (error?.data?.code === 'UNAUTHORIZED') {
      // Handle auth errors
      console.warn('Unauthorized - redirecting to login');
      // Could trigger a redirect or show auth modal
    } else if (error?.data?.code === 'BAD_REQUEST') {
      // Handle validation errors
      console.warn('Bad request:', error.message);
    } else if (error?.data?.code === 'INTERNAL_SERVER_ERROR') {
      // Handle server errors
      console.error('Server error:', error.message);
    }
  }, []);
}

// Utility for optimistic updates
export function useOptimisticUpdate<T>(
  queryKey: any[],
  updater: (old: T | undefined, newData: any) => T
) {
  const utils = trpc.useUtils();
  
  return useCallback(
    (newData: any) => {
      utils.client.setQueryData(queryKey, (old: T | undefined) => 
        updater(old, newData)
      );
    },
    [utils, queryKey, updater]
  );
}

// Migration helper for server actions
export function useTRPCMutation<TInput = unknown, TOutput = unknown>(
  procedure: any,
  options?: {
    onSuccess?: (data: TOutput) => void;
    onError?: (error: any) => void;
    enableOptimistic?: boolean;
  }
) {
  const errorHandler = useTRPCErrorHandler();
  
  if (!procedure?.useMutation) {
    // Return a mock mutation object if procedure is not available
    return {
      mutate: async () => {
        throw new Error('tRPC procedure not available');
      },
      mutateAsync: async () => {
        throw new Error('tRPC procedure not available');
      },
      isLoading: false,
      error: null,
      data: undefined,
    };
  }
  
  return procedure.useMutation({
    onSuccess: options?.onSuccess,
    onError: (error: any) => {
      errorHandler(error);
      options?.onError?.(error);
    },
    // Add optimistic update support if needed
    onMutate: options?.enableOptimistic 
      ? async (variables: TInput) => {
          // Implement optimistic update logic
          console.log('Optimistic update:', variables);
        }
      : undefined,
  });
}

// Infinite query helper
export function useTRPCInfiniteQuery<TInput extends { cursor?: string }>(
  procedure: any,
  input: Omit<TInput, 'cursor'>,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) {
  return procedure.useInfiniteQuery(
    input,
    {
      getNextPageParam: (lastPage: any) => lastPage.nextCursor,
      getPreviousPageParam: (firstPage: any) => firstPage.prevCursor,
      enabled: options?.enabled,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    }
  );
}

// SSR helper
export function getTRPCServerSideHelpers(apiUrl: string) {
  return {
    // Helper to prefetch data on server
    prefetchQuery: async <T>(
      procedure: any,
      input: any
    ): Promise<T> => {
      try {
        // This would use the vanilla tRPC client
        // Implementation depends on server setup
        console.log('Prefetching:', procedure, input);
        return {} as T;
      } catch (error) {
        console.error('Prefetch error:', error);
        throw error;
      }
    },
  };
}