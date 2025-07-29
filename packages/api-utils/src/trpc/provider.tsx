'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { trpc } from './client';

interface TRPCProviderProps {
  children: ReactNode;
  apiUrl: string;
  enableDevtools?: boolean;
}

export function TRPCProvider({ 
  children, 
  apiUrl, 
  enableDevtools = process.env.NODE_ENV === 'development' 
}: TRPCProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors (client errors)
              if (error && typeof error === 'object' && 'status' in error) {
                const status = error.status as number;
                if (status >= 400 && status < 500) {
                  return false;
                }
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: false, // Don't retry mutations by default
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${apiUrl}/api/trpc`,
          // Add auth headers
          headers: async () => {
            try {
              // Try to get auth token - this will vary based on auth provider
              const token = typeof window !== 'undefined' 
                ? localStorage.getItem('auth-token') 
                : null;
              
              return {
                authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
              };
            } catch (error) {
              console.warn('Failed to get auth token:', error);
              return {
                'Content-Type': 'application/json',
              };
            }
          },
          // Handle errors
          fetch: async (url, options) => {
            const response = await fetch(url, options);
            
            // Handle authentication errors
            if (response.status === 401) {
              // Could trigger logout or token refresh here
              console.warn('Authentication failed - consider redirecting to login');
            }
            
            return response;
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {enableDevtools && (
          <ReactQueryDevtools 
            initialIsOpen={false} 
            position="bottom-right"
          />
        )}
      </QueryClientProvider>
    </trpc.Provider>
  );
}