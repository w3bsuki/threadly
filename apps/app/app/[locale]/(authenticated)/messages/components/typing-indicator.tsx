'use client';

import { memo } from 'react';

interface TypingIndicatorProps {
  userName: string;
}

export const TypingIndicator = memo(({ userName }: TypingIndicatorProps) => {
  return (
    <div className="flex justify-start">
      <div className="rounded-[var(--radius-lg)] bg-muted px-4 py-2">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div
              className="h-2 w-2 animate-bounce rounded-[var(--radius-full)] bg-muted-foreground/50"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-[var(--radius-full)] bg-muted-foreground/50"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-[var(--radius-full)] bg-muted-foreground/50"
              style={{ animationDelay: '300ms' }}
            />
          </div>
          <span className="ml-2 text-muted-foreground text-xs">
            {userName} is typing...
          </span>
        </div>
      </div>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';
