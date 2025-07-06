/**
 * Messaging types for the Threadly marketplace
 */

import type { User, Product, Message, Conversation } from '@repo/database';

// Base Message type with relations
export type MessageWithSender = Message & {
  sender: Pick<User, 'id' | 'firstName' | 'lastName' | 'imageUrl'>;
  isOwnMessage?: boolean;
};

// Conversation with all relations
export type ConversationWithDetails = Conversation & {
  buyer: Pick<User, 'id' | 'firstName' | 'lastName' | 'imageUrl'>;
  seller: Pick<User, 'id' | 'firstName' | 'lastName' | 'imageUrl'>;
  product: Pick<Product, 'id' | 'title' | 'price' | 'status'> & {
    images: Array<{ imageUrl: string; alt?: string }>;
  };
  messages: MessageWithSender[];
  unreadCount?: number;
  lastMessage?: MessageWithSender;
};

// Message types for real-time events
export type MessageEvent = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  type: 'message' | 'typing' | 'read';
};

// Typing indicator
export type TypingEvent = {
  conversationId: string;
  userId: string;
  isTyping: boolean;
};

// Message status
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

// Client-side message with status
export type ClientMessage = MessageWithSender & {
  status: MessageStatus;
  optimisticId?: string;
};

// Conversation list item
export type ConversationListItem = {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: string;
  otherParticipant: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: Date;
    isOwnMessage: boolean;
  };
  unreadCount: number;
  status: 'ACTIVE' | 'ARCHIVED';
  updatedAt: Date;
};

// Pagination types
export type MessagesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type MessagesResponse = {
  success: boolean;
  data?: {
    messages: MessageWithSender[];
    pagination: MessagesPagination;
  };
  error?: string;
};

// Quick reply templates
export type QuickReplyTemplate = {
  id: string;
  text: string;
  category: 'greeting' | 'question' | 'offer' | 'unavailable' | 'shipping';
};

// Message thread context
export type MessageThreadContext = {
  conversationId: string;
  productId: string;
  otherParticipantId: string;
  userRole: 'buyer' | 'seller';
};

// Real-time connection status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Message actions
export type MessageAction = 
  | { type: 'SEND_MESSAGE'; payload: { content: string; imageUrl?: string } }
  | { type: 'MESSAGE_SENT'; payload: MessageWithSender }
  | { type: 'MESSAGE_RECEIVED'; payload: MessageWithSender }
  | { type: 'MARK_READ'; payload: { messageIds: string[] } }
  | { type: 'SET_TYPING'; payload: { isTyping: boolean } }
  | { type: 'USER_TYPING'; payload: { userId: string; isTyping: boolean } }
  | { type: 'CONNECTION_STATUS'; payload: ConnectionStatus }
  | { type: 'ERROR'; payload: { message: string } };

// Hook state types
export type UseMessagesState = {
  messages: ClientMessage[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  connectionStatus: ConnectionStatus;
  typingUsers: Set<string>;
};

export type UseConversationsState = {
  conversations: ConversationListItem[];
  loading: boolean;
  error: string | null;
  unreadTotal: number;
};

// Server action types
export type SendMessageResult = {
  success: boolean;
  message?: MessageWithSender;
  error?: string;
  details?: any;
};

export type CreateConversationResult = {
  success: boolean;
  conversation?: ConversationWithDetails;
  error?: string;
  details?: any;
};

export type MarkAsReadResult = {
  success: boolean;
  error?: string;
};

// Component props types
export type MessageBubbleProps = {
  message: ClientMessage;
  showAvatar?: boolean;
  showTimestamp?: boolean;
};

export type MessageInputProps = {
  conversationId: string;
  onSend: (content: string, imageUrl?: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export type ConversationListProps = {
  conversations: ConversationListItem[];
  selectedConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  loading?: boolean;
};

export type MessageThreadProps = {
  conversationId: string;
  className?: string;
};