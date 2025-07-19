'use client';

import { cn } from '../../lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface HeaderBaseProps extends HTMLAttributes<HTMLElement> {
  sticky?: boolean;
  transparent?: boolean;
}

export const HeaderBase = forwardRef<HTMLElement, HeaderBaseProps>(
  ({ className, children, sticky = true, transparent = false, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'w-full',
          sticky && 'sticky top-0 z-50',
          transparent ? 'bg-transparent' : 'bg-background/95 backdrop-blur-xl',
          'border-b-2 border-border',
          'shadow-sm',
          'transition-all duration-200',
          className
        )}
        {...props}
      >
        <div className="w-full px-[var(--space-4)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
          <div className="flex h-16 md:h-18 items-center justify-between gap-[var(--space-4)]">
            {children}
          </div>
        </div>
      </header>
    );
  }
);

HeaderBase.displayName = 'HeaderBase';