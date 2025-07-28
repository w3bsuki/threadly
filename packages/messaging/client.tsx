/**
 * Client-side messaging exports
 * Components and hooks for use in React applications
 */

'use client';

// Components
export {
  MessageBubble,
  MessageInput,
  MessageThread,
  TypingIndicator,
} from './components';
// Hooks
export {
  useConversations,
  useMessageActions,
  useMessages,
  useRealTimeMessages,
  useTypingIndicator,
} from './hooks';

// Types for client components
export type {
  ClientMessage,
  ConnectionStatus,
  ConversationListProps,
  MessageBubbleProps,
  MessageInputProps,
  MessageStatus,
  MessageThreadProps,
  UseConversationsState,
  UseMessagesState,
} from './types';
