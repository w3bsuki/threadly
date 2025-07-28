'use client';

import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTypingIndicatorOptions {
  conversationId: string;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Hook for managing typing indicators in conversations
 */
export function useTypingIndicator({
  conversationId,
  enabled = true,
  debounceMs = 1000,
}: UseTypingIndicatorOptions) {
  const { user } = useUser();
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isUserTypingRef = useRef(false);

  // Send typing status to server
  const sendTypingStatus = useCallback(
    async (typing: boolean) => {
      if (!(enabled && user?.id)) return;

      try {
        await fetch('/api/messages/typing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            isTyping: typing,
          }),
        });
      } catch (error) {
        console.error('Failed to send typing status:', error);
      }
    },
    [conversationId, enabled, user]
  );

  // Start typing
  const startTyping = useCallback(() => {
    if (!enabled || isUserTypingRef.current) return;

    isUserTypingRef.current = true;
    setIsTyping(true);
    sendTypingStatus(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to stop typing
    timeoutRef.current = setTimeout(() => {
      stopTyping();
    }, debounceMs);
  }, [enabled, sendTypingStatus, debounceMs]);

  // Stop typing
  const stopTyping = useCallback(() => {
    if (!(enabled && isUserTypingRef.current)) return;

    isUserTypingRef.current = false;
    setIsTyping(false);
    sendTypingStatus(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, [enabled, sendTypingStatus]);

  // Handle input change (automatically manages typing state)
  const handleInputChange = useCallback(
    (value: string) => {
      if (!enabled) return;

      if (value.trim() && !isUserTypingRef.current) {
        startTyping();
      } else if (!value.trim() && isUserTypingRef.current) {
        stopTyping();
      } else if (value.trim() && isUserTypingRef.current) {
        // Reset timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          stopTyping();
        }, debounceMs);
      }
    },
    [enabled, startTyping, stopTyping, debounceMs]
  );

  // Handle typing events from other users
  const handleUserTyping = useCallback(
    (userId: string, typing: boolean) => {
      if (userId === user?.id) return; // Ignore own typing events

      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (typing) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    },
    [user?.id]
  );

  // Get typing users with their info
  const getTypingUsersInfo = useCallback(async () => {
    if (typingUsers.size === 0) return [];

    try {
      const userIds = Array.from(typingUsers);
      const response = await fetch('/api/users/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.users || [];
      }
    } catch (error) {
      console.error('Failed to get typing users info:', error);
    }

    return [];
  }, [typingUsers]);

  // Format typing indicator text
  const getTypingText = useCallback(() => {
    const count = typingUsers.size;
    if (count === 0) return '';
    if (count === 1) return 'is typing...';
    if (count === 2) return 'are typing...';
    return `${count} people are typing...`;
  }, [typingUsers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (isUserTypingRef.current && enabled) {
        sendTypingStatus(false);
      }
    };
  }, [sendTypingStatus, enabled]);

  // Stop typing when conversation changes
  useEffect(() => {
    if (isUserTypingRef.current) {
      stopTyping();
    }
    setTypingUsers(new Set());
  }, [conversationId, stopTyping]);

  return {
    // Current user typing state
    isTyping,
    startTyping,
    stopTyping,
    handleInputChange,

    // Other users typing state
    typingUsers,
    typingUsersCount: typingUsers.size,
    hasTypingUsers: typingUsers.size > 0,
    getTypingText,
    getTypingUsersInfo,
    handleUserTyping,

    // Utilities
    enabled,
  };
}
