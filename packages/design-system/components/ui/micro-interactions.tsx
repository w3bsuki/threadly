'use client';

import * as React from 'react';
import { Button } from './button';
import { HeartAnimation } from '../brand/icons';
import { ShoppingCart, Heart, Star, Plus, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';

// Animated Heart Button with Love Animation
export interface AnimatedHeartButtonProps {
  isLiked?: boolean;
  onToggle?: (isLiked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showCount?: boolean;
  count?: number;
  disabled?: boolean;
  className?: string;
}

export const AnimatedHeartButton: React.FC<AnimatedHeartButtonProps> = ({
  isLiked = false,
  onToggle,
  size = 'md',
  variant = 'ghost',
  showCount = false,
  count = 0,
  disabled = false,
  className,
}) => {
  const [liked, setLiked] = React.useState(isLiked);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleClick = () => {
    if (disabled) return;
    
    setIsAnimating(true);
    const newLikedState = !liked;
    setLiked(newLikedState);
    onToggle?.(newLikedState);
    
    setTimeout(() => setIsAnimating(false), 600);
  };

  const buttonSize: 'sm' | 'default' | 'lg' = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <Button
      variant={variant}
      size={buttonSize}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative overflow-hidden group transition-all duration-300 active:scale-95',
        liked && 'text-[oklch(var(--brand-accent))]',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn(
          'transition-all duration-300',
          isAnimating && 'animate-bounce-in',
        )}>
          <HeartAnimation 
            isLiked={liked} 
            size={iconSize}
            className={cn(
              'transition-colors duration-300',
              liked && 'text-[oklch(var(--brand-accent))]'
            )}
          />
        </div>
        
        {showCount && (
          <span className={cn(
            'text-sm font-medium transition-all duration-200',
            isAnimating && 'animate-bounce-in animation-delay-100'
          )}>
            {count}
          </span>
        )}
      </div>

      {/* Love particles animation */}
      {isAnimating && liked && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <Heart 
              key={i}
              className={cn(
                'absolute h-3 w-3 text-[oklch(var(--brand-accent))] fill-current',
                'animate-float opacity-0',
                `animation-delay-${i * 100}`
              )}
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${(i % 2 === 0 ? 1 : -1) * (20 + i * 10)}px, ${-30 - i * 5}px)`,
                animationDuration: '0.8s',
                animationFillMode: 'forwards',
              }}
            />
          ))}
        </div>
      )}
    </Button>
  );
};

// Animated Add to Cart Button with Success Feedback
export interface AnimatedCartButtonProps {
  onAddToCart?: () => Promise<void> | void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'brand-primary' | 'brand-accent';
  text?: string;
  successText?: string;
  disabled?: boolean;
  className?: string;
}

export const AnimatedCartButton: React.FC<AnimatedCartButtonProps> = ({
  onAddToCart,
  size = 'md',
  variant = 'brand-primary',
  text = 'Add to Cart',
  successText = 'Added!',
  disabled = false,
  className,
}) => {
  const [state, setState] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleClick = async () => {
    if (disabled || state !== 'idle') return;

    setState('loading');
    try {
      await onAddToCart?.();
      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch (error) {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const buttonSize: 'sm' | 'default' | 'lg' = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';

  const getIcon = () => {
    switch (state) {
      case 'loading':
        return <Plus className="h-4 w-4 animate-spin" />;
      case 'success':
        return <Check className="h-4 w-4 animate-bounce-in" />;
      case 'error':
        return <X className="h-4 w-4 animate-shake" />;
      default:
        return <ShoppingCart className="h-4 w-4" />;
    }
  };

  const getText = () => {
    switch (state) {
      case 'loading':
        return 'Adding...';
      case 'success':
        return successText;
      case 'error':
        return 'Try again';
      default:
        return text;
    }
  };

  return (
    <Button
      variant={variant}
      size={buttonSize}
      onClick={handleClick}
      disabled={disabled || state === 'loading'}
      className={cn(
        'relative overflow-hidden transition-all duration-300 active:scale-95',
        state === 'success' && 'bg-[oklch(var(--brand-secondary))] hover:bg-[oklch(var(--brand-secondary)/.9)]',
        state === 'error' && 'bg-destructive hover:bg-destructive/90',
        state === 'loading' && 'cursor-wait',
        className
      )}
    >
      <div className="flex items-center gap-2 transition-all duration-200">
        {getIcon()}
        <span className={cn(
          'transition-all duration-200',
          state !== 'idle' && 'animate-fadeIn'
        )}>
          {getText()}
        </span>
      </div>

      {/* Success ripple effect */}
      {state === 'success' && (
        <div className="absolute inset-0 bg-[oklch(var(--brand-secondary)/.3)] rounded-[var(--radius-md)] animate-ping opacity-0" />
      )}
    </Button>
  );
};

// Rating Star Animation
export interface AnimatedRatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  onRate?: (rating: number) => void;
  readonly?: boolean;
  showAnimation?: boolean;
  className?: string;
}

export const AnimatedRatingStars: React.FC<AnimatedRatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  onRate,
  readonly = false,
  showAnimation = true,
  className,
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  const handleClick = (star: number) => {
    if (readonly) return;
    setIsAnimating(true);
    onRate?.(star);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className={cn('flex gap-1', className)}>
      {[...Array(maxRating)].map((_, index) => {
        const filled = (hoverRating || rating) >= index + 1;
        const shouldAnimate = showAnimation && isAnimating && filled;
        
        return (
          <button
            key={index}
            className={cn(
              'transition-all duration-200 active:scale-90',
              !readonly && 'hover:scale-110 cursor-pointer',
              readonly && 'cursor-default',
              shouldAnimate && 'animate-bounce-in',
              shouldAnimate && `animation-delay-${index * 50}`
            )}
            onClick={() => handleClick(index + 1)}
            onMouseEnter={() => !readonly && setHoverRating(index + 1)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
          >
            <Star
              size={iconSize}
              className={cn(
                'transition-colors duration-200',
                filled 
                  ? 'text-[oklch(var(--brand-accent))] fill-[oklch(var(--brand-accent))]'
                  : 'text-muted-foreground'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

// Floating Action Button with Pulse Animation
export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'brand-primary' | 'brand-accent';
  pulse?: boolean;
  badge?: number;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  position = 'bottom-right',
  size = 'md',
  variant = 'brand-primary',
  pulse = false,
  badge,
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  };

  return (
    <div
      className={cn(
        'fixed z-50 transition-all duration-300',
        positionClasses[position],
        isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
        className
      )}
    >
      <Button
        variant={variant}
        className={cn(
          'rounded-[var(--radius-full)] shadow-lg hover:shadow-xl transition-all duration-300 relative active:scale-95 hover:scale-105',
          sizeClasses[size],
          pulse && 'animate-pulse'
        )}
        onClick={onClick}
      >
        {pulse && (
          <div className="absolute inset-0 rounded-[var(--radius-full)] bg-current opacity-20 animate-ping" />
        )}
        
        {icon}
        
        {badge && badge > 0 && (
          <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-[var(--radius-full)] h-6 w-6 flex items-center justify-center animate-bounce-in">
            {badge > 99 ? '99+' : badge}
          </div>
        )}
      </Button>
    </div>
  );
};

// Loading Dots Animation
export const LoadingDots: React.FC<{ 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string;
  color?: string;
}> = ({ 
  size = 'md', 
  className,
  color = 'current'
}) => {
  const dotSize = size === 'sm' ? 'h-1 w-1' : size === 'lg' ? 'h-3 w-3' : 'h-2 w-2';

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            'rounded-[var(--radius-full)] animate-pulse',
            dotSize,
            color === 'current' ? 'bg-current' : color,
            `animation-delay-${index * 200}`
          )}
          style={{
            animationDuration: '1s',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  );
};

// Stagger Container for List Animations
export interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className,
  staggerDelay = 100, // in milliseconds
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={cn(
            'transition-all duration-500 ease-out',
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          )}
          style={{
            transitionDelay: `${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Shopping Cart Float Animation
export const CartFloatAnimation: React.FC<{
  isActive: boolean;
  productImage?: string;
  onComplete?: () => void;
}> = ({ isActive, productImage, onComplete }) => {
  React.useEffect(() => {
    if (isActive && onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div
        className={cn(
          'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
          'w-16 h-16 bg-background rounded-[var(--radius-lg)] shadow-lg border-2 border-[oklch(var(--brand-primary))]',
          'animate-bounce-in opacity-0',
          'flex items-center justify-center'
        )}
        style={{
          animation: 'cartFloat 1s ease-out forwards',
        }}
      >
        {productImage ? (
          <img 
            src={productImage} 
            alt="Product" 
            className="w-12 h-12 object-cover rounded" 
          />
        ) : (
          <ShoppingCart className="w-8 h-8 text-[oklch(var(--brand-primary))]" />
        )}
      </div>
    </div>
  );
};

// Custom keyframes for cart float animation
const cartFloatStyles = `
@keyframes cartFloat {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5) translateY(0);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) translateY(-20px);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8) translateY(-40px);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = cartFloatStyles;
  document.head.appendChild(style);
}