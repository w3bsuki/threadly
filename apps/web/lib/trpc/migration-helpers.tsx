'use client';

import { useState, useTransition } from 'react';
import { useMigrationFlag, trpc } from './client';
import type { ReactNode } from 'react';

// Higher-order component for gradual tRPC migration
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

// Hook for dual implementation during migration
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
        console.log(`[Migration] Using tRPC for feature: ${feature}`);
        return await trpcProcedure.mutate(input);
      } else {
        console.log(`[Migration] Using Server Action for feature: ${feature}`);
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

// Component for showing migration status in development
export function MigrationStatus({ feature }: { feature: string }) {
  const shouldUseTRPC = useMigrationFlag(feature as any);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed top-2 right-2 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-2 py-1 rounded text-xs">
      {feature}: {shouldUseTRPC ? '🚀 tRPC' : '📡 Server Action'}
    </div>
  );
}

// Error boundary specifically for tRPC errors
export function TRPCErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <div>
      {children}
      {/* TODO: Implement proper error boundary */}
    </div>
  );
}

// Hook for handling optimistic updates during migration
export function useOptimisticMigration<T>(
  initialData: T,
  serverActionFn: (data: T) => Promise<T>,
  trpcProcedure?: any,
  feature?: string
) {
  const [optimisticData, setOptimisticData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const shouldUseTRPC = feature ? useMigrationFlag(feature as any) : false;
  
  const update = async (newData: T) => {
    // Optimistic update
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