import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PusherClient } from './pusher-client';
import type { RealTimeClient, RealTimeConfig } from '../types';

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

export function RealTimeProvider({ children, config, userId }: RealTimeProviderProps) {
  const [client, setClient] = useState<RealTimeClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!config.pusherKey || !config.pusherCluster) {
      console.warn('[RealTime] Missing Pusher configuration');
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
    if (!client || !userId) return;

    const userChannel = `private-user-${userId}`;
    const subscription = client.subscribe(userChannel, 'connected', () => {
      console.log(`[RealTime] Subscribed to user channel: ${userChannel}`);
    });

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