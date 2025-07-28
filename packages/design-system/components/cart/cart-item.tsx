'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { LazyImage } from '../ui/lazy-image';

export interface CartItemProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  imageUrl: string;
  imageAlt?: string;
  size?: string;
  color?: string;
  condition?: string;
  brand?: string;
  seller?: string;
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
  enableAnimations?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

export const CartItem: React.FC<CartItemProps> = ({
  id,
  title,
  price,
  originalPrice,
  quantity,
  imageUrl,
  imageAlt,
  size,
  color,
  condition,
  brand,
  seller,
  onQuantityChange,
  onRemove,
  enableAnimations = false,
  variant = 'default',
  className,
}) => {
  const [isRemoving, setIsRemoving] = React.useState(false);
  const [quantityAnimation, setQuantityAnimation] = React.useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantityAnimation(true);
    onQuantityChange?.(id, newQuantity);
    setTimeout(() => setQuantityAnimation(false), 300);
  };

  const handleRemove = () => {
    if (enableAnimations) {
      setIsRemoving(true);
      setTimeout(() => onRemove?.(id), 300);
    } else {
      onRemove?.(id);
    }
  };

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        enableAnimations && isRemoving && 'animate-slide-out-right opacity-0',
        enableAnimations && !isRemoving && 'animate-fade-in',
        variant === 'compact' ? 'p-3' : 'p-4 md:p-6',
        className
      )}
    >
      <div
        className={cn(
          'flex gap-4',
          variant === 'compact'
            ? 'flex-col sm:flex-row'
            : 'flex-col md:flex-row'
        )}
      >
        {/* Product Image */}
        <div
          className={cn(
            'relative flex-shrink-0 overflow-hidden rounded-lg bg-muted',
            variant === 'compact' ? 'h-20 w-20' : 'h-24 w-24 md:h-32 md:w-32'
          )}
        >
          <LazyImage
            alt={imageAlt || title}
            className="object-cover"
            fill
            sizes={
              variant === 'compact' ? '80px' : '(max-width: 768px) 96px, 128px'
            }
            src={imageUrl}
          />
          {discount > 0 && (
            <Badge
              className="absolute top-1 right-1 text-xs"
              variant="destructive"
            >
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-1 flex-col justify-between">
          <div className="space-y-1">
            <h3
              className={cn(
                'line-clamp-2 font-medium',
                variant === 'compact' ? 'text-sm' : 'text-base'
              )}
            >
              {title}
            </h3>

            <div className="flex flex-wrap gap-2 text-muted-foreground text-xs">
              {brand && <span>{brand}</span>}
              {size && <span>Size: {size}</span>}
              {color && <span>Color: {color}</span>}
              {condition && (
                <Badge className="text-xs" variant="outline">
                  {condition}
                </Badge>
              )}
            </div>

            {seller && (
              <p className="text-muted-foreground text-xs">Sold by {seller}</p>
            )}
          </div>

          {/* Price and Quantity */}
          <div
            className={cn(
              'flex items-end justify-between gap-4',
              variant === 'compact' ? 'mt-2' : 'mt-4'
            )}
          >
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    'font-semibold',
                    variant === 'compact' ? 'text-base' : 'text-lg'
                  )}
                >
                  ${price.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-muted-foreground text-sm line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground text-xs">
                Subtotal: ${(price * quantity).toFixed(2)}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-1">
              <Button
                className={cn(
                  enableAnimations && 'transition-transform active:scale-95'
                )}
                disabled={quantity <= 1}
                onClick={() => handleQuantityChange(quantity - 1)}
                size={variant === 'compact' ? 'icon-sm' : 'icon'}
                variant="outline"
              >
                <Minus className="h-3 w-3" />
              </Button>

              <span
                className={cn(
                  'min-w-[2rem] text-center font-medium tabular-nums',
                  variant === 'compact' ? 'text-sm' : 'text-base',
                  enableAnimations && quantityAnimation && 'animate-bounce-in'
                )}
              >
                {quantity}
              </span>

              <Button
                className={cn(
                  enableAnimations && 'transition-transform active:scale-95'
                )}
                onClick={() => handleQuantityChange(quantity + 1)}
                size={variant === 'compact' ? 'icon-sm' : 'icon'}
                variant="outline"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Remove Button */}
        <Button
          className={cn(
            'absolute top-2 right-2 text-muted-foreground hover:text-destructive',
            enableAnimations && 'transition-all hover:scale-110'
          )}
          onClick={handleRemove}
          size={variant === 'compact' ? 'icon-sm' : 'icon'}
          variant="ghost"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove from cart</span>
        </Button>
      </div>
    </Card>
  );
};
