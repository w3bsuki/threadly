/**
 * Messaging package main exports
 * Core functionality for Threadly's messaging system
 */

// Components (client-side)
export * from './components';

// Hooks (client-side)
export * from './hooks';

// Types and schemas  
export type * from './types';
export { 
  sendMessageRequestSchema,
  fetchMessagesRequestSchema,
  createConversationRequestSchema,
  messageWithSenderSchema,
  conversationWithDetailsSchema,
  conversationListItemSchema,
  messagesPaginationSchema,
  messagesResponseSchema,
  sendMessageResultSchema,
  createConversationResultSchema,
  markAsReadResultSchema,
  messageEventSchema,
  typingEventSchema,
  connectionStatusSchema,
  messageStatusSchema,
  clientMessageSchema,
  quickReplyTemplateSchema,
  messageThreadContextSchema,
} from './schemas';

// Server utilities (for API routes and server actions)
export {
  getMessages,
  sendMessage,
  createConversation,
  markMessagesAsRead,
  getUserConversations,
  archiveConversation,
} from './server';

// Constants and utilities
export const MESSAGE_LIMITS = {
  MAX_LENGTH: 1000,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  PAGINATION_LIMIT: 50,
} as const;

export const CONVERSATION_STATUS = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
} as const;

// Quick reply templates
export const QUICK_REPLY_TEMPLATES = {
  GREETING: [
    'Hi! I\'m interested in this item.',
    'Hello! Is this still available?',
    'Hi there! Can you tell me more about this?',
  ],
  QUESTION: [
    'What condition is this in?',
    'Are there any flaws or defects?',
    'Can you provide more photos?',
    'What are the measurements?',
    'Is the price negotiable?',
  ],
  OFFER: [
    'Would you consider $[amount]?',
    'I can offer $[amount] for this.',
    'What\'s the lowest you\'d accept?',
  ],
  UNAVAILABLE: [
    'Sorry, this item is no longer available.',
    'This has been sold to someone else.',
    'I\'ve decided not to sell this.',
  ],
  SHIPPING: [
    'I can ship this within 1-2 business days.',
    'Shipping is included in the price.',
    'I prefer local pickup if possible.',
    'I can provide tracking information.',
  ],
} as const;

// Utility functions
export function formatMessageTime(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } else if (diffInHours < 7 * 24) {
    return messageDate.toLocaleDateString('en-US', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } else {
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}

export function getMessagePreview(content: string, maxLength = 50): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
}

export function generateOptimisticMessageId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function isImageMessage(message: { content: string; imageUrl?: string | null }): boolean {
  return Boolean(message.imageUrl) || message.content.trim() === '';
}

export function getParticipantName(
  firstName?: string | null,
  lastName?: string | null
): string {
  if (!firstName && !lastName) return 'Anonymous';
  return `${firstName || ''} ${lastName || ''}`.trim();
}

export function getInitials(
  firstName?: string | null,
  lastName?: string | null
): string {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || '?';
}