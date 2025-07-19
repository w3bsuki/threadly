'use client';

import { cn } from '../../lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface HeaderActionsProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: 'tight' | 'normal' | 'loose';
}

export const HeaderActions = forwardRef<HTMLDivElement, HeaderActionsProps>(
  ({ className, children, spacing = 'normal', ...props }, ref) => {
    const spacingClasses = {
      tight: 'gap-[var(--space-2)]',
      normal: 'gap-[var(--space-3)]',
      loose: 'gap-[var(--space-4)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HeaderActions.displayName = 'HeaderActions';