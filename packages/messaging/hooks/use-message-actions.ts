'use client';

import { useUser } from '@clerk/nextjs';
import { useCallback } from 'react';

/**
 * Hook for message-related actions like creating conversations, archiving, etc.
 */
export function useMessageActions() {
  const { user } = useUser();

  // Create a conversation with a product owner
  const startConversation = useCallback(
    async (
      productId: string,
      sellerId: string,
      initialMessage: string
    ): Promise<{
      success: boolean;
      conversationId?: string;
      error?: string;
    }> => {
      if (!user) {
        return {
          success: false,
          error: 'Please sign in to start a conversation',
        };
      }

      if (user.id === sellerId) {
        return {
          success: false,
          error: 'You cannot message yourself about your own product',
        };
      }

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
          return {
            success: true,
            conversationId: data.data.conversation.id,
          };
        }
        return {
          success: false,
          error: data.error || 'Failed to start conversation',
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to start conversation',
        };
      }
    },
    [user]
  );

  // Get conversation details
  const getConversationDetails = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/messages/conversations/${conversationId}`
      );
      const data = await response.json();

      if (data.success) {
        return data.data.conversation;
      }
      throw new Error(data.error || 'Failed to get conversation details');
    } catch (error) {
      console.error('Error getting conversation details:', error);
      return null;
    }
  }, []);

  // Delete a message (if allowed)
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, []);

  // Edit a message (if allowed)
  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      try {
        const response = await fetch(`/api/messages/${messageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: newContent,
          }),
        });

        const data = await response.json();

        if (data.success) {
          return data.data.message;
        }
        throw new Error(data.error || 'Failed to edit message');
      } catch (error) {
        console.error('Error editing message:', error);
        return null;
      }
    },
    []
  );

  // Report a message
  const reportMessage = useCallback(
    async (messageId: string, reason: string, description?: string) => {
      try {
        const response = await fetch('/api/messages/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageId,
            reason,
            description,
          }),
        });

        const data = await response.json();
        return data.success;
      } catch (error) {
        console.error('Error reporting message:', error);
        return false;
      }
    },
    []
  );

  // Block user from a conversation
  const blockUser = useCallback(
    async (conversationId: string, userId: string) => {
      try {
        const response = await fetch('/api/messages/block', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            blockUserId: userId,
          }),
        });

        const data = await response.json();
        return data.success;
      } catch (error) {
        console.error('Error blocking user:', error);
        return false;
      }
    },
    []
  );

  // Search messages within conversations
  const searchMessages = useCallback(
    async (
      query: string,
      options: {
        conversationId?: string;
        dateFrom?: Date;
        dateTo?: Date;
      } = {}
    ) => {
      try {
        const searchParams = new URLSearchParams({
          query,
          ...(options.conversationId && {
            conversationId: options.conversationId,
          }),
          ...(options.dateFrom && { dateFrom: options.dateFrom.toISOString() }),
          ...(options.dateTo && { dateTo: options.dateTo.toISOString() }),
        });

        const response = await fetch(`/api/messages/search?${searchParams}`);
        const data = await response.json();

        if (data.success) {
          return data.data.results;
        }
        throw new Error(data.error || 'Failed to search messages');
      } catch (error) {
        console.error('Error searching messages:', error);
        return [];
      }
    },
    []
  );

  // Upload image for message
  const uploadMessageImage = useCallback(
    async (file: File, conversationId: string) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('conversationId', conversationId);

        const response = await fetch('/api/messages/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          return data.data.imageUrl;
        }
        throw new Error(data.error || 'Failed to upload image');
      } catch (error) {
        console.error('Error uploading message image:', error);
        return null;
      }
    },
    []
  );

  // Get quick reply templates
  const getQuickReplies = useCallback(async (category?: string) => {
    try {
      const searchParams = new URLSearchParams();
      if (category) {
        searchParams.append('category', category);
      }

      const response = await fetch(
        `/api/messages/quick-replies?${searchParams}`
      );
      const data = await response.json();

      if (data.success) {
        return data.data.templates;
      }
      throw new Error(data.error || 'Failed to get quick replies');
    } catch (error) {
      console.error('Error getting quick replies:', error);
      return [];
    }
  }, []);

  // Save custom quick reply template
  const saveQuickReply = useCallback(
    async (text: string, category: string, name: string) => {
      try {
        const response = await fetch('/api/messages/quick-replies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            category,
            name,
          }),
        });

        const data = await response.json();
        return data.success;
      } catch (error) {
        console.error('Error saving quick reply:', error);
        return false;
      }
    },
    []
  );

  // Get message statistics for user
  const getMessageStats = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/stats');
      const data = await response.json();

      if (data.success) {
        return data.data.stats;
      }
      throw new Error(data.error || 'Failed to get message stats');
    } catch (error) {
      console.error('Error getting message stats:', error);
      return null;
    }
  }, []);

  return {
    startConversation,
    getConversationDetails,
    deleteMessage,
    editMessage,
    reportMessage,
    blockUser,
    searchMessages,
    uploadMessageImage,
    getQuickReplies,
    saveQuickReply,
    getMessageStats,
  };
}
