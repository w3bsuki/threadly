/**
 * Client-side messaging exports
 * Components and hooks for use in React applications
 */

'use client';

// Hooks
export {
  useMessages,
  useConversations,
  useTypingIndicator,
  useMessageActions,
  useRealTimeMessages,
} from './hooks';

// Components
export {
  MessageBubble,
  MessageInput,
  MessageThread,
  TypingIndicator,
} from './components';

// Types for client components
export type {
  UseMessagesState,
  UseConversationsState,
  ClientMessage,
  MessageBubbleProps,
  MessageInputProps,
  ConversationListProps,
  MessageThreadProps,
  ConnectionStatus,
  MessageStatus,
} from './types';