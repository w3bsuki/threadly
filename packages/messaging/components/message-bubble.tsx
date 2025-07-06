'use client';

import { memo } from 'react';
import { cn } from '@repo/design-system/lib/utils';
import { Avatar, AvatarFallback, AvatarImage, Badge } from '@repo/design-system/components';
import type { MessageBubbleProps } from '../types';

export const MessageBubble = memo<MessageBubbleProps>(function MessageBubble({
  message,
  showAvatar = true,
  showTimestamp = true,
}) {
  const isOwn = message.isOwnMessage;
  const isDelivered = message.status === 'delivered' || message.status === 'read';
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
        'flex gap-2 max-w-[80%]',
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
            'relative rounded-2xl px-4 py-2 max-w-sm break-words',
            isOwn
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md',
            isSending && 'opacity-60',
            isFailed && 'bg-red-100 border border-red-200'
          )}
        >
          {/* Image attachment */}
          {message.imageUrl && (
            <div className="mb-2">
              <img
                src={message.imageUrl}
                alt="Shared image"
                className="rounded-lg max-w-full h-auto max-h-64 object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Text content */}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Status indicators for own messages */}
          {isOwn && (
            <div className="flex items-center gap-1 mt-1">
              {isSending && (
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" />
                  <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse delay-75" />
                  <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse delay-150" />
                </div>
              )}
              {isFailed && (
                <Badge variant="destructive" className="text-xs">
                  Failed
                </Badge>
              )}
              {isDelivered && !isSending && !isFailed && (
                <div className="flex gap-0.5">
                  <div
                    className={cn(
                      'w-3 h-3 text-white/60',
                      message.read && 'text-blue-200'
                    )}
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor">
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
              'text-xs text-gray-500 px-2',
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