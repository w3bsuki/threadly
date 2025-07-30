// tRPC client exports
export { trpc, getTRPCClientConfig, createTRPCClient } from './client';
export type { AppRouter, RouterInputs, RouterOutputs } from './client';

// Provider exports
export { TRPCProvider } from './provider';

// Hook exports
export { 
  useTRPCErrorHandler,
  useOptimisticUpdate,
  useTRPCMutation,
  useTRPCInfiniteQuery,
  getTRPCServerSideHelpers
} from './hooks';

// Migration utilities
export { 
  createServerActionAdapter, 
  useAdaptedMutation, 
  shouldUseTRPC,
  migrationConfig,
  useMigrationFlag,
  logMigrationStatus 
} from './migration';