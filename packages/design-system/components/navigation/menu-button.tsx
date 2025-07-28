'use client';

import { VariantProps } from 'class-variance-authority';
import { type ComponentProps, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface MenuButtonProps extends ComponentProps<typeof Button> {
  isOpen?: boolean;
}

export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
  ({ className, isOpen = false, children, ...props }, ref) => {
    return (
      <Button
        aria-expanded={isOpen}
        className={cn('h-11 min-h-[44px] w-11 min-w-[44px]', className)}
        ref={ref}
        size="icon"
        variant="ghost"
        {...props}
      >
        <div className="relative flex flex-col items-center justify-center gap-[2px]">
          <span
            className={cn(
              'block h-[2px] w-5 bg-foreground transition-all duration-200',
              isOpen && 'translate-y-[4px] rotate-45'
            )}
          />
          <span
            className={cn(
              'block h-[2px] w-5 bg-foreground transition-all duration-200',
              isOpen && 'opacity-0'
            )}
          />
          <span
            className={cn(
              'block h-[2px] w-5 bg-foreground transition-all duration-200',
              isOpen && '-rotate-45 -translate-y-[4px]'
            )}
          />
        </div>
        <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
      </Button>
    );
  }
);

MenuButton.displayName = 'MenuButton';
