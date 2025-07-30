'use client';

import { RealTimeProvider } from '@repo/features/notifications/realtime/client';
import type { ReactNode } from 'react';

interface RealTimeWrapperProps {
  children: ReactNode;
  userId: string;
}

export function RealTimeWrapper({
  children,
  userId,
}: RealTimeWrapperProps): React.JSX.Element {
  // Only enable real-time if environment variables are available
  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!(pusherKey && pusherCluster)) {
    // Fallback without real-time features
    return <>{children}</>;
  }

  return (
    <RealTimeProvider
      config={{
        pusherKey,
        pusherCluster,
        enablePresence: true,
        enableTypingIndicators: true,
      }}
      userId={userId}
    >
      {children}
    </RealTimeProvider>
  );
}
