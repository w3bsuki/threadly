'use client';

import { useState, useTransition } from 'react';
import { useMigrationFlag, trpc } from './client';
import type { ReactNode } from 'react';

// Higher-order component for gradual tRPC migration (App platform)
export function withTRPCMigration<T extends Record<string, any>>(
  feature: string,
  ServerActionComponent: React.ComponentType<T>,
  TRPCComponent: React.ComponentType<T>
) {
  return function MigratedComponent(props: T) {
    const shouldUseTRPC = useMigrationFlag(feature as any);
    
    if (shouldUseTRPC) {
      return <TRPCComponent {...props} />;
    }
    
    return <ServerActionComponent {...props} />;
  };
}

// Hook for dual implementation during migration (App platform specific)
export function useDualImplementation<TInput, TOutput>(
  serverActionFn: (input: TInput) => Promise<TOutput>,
  trpcProcedure: any,
  feature: string
) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);
  const shouldUseTRPC = useMigrationFlag(feature as any);
  
  const execute = async (input: TInput): Promise<TOutput> => {
    setError(null);
    
    try {
      if (shouldUseTRPC && trpcProcedure) {
        console.log(`[App Migration] Using tRPC for feature: ${feature}`);
        return await trpcProcedure.mutate(input);
      } else {
        console.log(`[App Migration] Using Server Action for feature: ${feature}`);
        return await new Promise<TOutput>((resolve, reject) => {
          startTransition(async () => {
            try {
              const result = await serverActionFn(input);
              resolve(result);
            } catch (err) {
              reject(err);
            }
          });
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  };
  
  return {
    execute,
    isPending,
    error,
    isUsingTRPC: shouldUseTRPC,
  };
}

// App platform specific migration status
export function AppMigrationStatus({ feature }: { feature: string }) {
  const shouldUseTRPC = useMigrationFlag(feature as any);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed top-2 left-2 z-50 bg-blue-100 border border-blue-400 text-blue-800 px-2 py-1 rounded text-xs">
      App {feature}: {shouldUseTRPC ? '🚀 tRPC' : '📡 Server Action'}
    </div>
  );
}

// Hook for seller dashboard specific optimistic updates
export function useSellerOptimisticUpdate<T>(
  initialData: T,
  serverActionFn: (data: T) => Promise<T>,
  trpcProcedure?: any,
  feature?: string
) {
  const [optimisticData, setOptimisticData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const shouldUseTRPC = feature ? useMigrationFlag(feature as any) : false;
  
  const update = async (newData: T) => {
    // Optimistic update for better UX in seller flows  
    setOptimisticData(newData);
    setIsLoading(true);
    
    try {
      let result: T;
      
      if (shouldUseTRPC && trpcProcedure) {
        result = await trpcProcedure.mutate(newData);
      } else {
        result = await serverActionFn(newData);
      }
      
      setOptimisticData(result);
      return result;
    } catch (error) {
      // Rollback on error
      setOptimisticData(initialData);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    data: optimisticData,
    update,
    isLoading,
    isUsingTRPC: shouldUseTRPC,
  };
}

// Real-time data hook for app platform
export function useRealtimeMigration<T>(
  initialData: T,
  subscriptionProcedure?: any,
  pollFn?: () => Promise<T>,
  feature?: string
) {
  const [data, setData] = useState(initialData);
  const shouldUseTRPC = feature ? useMigrationFlag(feature as any) : false;
  
  // TODO: Implement real-time subscription logic
  // This would handle WebSocket connections for tRPC vs polling for server actions
  
  return {
    data,
    isUsingTRPC: shouldUseTRPC,
    isConnected: false, // TODO: Implement connection status
  };
}