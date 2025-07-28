'use client';

import { ArrowRight, Package, ShoppingBag, Sparkles } from 'lucide-react';
import * as React from 'react';
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
  description = "Looks like you haven't added any items to your cart yet.",
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
          <div
            className={cn(
              'relative h-32 w-32 rounded-full bg-muted/50 p-8',
              enableAnimations && isVisible && 'animate-bounce-in'
            )}
          >
            <ShoppingBag className="h-full w-full text-muted-foreground/50" />
          </div>
          {enableAnimations && (
            <>
              <Package className="-right-2 -top-2 animation-delay-200 absolute h-8 w-8 animate-float text-muted-foreground/30" />
              <Sparkles className="-left-2 animation-delay-400 absolute bottom-0 h-6 w-6 animate-float text-muted-foreground/30" />
            </>
          )}
        </div>
      );
    }

    return (
      <ShoppingBag
        className={cn(
          'h-16 w-16 text-muted-foreground/50',
          enableAnimations && isVisible && 'animate-bounce-in'
        )}
      />
    );
  };

  if (variant === 'minimal') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center space-y-4 py-12 text-center',
          enableAnimations && isVisible && 'animate-fade-in',
          className
        )}
      >
        <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">{title}</p>
        {onAction && (
          <Button
            className="gap-2"
            onClick={onAction}
            size="sm"
            variant="outline"
          >
            {actionText}
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'transition-all duration-300',
        enableAnimations && isVisible && 'animate-scale-in',
        className
      )}
    >
      <CardContent className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
        {renderIcon()}

        <div
          className={cn(
            'space-y-2',
            enableAnimations &&
              isVisible &&
              'animation-delay-200 animate-fade-in'
          )}
        >
          <h3 className="font-semibold text-xl">{title}</h3>
          <p className="max-w-sm text-muted-foreground text-sm">
            {description}
          </p>
        </div>

        {onAction && (
          <Button
            className={cn(
              'gap-2',
              enableAnimations &&
                isVisible &&
                'animation-delay-300 animate-slide-in-up',
              enableAnimations && 'transition-all hover:gap-3'
            )}
            onClick={onAction}
            size="lg"
            variant="brand-primary"
          >
            {actionText}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {showSuggestions && (
          <div
            className={cn(
              'mt-8 w-full border-t pt-8',
              enableAnimations &&
                isVisible &&
                'animation-delay-400 animate-fade-in'
            )}
          >
            <h4 className="mb-4 font-medium text-muted-foreground text-sm">
              Popular Categories
            </h4>
            <div className="flex flex-wrap justify-center gap-2">
              {['Dresses', 'Tops', 'Shoes', 'Bags', 'Accessories'].map(
                (category, index) => (
                  <Button
                    className={cn(
                      'text-xs',
                      enableAnimations && isVisible && 'animate-fade-in',
                      enableAnimations && `animation-delay-${500 + index * 100}`
                    )}
                    key={category}
                    onClick={onAction}
                    size="sm"
                    variant="outline"
                  >
                    {category}
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
