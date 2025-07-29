'use client';

import { TRPCProvider } from '@repo/api-utils/trpc';
import type { ReactNode } from 'react';

interface AppTRPCProviderProps {
  children: ReactNode;
}

export function AppTRPCProvider({ children }: AppTRPCProviderProps) {
  // Get API URL from environment
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  
  return (
    <TRPCProvider 
      apiUrl={apiUrl}
      enableDevtools={process.env.NODE_ENV === 'development'}
    >
      {children}
    </TRPCProvider>
  );
}