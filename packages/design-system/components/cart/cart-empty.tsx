'use client';

import * as React from 'react';
import { ShoppingBag, ArrowRight, Package, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export interface CartEmptyProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  showSuggestions?: boolean;
  variant?: 'default' | 'minimal' | 'illustrated';
  enableAnimations?: boolean;
  className?: string;
}

export const CartEmpty: React.FC<CartEmptyProps> = ({
  title = 'Your cart is empty',
  description = 'Looks like you haven\'t added any items to your cart yet.',
  actionText = 'Continue Shopping',
  onAction,
  showSuggestions = false,
  variant = 'default',
  enableAnimations = false,
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const renderIcon = () => {
    if (variant === 'illustrated') {
      return (
        <div className="relative">
          <div className={cn(
            'relative h-32 w-32 rounded-full bg-muted/50 p-8',
            enableAnimations && isVisible && 'animate-bounce-in'
          )}>
            <ShoppingBag className="h-full w-full text-muted-foreground/50" />
          </div>
          {enableAnimations && (
            <>
              <Package className="absolute -right-2 -top-2 h-8 w-8 text-muted-foreground/30 animate-float animation-delay-200" />
              <Sparkles className="absolute -left-2 bottom-0 h-6 w-6 text-muted-foreground/30 animate-float animation-delay-400" />
            </>
          )}
        </div>
      );
    }

    return (
      <ShoppingBag className={cn(
        'h-16 w-16 text-muted-foreground/50',
        enableAnimations && isVisible && 'animate-bounce-in'
      )} />
    );
  };

  if (variant === 'minimal') {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center space-y-4 py-12 text-center',
        enableAnimations && isVisible && 'animate-fade-in',
        className
      )}>
        <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{title}</p>
        {onAction && (
          <Button
            onClick={onAction}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {actionText}
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn(
      'transition-all duration-300',
      enableAnimations && isVisible && 'animate-scale-in',
      className
    )}>
      <CardContent className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
        {renderIcon()}

        <div className={cn(
          'space-y-2',
          enableAnimations && isVisible && 'animate-fade-in animation-delay-200'
        )}>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        </div>

        {onAction && (
          <Button
            onClick={onAction}
            size="lg"
            variant="brand-primary"
            className={cn(
              'gap-2',
              enableAnimations && isVisible && 'animate-slide-in-up animation-delay-300',
              enableAnimations && 'transition-all hover:gap-3'
            )}
          >
            {actionText}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {showSuggestions && (
          <div className={cn(
            'mt-8 w-full border-t pt-8',
            enableAnimations && isVisible && 'animate-fade-in animation-delay-400'
          )}>
            <h4 className="mb-4 text-sm font-medium text-muted-foreground">
              Popular Categories
            </h4>
            <div className="flex flex-wrap justify-center gap-2">
              {['Dresses', 'Tops', 'Shoes', 'Bags', 'Accessories'].map((category, index) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'text-xs',
                    enableAnimations && isVisible && 'animate-fade-in',
                    enableAnimations && `animation-delay-${500 + index * 100}`
                  )}
                  onClick={onAction}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};