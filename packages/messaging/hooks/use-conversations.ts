'use client';

import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';
import type { ConversationListItem, UseConversationsState } from '../types';

/**
 * Hook for managing user's conversations list
 */
export function useConversations() {
  const { user } = useUser();
  const [state, setState] = useState<UseConversationsState>({
    conversations: [],
    loading: true,
    error: null,
    unreadTotal: 0,
  });

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/messages/conversations');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load conversations');
      }

      if (data.success) {
        const conversations = data.data.conversations || [];
        const unreadTotal = conversations.reduce(
          (total: number, conv: ConversationListItem) =>
            total + conv.unreadCount,
          0
        );

        setState({
          conversations,
          loading: false,
          error: null,
          unreadTotal,
        });
      } else {
        throw new Error(data.error || 'Failed to load conversations');
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load conversations',
      }));
    }
  }, [user]);

  // Create a new conversation
  const createConversation = useCallback(
    async (
      productId: string,
      initialMessage: string
    ): Promise<{
      success: boolean;
      conversationId?: string;
      error?: string;
    }> => {
      try {
        const response = await fetch('/api/messages/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            initialMessage,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Refresh conversations list
          await loadConversations();
          return {
            success: true,
            conversationId: data.data.conversation.id,
          };
        }
        return {
          success: false,
          error: data.error || 'Failed to create conversation',
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to create conversation',
        };
      }
    },
    [loadConversations]
  );

  // Archive a conversation
  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/messages/conversations/${conversationId}/archive`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setState((prev) => ({
          ...prev,
          conversations: prev.conversations.filter(
            (conv) => conv.id !== conversationId
          ),
          unreadTotal:
            prev.unreadTotal -
            (prev.conversations.find((conv) => conv.id === conversationId)
              ?.unreadCount || 0),
        }));
        return { success: true };
      }
      return {
        success: false,
        error: data.error || 'Failed to archive conversation',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to archive conversation',
      };
    }
  }, []);

  // Mark conversation as read (update unread count)
  const markConversationAsRead = useCallback((conversationId: string) => {
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
      unreadTotal:
        prev.unreadTotal -
        (prev.conversations.find((conv) => conv.id === conversationId)
          ?.unreadCount || 0),
    }));
  }, []);

  // Update conversation with new message
  const updateConversationWithMessage = useCallback(
    (
      conversationId: string,
      message: {
        content: string;
        createdAt: Date;
        isOwnMessage: boolean;
      }
    ) => {
      setState((prev) => ({
        ...prev,
        conversations: prev.conversations
          .map((conv) => {
            if (conv.id === conversationId) {
              const updatedConv = {
                ...conv,
                lastMessage: message,
                updatedAt: message.createdAt,
                unreadCount: message.isOwnMessage
                  ? conv.unreadCount
                  : conv.unreadCount + 1,
              };

              return updatedConv;
            }
            return conv;
          })
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ),
        unreadTotal: prev.unreadTotal + (message.isOwnMessage ? 0 : 1),
      }));
    },
    []
  );

  // Get conversation by ID
  const getConversation = useCallback(
    (conversationId: string) => {
      return state.conversations.find((conv) => conv.id === conversationId);
    },
    [state.conversations]
  );

  // Search conversations
  const searchConversations = useCallback(
    (query: string) => {
      if (!query.trim()) return state.conversations;

      const lowercaseQuery = query.toLowerCase();
      return state.conversations.filter(
        (conv) =>
          conv.productTitle.toLowerCase().includes(lowercaseQuery) ||
          conv.otherParticipant.name.toLowerCase().includes(lowercaseQuery) ||
          conv.lastMessage?.content.toLowerCase().includes(lowercaseQuery)
      );
    },
    [state.conversations]
  );

  // Initialize
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  return {
    ...state,
    // Actions
    createConversation,
    archiveConversation,
    markConversationAsRead,
    updateConversationWithMessage,
    refreshConversations: loadConversations,
    // Utilities
    getConversation,
    searchConversations,
  };
}
