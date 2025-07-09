'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRealTime } from './provider';
import type { MessageEvent, TypingEvent, NotificationEvent, PresenceEvent } from '../types';

export function useChannel(channelName: string) {
  const { client } = useRealTime();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!client || !channelName) return;

    const subscription = client.subscribe(channelName, 'pusher:subscription_succeeded', () => {
      setIsSubscribed(true);
    });

    return () => {
      subscription.unsubscribe();
      setIsSubscribed(false);
    };
  }, [client, channelName]);

  const bind = useCallback(
    (event: string, callback: (data: any) => void) => {
      if (!client || !channelName) return () => {};

      const subscription = client.subscribe(channelName, event, callback);
      return subscription.unsubscribe;
    },
    [client, channelName]
  );

  const trigger = useCallback(
    (event: string, data: any) => {
      if (!client) return;
      client.trigger(channelName, event, data);
    },
    [client, channelName]
  );

  return { isSubscribed, bind, trigger };
}

export function usePresence(channelName: string) {
  const { client } = useRealTime();
  const [members, setMembers] = useState<Map<string, any>>(new Map());
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    if (!client || !channelName) return;

    let mounted = true;

    const setupPresence = async () => {
      await client.presence.subscribe(channelName);
      
      if (mounted) {
        const currentMembers = client.presence.getMembers(channelName);
        setMembers(currentMembers);
      }
    };

    setupPresence();

    return () => {
      mounted = false;
      client.presence.unsubscribe(channelName);
    };
  }, [client, channelName]);

  return { members, myId, count: members.size };
}

export function useTypingIndicator(conversationId: string) {
  const { client } = useRealTime();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (!client || !conversationId) return;

    const channel = `private-conversation-${conversationId}`;
    const subscription = client.subscribe(channel, 'typing', (data: TypingEvent['data']) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        
        // Clear existing timeout
        const existingTimeout = typingTimeouts.current.get(data.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        if (data.isTyping) {
          next.add(data.userId);
          
          // Auto-remove after 3 seconds
          const timeout = setTimeout(() => {
            setTypingUsers(p => {
              const n = new Set(p);
              n.delete(data.userId);
              return n;
            });
            typingTimeouts.current.delete(data.userId);
          }, 3000);
          
          typingTimeouts.current.set(data.userId, timeout);
        } else {
          next.delete(data.userId);
          typingTimeouts.current.delete(data.userId);
        }
        
        return next;
      });
    });

    return () => {
      subscription.unsubscribe();
      // Clear all timeouts
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();
    };
  }, [client, conversationId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!client || !conversationId) return;
    
    client.trigger(`private-conversation-${conversationId}`, 'typing', {
      conversationId,
      userId: 'current-user', // This should come from auth context
      isTyping,
    });
  }, [client, conversationId]);

  return { typingUsers: Array.from(typingUsers), sendTyping };
}

export function useNotifications() {
  const { client } = useRealTime();
  const [notifications, setNotifications] = useState<NotificationEvent['data'][]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${window.location.origin}/api/notifications?page=1&limit=50`);
        const data = await response.json();
        
        if (response.ok) {
          setNotifications(data.data || []);
          setUnreadCount(data.meta?.unreadCount || 0);
        } else {
          console.error('Failed to fetch notifications:', data.error);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!client) return;

    const channel = 'private-user-notifications';
    const subscription = client.subscribe(channel, 'new-notification', (data: NotificationEvent['data']) => {
      setNotifications(prev => [data, ...prev]);
      if (!data.read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await fetch(`${window.location.origin}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch(`${window.location.origin}/api/notifications/read-all`, {
        method: 'PATCH',
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  };
}

export function useConnectionState() {
  const { client } = useRealTime();
  const [state, setState] = useState<string>('initialized');

  useEffect(() => {
    if (!client) return;

    // Get initial state
    setState(client.getConnectionState());

    // Subscribe to changes
    const unsubscribe = client.onConnectionStateChange(setState);

    return unsubscribe;
  }, [client]);

  return {
    state,
    isConnected: state === 'connected',
    isConnecting: state === 'connecting',
    isDisconnected: state === 'disconnected' || state === 'failed',
  };
}