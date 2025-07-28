'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { RealTimeClient, RealTimeConfig } from '../types';
import { PusherClient } from './pusher-client';

interface RealTimeContextValue {
  client: RealTimeClient | null;
  isConnected: boolean;
}

const RealTimeContext = createContext<RealTimeContextValue>({
  client: null,
  isConnected: false,
});

interface RealTimeProviderProps {
  children: ReactNode;
  config: RealTimeConfig;
  userId?: string;
}

export function RealTimeProvider({
  children,
  config,
  userId,
}: RealTimeProviderProps) {
  const [client, setClient] = useState<RealTimeClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!(config.pusherKey && config.pusherCluster)) {
      return;
    }

    const pusherClient = new PusherClient(config);
    setClient(pusherClient);

    // Monitor connection state
    const unsubscribe = pusherClient.onConnectionStateChange((state) => {
      setIsConnected(state === 'connected');
    });

    return () => {
      unsubscribe();
      pusherClient.disconnect();
    };
  }, [config.pusherKey, config.pusherCluster]);

  // Subscribe to user-specific channels when userId changes
  useEffect(() => {
    if (!(client && userId)) return;

    const userChannel = `private-user-${userId}`;
    const subscription = client.subscribe(userChannel, 'connected', () => {});

    return () => {
      subscription.unsubscribe();
    };
  }, [client, userId]);

  return (
    <RealTimeContext.Provider value={{ client, isConnected }}>
      {children}
    </RealTimeContext.Provider>
  );
}

export function useRealTime() {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
}
