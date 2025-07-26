/**
 * Messaging components
 */

// Core components
export { MessagesContainer } from './messages-container';
export { ConversationList } from './conversation-list';
export { ChatHeader } from './chat-header';
export { MessageList } from './message-list';
export { MessageItem } from './message-item';
export { MessageInputEnhanced } from './message-input-enhanced';
export { TypingIndicatorWithAvatar } from './typing-indicator-with-avatar';

// Legacy components (to be deprecated)
export { MessageBubble } from './message-bubble';
export { MessageInput } from './message-input';
export { MessageThread } from './message-thread';
export { TypingIndicator } from './typing-indicator';

// Re-export types
export type * from '../types';