'use client';

import { CheckCheck } from 'lucide-react';
import type { MessageItemProps } from '../types';

export function MessageItem({
  message,
  isSender,
  senderName,
  senderAvatar,
  isOptimistic = false,
  isFailed = false,
  onRetry,
  className,
}: MessageItemProps) {

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${Math.floor(hours)}h ago`;
    }
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div
      className={`flex items-start gap-3 ${isSender ? 'justify-end' : ''} ${className || ''}`}
    >
      {!isSender && (
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-full)] bg-accent">
          {senderAvatar ? (
            <img
              alt={senderName}
              className="h-8 w-8 rounded-[var(--radius-full)]"
              src={senderAvatar}
            />
          ) : (
            <span className="font-medium text-muted-foreground text-xs">
              {senderName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      )}
      <div
        className={`flex-1 ${isSender ? 'text-right' : ''}`}
      >
        <div
          className={`max-w-xs rounded-[var(--radius-lg)] p-3 ${
            isSender
              ? `ml-auto ${
                  isFailed
                    ? 'bg-red-600 text-background'
                    : isOptimistic
                    ? 'bg-blue-600 text-background opacity-70'
                    : 'bg-blue-600 text-background'
                }`
              : 'bg-secondary'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          {isFailed && onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs text-background underline hover:no-underline"
            >
              Retry
            </button>
          )}
        </div>
        <div
          className={`mt-1 flex items-center gap-1 ${
            isSender ? 'justify-end' : ''
          }`}
        >
          {isSender && !isOptimistic && !isFailed && message.read && (
            <CheckCheck className="h-3 w-3 text-muted-foreground/70" />
          )}
          {isOptimistic && (
            <span className="text-muted-foreground/70 text-xs">Sending...</span>
          )}
          {isFailed && (
            <span className="text-red-500 text-xs">Failed</span>
          )}
          {!isOptimistic && !isFailed && (
            <span className="text-muted-foreground text-xs">
              {formatTime(new Date(message.createdAt))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}