'use client';

import { cn } from '@repo/ui/lib/utils';

interface TypingIndicatorProps {
  typingText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TypingIndicator({
  typingText = 'is typing...',
  className,
  size = 'md',
}: TypingIndicatorProps) {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  };

  const containerSizes = {
    sm: 'px-2 py-1',
    md: 'px-3 py-2',
    lg: 'px-4 py-3',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-2xl rounded-bl-md bg-secondary',
        containerSizes[size],
        className
      )}
    >
      {/* Animated dots */}
      <div className="flex gap-1">
        <div
          className={cn(
            'animate-pulse rounded-[var(--radius-full)] bg-gray-400',
            dotSizes[size]
          )}
          style={{
            animationDelay: '0ms',
            animationDuration: '1000ms',
          }}
        />
        <div
          className={cn(
            'animate-pulse rounded-[var(--radius-full)] bg-gray-400',
            dotSizes[size]
          )}
          style={{
            animationDelay: '200ms',
            animationDuration: '1000ms',
          }}
        />
        <div
          className={cn(
            'animate-pulse rounded-[var(--radius-full)] bg-gray-400',
            dotSizes[size]
          )}
          style={{
            animationDelay: '400ms',
            animationDuration: '1000ms',
          }}
        />
      </div>

      {/* Typing text */}
      <span
        className={cn(
          'text-muted-foreground italic',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}
      >
        {typingText}
      </span>
    </div>
  );
}
