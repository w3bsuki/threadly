import { trpc, createTRPCClient } from '@repo/api/utils/trpc';

// Re-export the tRPC client for web app usage
export { trpc };

// Create vanilla client for server-side usage in web app
export function createWebTRPCClient() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  return createTRPCClient(apiUrl);
}

// Web-specific tRPC utilities
export function getWebTRPCConfig() {
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
    enableDevtools: process.env.NODE_ENV === 'development',
  };
}