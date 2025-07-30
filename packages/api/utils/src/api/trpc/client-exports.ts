// Client-safe tRPC exports (no server-only dependencies)
export { trpc, getTRPCClientConfig, createTRPCClient } from './client';
export type { AppRouter, RouterInputs, RouterOutputs } from './client';

// Provider exports
export { TRPCProvider } from './provider';

// Hook exports
export { 
  useTRPCErrorHandler,
  useOptimisticUpdate,
  useTRPCMutation,
  useTRPCInfiniteQuery
} from './hooks';

// Migration utilities (client-side only)
export { 
  useAdaptedMutation, 
  shouldUseTRPC,
  migrationConfig,
  useMigrationFlag,
  logMigrationStatus 
} from './migration';