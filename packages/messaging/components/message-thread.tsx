'use client';

import { Button, MessageListSkeleton } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { useMessages } from '../hooks/use-messages';
import { useRealTimeMessages } from '../hooks/use-real-time-messages';
import { useTypingIndicator } from '../hooks/use-typing-indicator';
import type { MessageThreadProps } from '../types';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { TypingIndicator } from './typing-indicator';

export function MessageThread({
  conversationId,
  className,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  // Messages hook
  const {
    messages,
    loading,
    error,
    hasNextPage,
    isLoadingMore,
    sendMessage,
    loadMoreMessages,
    retryMessage,
    dispatch,
  } = useMessages({
    conversationId,
    autoMarkAsRead: true,
    enableRealTime: true,
  });

  // Typing indicator hook
  const {
    typingUsers,
    hasTypingUsers,
    getTypingText,
    handleUserTyping,
    handleInputChange,
  } = useTypingIndicator({
    conversationId,
    enabled: true,
  });

  // Real-time messaging hook
  const { sendTypingIndicator } = useRealTimeMessages({
    conversationId,
    onMessageReceived: (messageEvent) => {
      dispatch({
        type: 'MESSAGE_RECEIVED',
        payload: {
          id: messageEvent.id,
          conversationId: messageEvent.conversationId,
          senderId: messageEvent.senderId,
          content: messageEvent.content,
          imageUrl: messageEvent.imageUrl || null,
          read: false,
          createdAt: messageEvent.createdAt,
          sender: {
            id: messageEvent.senderId,
            firstName: null, // Will be filled by API
            lastName: null,
            imageUrl: null,
          },
          isOwnMessage: false,
        },
      });
    },
    onTypingEvent: (typingEvent) => {
      handleUserTyping(typingEvent.userId, typingEvent.isTyping);
    },
    enabled: true,
  });

  // Auto scroll to bottom
  const scrollToBottom = useCallback((force = false) => {
    if (shouldAutoScroll.current || force) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, []);

  // Check if user is near bottom
  const isNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;

    const threshold = 100;
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // Handle scroll
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Update auto-scroll flag based on scroll position
    shouldAutoScroll.current = isNearBottom();

    // Load more messages if near top
    if (container.scrollTop < 100 && hasNextPage && !isLoadingMore) {
      loadMoreMessages();
    }
  }, [hasNextPage, isLoadingMore, isNearBottom, loadMoreMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Handle sending messages
  const handleSendMessage = useCallback(
    async (content: string, imageUrl?: string) => {
      await sendMessage(content, imageUrl);

      // Ensure we scroll to bottom after sending
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    },
    [sendMessage, scrollToBottom]
  );

  // Handle input changes for typing indicator
  const handleInputChangeWithTyping = useCallback(
    (value: string) => {
      handleInputChange(value);

      // Send typing indicator to server
      if (value.trim()) {
        sendTypingIndicator(true);
      } else {
        sendTypingIndicator(false);
      }
    },
    [handleInputChange, sendTypingIndicator]
  );

  if (loading) {
    return (
      <div className={cn('flex h-full flex-col', className)}>
        <MessageListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex h-full flex-col items-center justify-center p-8',
          className
        )}
      >
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h3 className="mb-2 font-semibold text-foreground text-lg">
          Failed to load messages
        </h3>
        <p className="mb-4 text-center text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full flex-col bg-background', className)}>
      {/* Messages container */}
      <div
        className="flex-1 space-y-4 overflow-y-auto p-4"
        onScroll={handleScroll}
        ref={containerRef}
      >
        {/* Load more button */}
        {hasNextPage && (
          <div className="flex justify-center">
            <Button
              className="text-muted-foreground"
              disabled={isLoadingMore}
              onClick={loadMoreMessages}
              size="sm"
              variant="ghost"
            >
              {isLoadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-[var(--radius-full)] border-2 border-gray-400 border-t-transparent" />
                  Loading...
                </div>
              ) : (
                'Load older messages'
              )}
            </Button>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <div className="relative" key={message.id || message.optimisticId}>
            <MessageBubble
              message={message}
              showAvatar={true}
              showTimestamp={true}
            />

            {/* Retry button for failed messages */}
            {message.status === 'failed' && (
              <div className="mt-1 flex justify-end">
                <Button
                  className="h-6 text-red-600 text-xs hover:text-red-700"
                  onClick={() => retryMessage(message.id)}
                  size="sm"
                  variant="ghost"
                >
                  Retry
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {hasTypingUsers && (
          <div className="flex justify-start">
            <TypingIndicator className="ml-10" typingText={getTypingText()} />
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-[var(--radius-full)] bg-secondary p-4">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="mb-2 font-medium text-foreground text-lg">
              Start the conversation
            </h3>
            <p className="max-w-sm text-muted-foreground">
              Send a message to get the conversation started. Be friendly and
              ask any questions about the item.
            </p>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!shouldAutoScroll.current && (
        <div className="absolute right-4 bottom-20">
          <Button
            className="h-10 w-10 rounded-[var(--radius-full)] p-0 shadow-lg"
            onClick={() => scrollToBottom(true)}
            size="sm"
            variant="secondary"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Message input */}
      <MessageInput
        conversationId={conversationId}
        onSend={handleSendMessage}
        placeholder="Type a message..."
      />
    </div>
  );
}
