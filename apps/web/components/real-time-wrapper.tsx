'use client';

import { RealTimeProvider } from '@repo/real-time/src/client/provider';
import { useUser } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface RealTimeWrapperProps {
  children: ReactNode;
}

export function RealTimeWrapper({ children }: RealTimeWrapperProps) {
  const { user } = useUser();

  const config = {
    pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
    pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
    authEndpoint: '/api/real-time/auth',
  };

  return (
    <RealTimeProvider config={config} userId={user?.id}>
      {children}
    </RealTimeProvider>
  );
}