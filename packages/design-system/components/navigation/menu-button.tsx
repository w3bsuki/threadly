'use client';

import { forwardRef, ComponentProps } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { VariantProps } from 'class-variance-authority';

interface MenuButtonProps extends ComponentProps<typeof Button> {
  isOpen?: boolean;
}

export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
  ({ className, isOpen = false, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn(
          'h-11 w-11 min-h-[44px] min-w-[44px]',
          className
        )}
        aria-expanded={isOpen}
        {...props}
      >
        <div className="relative flex flex-col items-center justify-center gap-[2px]">
          <span
            className={cn(
              'block h-[2px] w-5 bg-foreground transition-all duration-200',
              isOpen && 'rotate-45 translate-y-[4px]'
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