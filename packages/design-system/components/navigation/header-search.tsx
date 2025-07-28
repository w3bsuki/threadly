'use client';

import { Search, X } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface HeaderSearchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  variant?: 'default' | 'minimal';
}

export const HeaderSearch = forwardRef<HTMLInputElement, HeaderSearchProps>(
  (
    { className, onClear, variant = 'default', value, onChange, ...props },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = Boolean(value);

    const handleClear = () => {
      if (onChange) {
        const event = {
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
      onClear?.();
    };

    if (variant === 'minimal') {
      return (
        <div className={cn('relative flex-1', className)}>
          <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-[var(--space-3)] h-4 w-4 text-muted-foreground" />
          <Input
            className={cn(
              'h-10 w-full pr-[var(--space-10)] pl-[var(--space-10)]',
              'border-transparent bg-muted/50',
              'focus:border-border focus:bg-background',
              'transition-all duration-200',
              isFocused && 'ring-2 ring-primary/20'
            )}
            onBlur={() => setIsFocused(false)}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            ref={ref}
            type="search"
            value={value}
            {...props}
          />
          {hasValue && (
            <Button
              className="-translate-y-1/2 absolute top-1/2 right-[var(--space-1)] h-8 w-8"
              onClick={handleClear}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className={cn('relative w-full max-w-2xl', className)}>
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-[var(--space-4)] h-5 w-5 text-muted-foreground" />
          <Input
            className={cn(
              'h-12 w-full pr-[var(--space-12)] pl-[var(--space-12)]',
              'text-[var(--font-size-base)]',
              'rounded-[var(--radius-xl)]',
              'border-2',
              isFocused ? 'border-primary' : 'border-border',
              'transition-all duration-200'
            )}
            onBlur={() => setIsFocused(false)}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            ref={ref}
            type="search"
            value={value}
            {...props}
          />
          {hasValue && (
            <Button
              className="-translate-y-1/2 absolute top-1/2 right-[var(--space-2)] h-10 w-10"
              onClick={handleClear}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

HeaderSearch.displayName = 'HeaderSearch';
