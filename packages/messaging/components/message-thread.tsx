'use client';

import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@repo/design-system/lib/utils';
import { Button } from '@repo/design-system/components';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { TypingIndicator } from './typing-indicator';
import { useMessages } from '../hooks/use-messages';
import { useRealTimeMessages } from '../hooks/use-real-time-messages';
import { useTypingIndicator } from '../hooks/use-typing-indicator';
import { MessageListSkeleton } from '@repo/design-system/components';
import { ChevronDown, AlertCircle } from 'lucide-react';
import type { MessageThreadProps } from '../types';

export function MessageThread({ conversationId, className }: MessageThreadProps) {
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
  const handleSendMessage = useCallback(async (content: string, imageUrl?: string) => {
    await sendMessage(content, imageUrl);
    
    // Ensure we scroll to bottom after sending
    setTimeout(() => {
      scrollToBottom(true);
    }, 100);
  }, [sendMessage, scrollToBottom]);

  // Handle input changes for typing indicator
  const handleInputChangeWithTyping = useCallback((value: string) => {
    handleInputChange(value);
    
    // Send typing indicator to server
    if (value.trim()) {
      sendTypingIndicator(true);
    } else {
      sendTypingIndicator(false);
    }
  }, [handleInputChange, sendTypingIndicator]);

  if (loading) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        <MessageListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex flex-col h-full items-center justify-center p-8', className)}>
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load messages</h3>
        <p className="text-gray-600 text-center mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Messages container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {/* Load more button */}
        {hasNextPage && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMoreMessages}
              disabled={isLoadingMore}
              className="text-gray-600"
            >
              {isLoadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
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
          <div key={message.id || message.optimisticId} className="relative">
            <MessageBubble 
              message={message} 
              showAvatar={true}
              showTimestamp={true}
            />
            
            {/* Retry button for failed messages */}
            {message.status === 'failed' && (
              <div className="flex justify-end mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => retryMessage(message.id)}
                  className="text-red-600 hover:text-red-700 text-xs h-6"
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
            <TypingIndicator 
              typingText={getTypingText()}
              className="ml-10" 
            />
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-gray-100 rounded-full p-4 mb-4">
              <svg 
                className="h-8 w-8 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start the conversation</h3>
            <p className="text-gray-500 max-w-sm">
              Send a message to get the conversation started. Be friendly and ask any questions about the item.
            </p>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!shouldAutoScroll.current && (
        <div className="absolute bottom-20 right-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => scrollToBottom(true)}
            className="rounded-full h-10 w-10 p-0 shadow-lg"
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