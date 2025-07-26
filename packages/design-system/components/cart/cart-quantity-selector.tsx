'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
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
    
    const numVal = parseInt(val, 10);
    if (!isNaN(numVal) && numVal >= min && numVal <= max) {
      handleChange(numVal);
    }
  };

  const handleInputBlur = () => {
    const numVal = parseInt(inputValue, 10);
    if (isNaN(numVal) || numVal < min || numVal > max) {
      setInputValue(value.toString());
    }
  };

  const buttonSize = size === 'sm' ? 'icon-sm' : size === 'lg' ? 'icon-lg' : 'icon';
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  if (variant === 'inline') {
    return (
      <div className={cn(
        'inline-flex items-center gap-1 rounded-lg border bg-background',
        disabled && 'opacity-50',
        className
      )}>
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={() => handleChange(value - 1)}
          disabled={disabled || value <= min}
          className={cn(
            'rounded-r-none border-r',
            enableAnimations && 'transition-transform active:scale-95'
          )}
        >
          <Minus className={iconSize} />
          <span className="sr-only">Decrease quantity</span>
        </Button>
        
        <span className={cn(
          'min-w-[3rem] text-center font-medium tabular-nums',
          size === 'sm' && 'text-sm px-2',
          size === 'md' && 'text-base px-3',
          size === 'lg' && 'text-lg px-4',
          enableAnimations && isAnimating && 'animate-bounce-in'
        )}>
          {value}
        </span>
        
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={() => handleChange(value + 1)}
          disabled={disabled || value >= max}
          className={cn(
            'rounded-l-none border-l',
            enableAnimations && 'transition-transform active:scale-95'
          )}
        >
          <Plus className={iconSize} />
          <span className="sr-only">Increase quantity</span>
        </Button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex items-center gap-1',
        disabled && 'opacity-50',
        className
      )}>
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handleChange(value - 1)}
          disabled={disabled || value <= min}
          className={cn(
            enableAnimations && 'transition-transform active:scale-95'
          )}
        >
          <Minus className={iconSize} />
        </Button>
        
        <span className={cn(
          'min-w-[2rem] text-center font-medium tabular-nums',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg',
          enableAnimations && isAnimating && 'animate-bounce-in'
        )}>
          {value}
        </span>
        
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handleChange(value + 1)}
          disabled={disabled || value >= max}
          className={cn(
            enableAnimations && 'transition-transform active:scale-95'
          )}
        >
          <Plus className={iconSize} />
        </Button>
      </div>
    );
  }

  // Default variant with optional input
  return (
    <div className={cn(
      'flex items-center gap-2',
      disabled && 'opacity-50',
      className
    )}>
      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => handleChange(value - 1)}
        disabled={disabled || value <= min}
        className={cn(
          enableAnimations && 'transition-all active:scale-95',
          'hover:bg-primary hover:text-primary-foreground'
        )}
      >
        <Minus className={iconSize} />
        <span className="sr-only">Decrease quantity</span>
      </Button>
      
      {showInput ? (
        <Input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled}
          min={min}
          max={max}
          className={cn(
            'text-center font-medium tabular-nums',
            size === 'sm' && 'h-8 w-14 text-sm',
            size === 'md' && 'h-9 w-16',
            size === 'lg' && 'h-10 w-20 text-lg',
            enableAnimations && isAnimating && 'animate-bounce-in',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          )}
        />
      ) : (
        <span className={cn(
          'min-w-[3rem] text-center font-medium tabular-nums',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg',
          enableAnimations && isAnimating && 'animate-bounce-in'
        )}>
          {value}
        </span>
      )}
      
      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => handleChange(value + 1)}
        disabled={disabled || value >= max}
        className={cn(
          enableAnimations && 'transition-all active:scale-95',
          'hover:bg-primary hover:text-primary-foreground'
        )}
      >
        <Plus className={iconSize} />
        <span className="sr-only">Increase quantity</span>
      </Button>
    </div>
  );
};