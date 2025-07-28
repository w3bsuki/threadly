'use client';

import { useUser } from '@clerk/nextjs';
import { useChannel } from '@repo/real-time/client';
import { useCallback, useEffect, useRef } from 'react';
import type { MessageEvent, TypingEvent } from '../types';

interface UseRealTimeMessagesOptions {
  conversationId: string;
  onMessageReceived?: (message: MessageEvent) => void;
  onTypingEvent?: (event: TypingEvent) => void;
  onUserOnline?: (userId: string) => void;
  onUserOffline?: (userId: string) => void;
  enabled?: boolean;
}

/**
 * Hook for managing real-time message events
 */
export function useRealTimeMessages({
  conversationId,
  onMessageReceived,
  onTypingEvent,
  onUserOnline,
  onUserOffline,
  enabled = true,
}: UseRealTimeMessagesOptions) {
  const { user } = useUser();
  const callbacksRef = useRef({
    onMessageReceived,
    onTypingEvent,
    onUserOnline,
    onUserOffline,
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onMessageReceived,
      onTypingEvent,
      onUserOnline,
      onUserOffline,
    };
  }, [onMessageReceived, onTypingEvent, onUserOnline, onUserOffline]);

  // Message event handler
  const handleMessage = useCallback(
    (data: MessageEvent) => {
      // Don't process own messages
      if (data.senderId === user?.id) return;

      callbacksRef.current.onMessageReceived?.(data);
    },
    [user?.id]
  );

  // Typing event handler
  const handleTyping = useCallback(
    (data: TypingEvent) => {
      // Don't process own typing events
      if (data.userId === user?.id) return;

      callbacksRef.current.onTypingEvent?.(data);
    },
    [user?.id]
  );

  // User presence handlers
  const handleUserOnline = useCallback((data: { userId: string }) => {
    callbacksRef.current.onUserOnline?.(data.userId);
  }, []);

  const handleUserOffline = useCallback((data: { userId: string }) => {
    callbacksRef.current.onUserOffline?.(data.userId);
  }, []);

  // Subscribe to conversation-specific channel
  const conversationChannel = enabled ? `conversation-${conversationId}` : null;

  // Subscribe to user-specific presence channel
  const presenceChannel = enabled && user ? `presence-user-${user.id}` : null;

  // Set up real-time subscriptions for conversation events
  const conversationChannelHook = useChannel(conversationChannel || '');
  const presenceChannelHook = useChannel(presenceChannel || '');

  useEffect(() => {
    if (!conversationChannel) return;

    const unsubscribeMessage = conversationChannelHook.bind(
      'new-message',
      handleMessage
    );
    const unsubscribeTyping = conversationChannelHook.bind(
      'user-typing',
      handleTyping
    );
    const unsubscribeRead = conversationChannelHook.bind(
      'message-read',
      (data: any) => {
        console.log('Message read:', data);
      }
    );

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeRead();
    };
  }, [
    conversationChannel,
    conversationChannelHook,
    handleMessage,
    handleTyping,
  ]);

  useEffect(() => {
    if (!presenceChannel) return;

    const unsubscribeOnline = presenceChannelHook.bind(
      'user-online',
      handleUserOnline
    );
    const unsubscribeOffline = presenceChannelHook.bind(
      'user-offline',
      handleUserOffline
    );

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, [
    presenceChannel,
    presenceChannelHook,
    handleUserOnline,
    handleUserOffline,
  ]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    async (isTyping: boolean) => {
      if (!(enabled && user)) return;

      try {
        await fetch('/api/real-time/typing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            isTyping,
          }),
        });
      } catch (error) {
        console.error('Failed to send typing indicator:', error);
      }
    },
    [conversationId, enabled, user]
  );

  // Send message read receipt
  const sendReadReceipt = useCallback(
    async (messageIds: string[]) => {
      if (!(enabled && user) || messageIds.length === 0) return;

      try {
        await fetch('/api/real-time/read-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            messageIds,
          }),
        });
      } catch (error) {
        console.error('Failed to send read receipt:', error);
      }
    },
    [conversationId, enabled, user]
  );

  // Join conversation room (for presence)
  const joinConversationRoom = useCallback(async () => {
    if (!(enabled && user)) return;

    try {
      await fetch('/api/real-time/join-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
        }),
      });
    } catch (error) {
      console.error('Failed to join conversation room:', error);
    }
  }, [conversationId, enabled, user]);

  // Leave conversation room
  const leaveConversationRoom = useCallback(async () => {
    if (!(enabled && user)) return;

    try {
      await fetch('/api/real-time/leave-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
        }),
      });
    } catch (error) {
      console.error('Failed to leave conversation room:', error);
    }
  }, [conversationId, enabled, user]);

  // Join conversation room on mount, leave on unmount
  useEffect(() => {
    if (enabled && conversationId) {
      joinConversationRoom();

      return () => {
        leaveConversationRoom();
      };
    }
  }, [conversationId, enabled, joinConversationRoom, leaveConversationRoom]);

  // Send typing indicator on conversation change (stop typing in previous conversation)
  useEffect(() => {
    sendTypingIndicator(false);
  }, [conversationId, sendTypingIndicator]);

  return {
    sendTypingIndicator,
    sendReadReceipt,
    joinConversationRoom,
    leaveConversationRoom,
    enabled,
    isConnected: Boolean(conversationChannel), // Simple connection status
  };
}
