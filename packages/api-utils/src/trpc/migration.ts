import { trpc } from './client';

// Helper to gradually migrate from server actions to tRPC
export function createServerActionAdapter<TInput, TOutput>(
  serverAction: (input: TInput) => Promise<TOutput>,
  trpcProcedure?: any,
  options?: {
    preferTRPC?: boolean;
    fallbackToServerAction?: boolean;
  }
) {
  return async (input: TInput): Promise<TOutput> => {
    const { preferTRPC = false, fallbackToServerAction = true } = options || {};
    
    // If tRPC procedure is available and preferred, use it
    if (trpcProcedure && preferTRPC) {
      try {
        return await trpcProcedure.mutate(input);
      } catch (error) {
        console.warn('tRPC call failed, falling back to server action:', error);
        if (fallbackToServerAction) {
          return await serverAction(input);
        }
        throw error;
      }
    }
    
    // Otherwise use server action
    return await serverAction(input);
  };
}

// Hook version for React components
export function useAdaptedMutation<TInput, TOutput>(
  serverAction: (input: TInput) => Promise<TOutput>,
  trpcProcedure?: any,
  options?: {
    preferTRPC?: boolean;
    fallbackToServerAction?: boolean;
    onSuccess?: (data: TOutput) => void;
    onError?: (error: any) => void;
  }
) {
  const adapter = createServerActionAdapter(serverAction, trpcProcedure, options);
  
  return {
    mutate: adapter,
    // Add React Query-like interface
    mutateAsync: adapter,
    isLoading: false, // TODO: Implement loading state
    error: null, // TODO: Implement error state
  };
}

// Feature flag helper for migration
export function shouldUseTRPC(feature: string): boolean {
  // This could read from feature flags, environment variables, etc.
  const trpcFeatures = process.env.NEXT_PUBLIC_TRPC_FEATURES?.split(',') || [];
  return trpcFeatures.includes(feature) || trpcFeatures.includes('all');
}

// Batch migration helper
export const migrationConfig = {
  // Define which features should use tRPC
  features: {
    products: shouldUseTRPC('products'),
    cart: shouldUseTRPC('cart'),
    orders: shouldUseTRPC('orders'),
    messages: shouldUseTRPC('messages'),
    favorites: shouldUseTRPC('favorites'),
  } as const,
  
  // Helper to check if a feature should use tRPC
  isEnabled: (feature: keyof typeof migrationConfig.features) => {
    return migrationConfig.features[feature];
  },
};

// Type-safe feature flag checker
export function useMigrationFlag<T extends keyof typeof migrationConfig.features>(
  feature: T
): boolean {
  return migrationConfig.isEnabled(feature);
}

// Development helper to log migration status
export function logMigrationStatus() {
  if (process.env.NODE_ENV === 'development') {
    console.group('🚀 tRPC Migration Status');
    Object.entries(migrationConfig.features).forEach(([feature, enabled]) => {
      console.log(`${feature}:`, enabled ? '✅ tRPC' : '📡 Server Actions');
    });
    console.groupEnd();
  }
}