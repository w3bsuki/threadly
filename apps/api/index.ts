/**
 * API App Exports
 * 
 * Main export file for the API application
 * Used by client apps to import tRPC types and utilities
 */

// Export tRPC types for client consumption
export type { AppRouter, Context } from './lib/trpc/types';

// Export the main router for server-side usage
export { appRouter, createTRPCContext } from './lib/trpc';