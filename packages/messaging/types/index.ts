import type { 
  CreateMessage,
  MessageType,
  ConversationStatus
} from '@repo/validation/schemas';

export type {
  CreateMessage,
  MessageType,
  ConversationStatus
};

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'DELETED';

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  status: string;
  images: Array<{
    id: string;
    imageUrl: string;
    alt?: string | null;
  }>;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  read: boolean;
  type?: MessageType;
  status?: MessageStatus;
}

export interface Conversation {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  buyer: User;
  seller: User;
  product: Product;
  messages: Message[];
  _count: {
    messages: number;
  };
}

export interface ConversationListItem {
  id: string;
  otherUser: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  product: {
    id: string;
    title: string;
    imageUrl?: string;
    price: number;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    isRead: boolean;
    senderId: string;
  } | null;
  unreadCount: number;
  rawConversation: Conversation;
  
  // Additional fields from old types.ts
  productId?: string;
  productTitle?: string;
  productImage?: string;
  productPrice?: string;
  otherParticipant?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status?: 'ACTIVE' | 'ARCHIVED';
  updatedAt?: Date;
}

export interface MessagesContentProps {
  conversations: Conversation[];
  currentUserId: string;
  filterType?: 'buying' | 'selling';
  targetUser?: User | null;
  targetProduct?: Product | null;
  existingConversation?: { id: string } | null;
}

export interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export interface ConversationListProps {
  conversations: ConversationListItem[];
  selectedConversationId?: string | null;
  onConversationSelect: (conversation: ConversationListItem) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUserId: string;
  className?: string;
}

export interface ChatAreaProps {
  conversation: Conversation | null;
  currentUserId: string;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  typingUsers?: string[];
  className?: string;
}

export interface MessageItemProps {
  message: Message;
  isSender: boolean;
  senderName: string;
  senderAvatar?: string;
  isOptimistic?: boolean;
  isFailed?: boolean;
  onRetry?: () => void;
  className?: string;
}

export interface TypingIndicatorProps {
  users: string[];
  userName?: string;
  userAvatar?: string;
  className?: string;
}

export interface MessageBubbleProps {
  content: string;
  isSender: boolean;
  timestamp: Date;
  isRead?: boolean;
  isOptimistic?: boolean;
  isFailed?: boolean;
  onRetry?: () => void;
  className?: string;
}

export interface ChatHeaderProps {
  otherUser: {
    name: string;
    imageUrl?: string;
  };
  product: {
    id: string;
    title: string;
    price: number;
  };
  onProductClick?: () => void;
  className?: string;
}

export interface NewMessageData {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
}

export interface MessageNotificationData {
  conversationId: string;
  createdAt: string;
}

// Real-time event types
export type MessageEvent = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  type: 'message' | 'typing' | 'read';
};

export type TypingEvent = {
  conversationId: string;
  userId: string;
  isTyping: boolean;
};

// Client-side message with status
export type ClientMessage = Message & {
  status?: MessageStatus;
  optimisticId?: string;
  isOwnMessage?: boolean;
  conversationId?: string;
};

// Message with sender
export type MessageWithSender = Message & {
  sender: Pick<User, 'id' | 'firstName' | 'lastName' | 'imageUrl'>;
  isOwnMessage?: boolean;
};

// Conversation with all relations
export type ConversationWithDetails = Conversation & {
  buyer: Pick<User, 'id' | 'firstName' | 'lastName' | 'imageUrl' | 'email'>;
  seller: Pick<User, 'id' | 'firstName' | 'lastName' | 'imageUrl' | 'email'>;
  product: Pick<Product, 'id' | 'title' | 'price' | 'status'> & {
    images: Array<{ id: string; imageUrl: string; alt?: string | null }>;
  };
  messages: MessageWithSender[];
  unreadCount?: number;
  lastMessage?: MessageWithSender;
};

// Hook-related types
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface UseMessagesState {
  messages: ClientMessage[];
  optimisticMessages: ClientMessage[];
  failedMessages: ClientMessage[];
  isLoading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
}

export type MessageAction = 
  | { type: 'ADD_MESSAGE'; message: ClientMessage }
  | { type: 'ADD_OPTIMISTIC'; message: ClientMessage }
  | { type: 'CONFIRM_MESSAGE'; optimisticId: string; confirmedMessage: ClientMessage }
  | { type: 'FAIL_MESSAGE'; optimisticId: string }
  | { type: 'RETRY_MESSAGE'; failedId: string }
  | { type: 'SET_MESSAGES'; messages: ClientMessage[] }
  | { type: 'SET_CONNECTION_STATUS'; status: ConnectionStatus }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null };

// API Response types
export interface MessagesResponse {
  messages: MessageWithSender[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface SendMessageResult {
  success: boolean;
  message?: MessageWithSender;
  error?: string;
}

export interface CreateConversationResult {
  success: boolean;
  conversation?: ConversationWithDetails;
  error?: string;
}