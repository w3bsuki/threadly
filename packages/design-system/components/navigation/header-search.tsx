'use client';

import { Search, X } from 'lucide-react';
import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface HeaderSearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  variant?: 'default' | 'minimal';
}

export const HeaderSearch = forwardRef<HTMLInputElement, HeaderSearchProps>(
  ({ className, onClear, variant = 'default', value, onChange, ...props }, ref) => {
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
          <Search className="absolute left-[var(--space-3)] top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            ref={ref}
            type="search"
            className={cn(
              'h-10 w-full pl-[var(--space-10)] pr-[var(--space-10)]',
              'bg-muted/50 border-transparent',
              'focus:bg-background focus:border-border',
              'transition-all duration-200',
              isFocused && 'ring-2 ring-primary/20'
            )}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {hasValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-[var(--space-1)] top-1/2 h-8 w-8 -translate-y-1/2"
              onClick={handleClear}
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
          <Search className="absolute left-[var(--space-4)] h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            ref={ref}
            type="search"
            className={cn(
              'h-12 w-full pl-[var(--space-12)] pr-[var(--space-12)]',
              'text-[var(--font-size-base)]',
              'rounded-[var(--radius-xl)]',
              'border-2',
              isFocused ? 'border-primary' : 'border-border',
              'transition-all duration-200'
            )}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {hasValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-[var(--space-2)] top-1/2 h-10 w-10 -translate-y-1/2"
              onClick={handleClear}
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