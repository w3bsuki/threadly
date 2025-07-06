'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import type { 
  UseMessagesState, 
  ClientMessage, 
  ConnectionStatus,
  MessageAction
} from '../types';

interface UseMessagesOptions {
  conversationId: string;
  autoMarkAsRead?: boolean;
  enableRealTime?: boolean;
}

/**
 * Hook for managing messages in a conversation
 */
export function useMessages({ 
  conversationId, 
  autoMarkAsRead = true,
  enableRealTime = true 
}: UseMessagesOptions) {
  const { user } = useUser();
  const [state, setState] = useState<UseMessagesState>({
    messages: [],
    loading: true,
    error: null,
    hasNextPage: false,
    isLoadingMore: false,
    connectionStatus: 'disconnected',
    typingUsers: new Set(),
  });

  const currentPageRef = useRef(1);
  const hasInitialLoadRef = useRef(false);

  // Dispatch function to handle state updates
  const dispatch = useCallback((action: MessageAction) => {
    setState(prevState => {
      switch (action.type) {
        case 'SEND_MESSAGE':
          // Add optimistic message
          const optimisticMessage: ClientMessage = {
            id: `temp-${Date.now()}`,
            conversationId,
            senderId: user?.id || '',
            content: action.payload.content,
            imageUrl: action.payload.imageUrl || null,
            read: false,
            createdAt: new Date(),
            sender: {
              id: user?.id || '',
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              imageUrl: user?.imageUrl || null,
            },
            status: 'sending',
            optimisticId: `temp-${Date.now()}`,
            isOwnMessage: true,
          };

          return {
            ...prevState,
            messages: [...prevState.messages, optimisticMessage],
          };

        case 'MESSAGE_SENT':
          // Replace optimistic message with real one
          return {
            ...prevState,
            messages: prevState.messages.map(msg => 
              msg.optimisticId && msg.content === action.payload.content
                ? { ...action.payload, status: 'sent' as const, isOwnMessage: true }
                : msg
            ),
          };

        case 'MESSAGE_RECEIVED':
          // Check if message already exists (avoid duplicates)
          const messageExists = prevState.messages.some(msg => msg.id === action.payload.id);
          if (messageExists) return prevState;

          return {
            ...prevState,
            messages: [...prevState.messages, {
              ...action.payload,
              status: 'delivered' as const,
            }],
          };

        case 'MARK_READ':
          return {
            ...prevState,
            messages: prevState.messages.map(msg =>
              action.payload.messageIds.includes(msg.id)
                ? { ...msg, read: true, status: 'read' as const }
                : msg
            ),
          };

        case 'SET_TYPING':
          return prevState; // Handled by useTypingIndicator

        case 'USER_TYPING':
          const newTypingUsers = new Set(prevState.typingUsers);
          if (action.payload.isTyping) {
            newTypingUsers.add(action.payload.userId);
          } else {
            newTypingUsers.delete(action.payload.userId);
          }
          return {
            ...prevState,
            typingUsers: newTypingUsers,
          };

        case 'CONNECTION_STATUS':
          return {
            ...prevState,
            connectionStatus: action.payload,
          };

        case 'ERROR':
          return {
            ...prevState,
            error: action.payload.message,
            loading: false,
          };

        default:
          return prevState;
      }
    });
  }, [conversationId, user]);

  // Load initial messages
  const loadMessages = useCallback(async (page = 1, append = false) => {
    try {
      if (!append) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      } else {
        setState(prev => ({ ...prev, isLoadingMore: true }));
      }

      const response = await fetch(`/api/messages?conversationId=${conversationId}&page=${page}&limit=50`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load messages');
      }

      if (data.success) {
        setState(prev => ({
          ...prev,
          messages: append 
            ? [...data.data.messages, ...prev.messages]
            : data.data.messages,
          hasNextPage: data.data.pagination.hasNextPage,
          loading: false,
          isLoadingMore: false,
          error: null,
        }));

        currentPageRef.current = page;
        hasInitialLoadRef.current = true;
      } else {
        throw new Error(data.error || 'Failed to load messages');
      }
    } catch (error) {
      dispatch({
        type: 'ERROR',
        payload: { message: error instanceof Error ? error.message : 'Failed to load messages' },
      });
      setState(prev => ({ ...prev, isLoadingMore: false }));
    }
  }, [conversationId, dispatch]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (state.isLoadingMore || !state.hasNextPage) return;
    await loadMessages(currentPageRef.current + 1, true);
  }, [state.isLoadingMore, state.hasNextPage, loadMessages]);

  // Send a message
  const sendMessage = useCallback(async (content: string, imageUrl?: string) => {
    if (!content.trim()) return;

    // Dispatch optimistic update
    dispatch({ 
      type: 'SEND_MESSAGE', 
      payload: { content: content.trim(), imageUrl } 
    });

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: content.trim(),
          imageUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ 
          type: 'MESSAGE_SENT', 
          payload: data.data.message 
        });
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      // Mark optimistic message as failed
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.content === content && msg.status === 'sending'
            ? { ...msg, status: 'failed' as const }
            : msg
        ),
      }));

      dispatch({
        type: 'ERROR',
        payload: { message: error instanceof Error ? error.message : 'Failed to send message' },
      });
    }
  }, [conversationId, dispatch]);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds?: string[]) => {
    if (!autoMarkAsRead) return;

    try {
      const unreadMessages = state.messages.filter(msg => 
        !msg.read && msg.senderId !== user?.id
      );
      
      if (unreadMessages.length === 0) return;

      const idsToMark = messageIds || unreadMessages.map(msg => msg.id);
      
      const response = await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          messageIds: idsToMark,
        }),
      });

      if (response.ok) {
        dispatch({
          type: 'MARK_READ',
          payload: { messageIds: idsToMark },
        });
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [conversationId, state.messages, user?.id, autoMarkAsRead, dispatch]);

  // Retry failed message
  const retryMessage = useCallback(async (messageId: string) => {
    const failedMessage = state.messages.find(msg => 
      msg.id === messageId && msg.status === 'failed'
    );

    if (!failedMessage) return;

    await sendMessage(failedMessage.content, failedMessage.imageUrl || undefined);
    
    // Remove failed message
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== messageId),
    }));
  }, [state.messages, sendMessage]);

  // Initialize and load messages
  useEffect(() => {
    if (conversationId && !hasInitialLoadRef.current) {
      loadMessages();
    }
  }, [conversationId, loadMessages]);

  // Auto mark as read when messages change
  useEffect(() => {
    if (autoMarkAsRead && hasInitialLoadRef.current && state.messages.length > 0) {
      const timeoutId = setTimeout(() => {
        markAsRead();
      }, 1000); // Delay to ensure user has seen the messages

      return () => clearTimeout(timeoutId);
    }
  }, [state.messages, markAsRead, autoMarkAsRead]);

  return {
    ...state,
    // Actions
    sendMessage,
    loadMoreMessages,
    markAsRead,
    retryMessage,
    refreshMessages: () => loadMessages(),
    // Utilities
    dispatch,
  };
}