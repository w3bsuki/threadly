'use client';

import { CardContent } from '@repo/design-system/components';
import { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { MessageItem } from './message-item';
import { TypingIndicatorWithAvatar } from './typing-indicator-with-avatar';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  typingUsers: string[];
  onRetry?: (message: Message) => void;
  optimisticMessageIds?: string[];
  failedMessageIds?: string[];
}

export function MessageList({
  messages,
  currentUserId,
  otherUserName,
  otherUserAvatar,
  typingUsers,
  onRetry,
  optimisticMessageIds = [],
  failedMessageIds = [],
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const formatDateGroup = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    }
    if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }
    return messageDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const dateKey = formatDateGroup(new Date(message.createdAt));
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <CardContent className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateGroup, messages]) => (
            <div key={dateGroup}>
              <div className="my-4 text-center">
                <span className="rounded-[var(--radius-full)] bg-secondary px-3 py-1 text-muted-foreground text-xs">
                  {dateGroup}
                </span>
              </div>
              {messages.map((message) => {
                const isSender = message.senderId === currentUserId;
                const isOptimistic = optimisticMessageIds.includes(message.id);
                const isFailed = failedMessageIds.includes(message.id);
                return (
                  <MessageItem
                    isFailed={isFailed}
                    isOptimistic={isOptimistic}
                    isSender={isSender}
                    key={message.id}
                    message={message}
                    onRetry={() => onRetry?.(message)}
                    senderAvatar={isSender ? undefined : otherUserAvatar}
                    senderName={isSender ? 'You' : otherUserName}
                  />
                );
              })}
            </div>
          ))
        )}

        {typingUsers.length > 0 && (
          <TypingIndicatorWithAvatar
            userAvatar={otherUserAvatar}
            userName={otherUserName}
          />
        )}

        <div ref={messagesEndRef} />
      </div>
    </CardContent>
  );
}
