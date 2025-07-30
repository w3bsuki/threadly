import { createTRPCReact } from '@trpc/react-query';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// Define the AppRouter type - this will be imported from apps/api when available
export type AppRouter = any; // TODO: Replace with actual router type from apps/api

// Create the tRPC React client
export const trpc = createTRPCReact<AppRouter>();

// Helper to get auth token (will be overridden by app-specific implementations)
async function getAuthToken(): Promise<string | null> {
  try {
    // Try to get token from localStorage (client-side)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    // Server-side would need different approach
    return null;
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    return null;
  }
}

// Client configuration
export function getTRPCClientConfig(apiUrl: string, customAuthFn?: () => Promise<string | null>) {
  const authFn = customAuthFn || getAuthToken;
  
  return {
    links: [
      httpBatchLink({
        url: `${apiUrl}/api/trpc`,
        headers: async () => {
          const token = await authFn();
          return {
            authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          };
        },
      }),
    ],
  };
}

// Create vanilla client for server-side usage
export function createTRPCClient(apiUrl: string, customAuthFn?: () => Promise<string | null>) {
  const authFn = customAuthFn || getAuthToken;
  
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${apiUrl}/api/trpc`,
        headers: async () => {
          const token = await authFn();
          return {
            authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          };
        },
      }),
    ],
  });
}

// Type helpers
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;