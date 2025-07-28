'use client';

import { Minus, Plus } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export interface CartQuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'inline' | 'compact';
  showInput?: boolean;
  enableAnimations?: boolean;
  className?: string;
}

export const CartQuantitySelector: React.FC<CartQuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  variant = 'default',
  showInput = true,
  enableAnimations = false,
  className,
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value.toString());

  React.useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleChange = (newValue: number) => {
    if (newValue < min || newValue > max || disabled) return;

    if (enableAnimations) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }

    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const numVal = Number.parseInt(val, 10);
    if (!isNaN(numVal) && numVal >= min && numVal <= max) {
      handleChange(numVal);
    }
  };

  const handleInputBlur = () => {
    const numVal = Number.parseInt(inputValue, 10);
    if (isNaN(numVal) || numVal < min || numVal > max) {
      setInputValue(value.toString());
    }
  };

  const buttonSize =
    size === 'sm' ? 'icon-sm' : size === 'lg' ? 'icon-lg' : 'icon';
  const iconSize =
    size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 rounded-lg border bg-background',
          disabled && 'opacity-50',
          className
        )}
      >
        <Button
          className={cn(
            'rounded-r-none border-r',
            enableAnimations && 'transition-transform active:scale-95'
          )}
          disabled={disabled || value <= min}
          onClick={() => handleChange(value - 1)}
          size={buttonSize}
          variant="ghost"
        >
          <Minus className={iconSize} />
          <span className="sr-only">Decrease quantity</span>
        </Button>

        <span
          className={cn(
            'min-w-[3rem] text-center font-medium tabular-nums',
            size === 'sm' && 'px-2 text-sm',
            size === 'md' && 'px-3 text-base',
            size === 'lg' && 'px-4 text-lg',
            enableAnimations && isAnimating && 'animate-bounce-in'
          )}
        >
          {value}
        </span>

        <Button
          className={cn(
            'rounded-l-none border-l',
            enableAnimations && 'transition-transform active:scale-95'
          )}
          disabled={disabled || value >= max}
          onClick={() => handleChange(value + 1)}
          size={buttonSize}
          variant="ghost"
        >
          <Plus className={iconSize} />
          <span className="sr-only">Increase quantity</span>
        </Button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-1',
          disabled && 'opacity-50',
          className
        )}
      >
        <Button
          className={cn(
            enableAnimations && 'transition-transform active:scale-95'
          )}
          disabled={disabled || value <= min}
          onClick={() => handleChange(value - 1)}
          size={buttonSize}
          variant="outline"
        >
          <Minus className={iconSize} />
        </Button>

        <span
          className={cn(
            'min-w-[2rem] text-center font-medium tabular-nums',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-base',
            size === 'lg' && 'text-lg',
            enableAnimations && isAnimating && 'animate-bounce-in'
          )}
        >
          {value}
        </span>

        <Button
          className={cn(
            enableAnimations && 'transition-transform active:scale-95'
          )}
          disabled={disabled || value >= max}
          onClick={() => handleChange(value + 1)}
          size={buttonSize}
          variant="outline"
        >
          <Plus className={iconSize} />
        </Button>
      </div>
    );
  }

  // Default variant with optional input
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        disabled && 'opacity-50',
        className
      )}
    >
      <Button
        className={cn(
          enableAnimations && 'transition-all active:scale-95',
          'hover:bg-primary hover:text-primary-foreground'
        )}
        disabled={disabled || value <= min}
        onClick={() => handleChange(value - 1)}
        size={buttonSize}
        variant="outline"
      >
        <Minus className={iconSize} />
        <span className="sr-only">Decrease quantity</span>
      </Button>

      {showInput ? (
        <Input
          className={cn(
            'text-center font-medium tabular-nums',
            size === 'sm' && 'h-8 w-14 text-sm',
            size === 'md' && 'h-9 w-16',
            size === 'lg' && 'h-10 w-20 text-lg',
            enableAnimations && isAnimating && 'animate-bounce-in',
            '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
          )}
          disabled={disabled}
          max={max}
          min={min}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          type="number"
          value={inputValue}
        />
      ) : (
        <span
          className={cn(
            'min-w-[3rem] text-center font-medium tabular-nums',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-base',
            size === 'lg' && 'text-lg',
            enableAnimations && isAnimating && 'animate-bounce-in'
          )}
        >
          {value}
        </span>
      )}

      <Button
        className={cn(
          enableAnimations && 'transition-all active:scale-95',
          'hover:bg-primary hover:text-primary-foreground'
        )}
        disabled={disabled || value >= max}
        onClick={() => handleChange(value + 1)}
        size={buttonSize}
        variant="outline"
      >
        <Plus className={iconSize} />
        <span className="sr-only">Increase quantity</span>
      </Button>
    </div>
  );
};
