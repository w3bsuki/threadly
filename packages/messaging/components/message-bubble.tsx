'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
} from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { memo } from 'react';
import type { MessageBubbleProps } from '../types';

export const MessageBubble = memo<MessageBubbleProps>(function MessageBubble({
  message,
  showAvatar = true,
  showTimestamp = true,
}) {
  const isOwn = message.isOwnMessage;
  const isDelivered =
    message.status === 'delivered' || message.status === 'read';
  const isFailed = message.status === 'failed';
  const isSending = message.status === 'sending';

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  };

  return (
    <div
      className={cn(
        'flex max-w-[80%] gap-2',
        isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.imageUrl || undefined} />
          <AvatarFallback className="text-xs">
            {getInitials(message.sender.firstName, message.sender.lastName)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col gap-1', isOwn && 'items-end')}>
        {/* Message content */}
        <div
          className={cn(
            'relative max-w-sm break-words rounded-2xl px-4 py-2',
            isOwn
              ? 'rounded-br-md bg-blue-600 text-background'
              : 'rounded-bl-md bg-secondary text-foreground',
            isSending && 'opacity-60',
            isFailed && 'border border-red-200 bg-red-100'
          )}
        >
          {/* Image attachment */}
          {message.imageUrl && (
            <div className="mb-2">
              <img
                alt="Shared image"
                className="h-auto max-h-64 max-w-full rounded-[var(--radius-lg)] object-cover"
                loading="lazy"
                src={message.imageUrl}
              />
            </div>
          )}

          {/* Text content */}
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>

          {/* Status indicators for own messages */}
          {isOwn && (
            <div className="mt-1 flex items-center gap-1">
              {isSending && (
                <div className="flex gap-1">
                  <div className="h-1 w-1 animate-pulse rounded-[var(--radius-full)] bg-background/60" />
                  <div className="h-1 w-1 animate-pulse rounded-[var(--radius-full)] bg-background/60 delay-75" />
                  <div className="h-1 w-1 animate-pulse rounded-[var(--radius-full)] bg-background/60 delay-150" />
                </div>
              )}
              {isFailed && (
                <Badge className="text-xs" variant="destructive">
                  Failed
                </Badge>
              )}
              {isDelivered && !isSending && !isFailed && (
                <div className="flex gap-0.5">
                  <div
                    className={cn(
                      'h-3 w-3 text-background/60',
                      message.read && 'text-blue-200'
                    )}
                  >
                    <svg fill="currentColor" viewBox="0 0 16 16">
                      <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z" />
                      <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <span
            className={cn(
              'px-2 text-muted-foreground text-xs',
              isOwn && 'text-right'
            )}
          >
            {formatTime(message.createdAt)}
          </span>
        )}
      </div>

      {/* Spacer for own messages where avatar would be */}
      {showAvatar && isOwn && <div className="w-8 flex-shrink-0" />}
    </div>
  );
});
