import { trpc, createTRPCClient } from '@repo/utils/api/trpc';

// Re-export the tRPC client for app platform usage
export { trpc };

// Create vanilla client for server-side usage in app
export function createAppTRPCClient() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  return createTRPCClient(apiUrl);
}

// App-specific tRPC utilities
export function getAppTRPCConfig() {
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
    enableDevtools: process.env.NODE_ENV === 'development',
  };
}