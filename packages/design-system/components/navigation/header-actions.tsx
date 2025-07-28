'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

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
        className={cn('flex items-center', spacingClasses[spacing], className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HeaderActions.displayName = 'HeaderActions';
