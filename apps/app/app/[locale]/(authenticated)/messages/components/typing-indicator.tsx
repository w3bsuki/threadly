'use client';

import { memo } from 'react';

interface TypingIndicatorProps {
  userName: string;
}

export const TypingIndicator = memo(({ userName }: TypingIndicatorProps) => {
  return (
    <div className="flex justify-start">
      <div className="bg-muted px-4 py-2 rounded-[var(--radius-lg)]">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div 
              className="w-2 h-2 bg-muted-foreground/50 rounded-[var(--radius-full)] animate-bounce" 
              style={{ animationDelay: '0ms' }} 
            />
            <div 
              className="w-2 h-2 bg-muted-foreground/50 rounded-[var(--radius-full)] animate-bounce" 
              style={{ animationDelay: '150ms' }} 
            />
            <div 
              className="w-2 h-2 bg-muted-foreground/50 rounded-[var(--radius-full)] animate-bounce" 
              style={{ animationDelay: '300ms' }} 
            />
          </div>
          <span className="text-xs text-muted-foreground ml-2">
            {userName} is typing...
          </span>
        </div>
      </div>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';