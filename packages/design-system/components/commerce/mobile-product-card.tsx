'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Heart, ShoppingCart, Zap } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export interface MobileProductCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  imageBlurDataUrl?: string;
  inStock?: boolean;
  sizes?: string[];
  savedSize?: string;
  isWishlisted?: boolean;
  onAddToCart?: (productId: string, size?: string) => void;
  onToggleWishlist?: (productId: string) => void;
  onQuickBuy?: (productId: string, size: string) => void;
  onQuickPreview?: (productId: string) => void;
  className?: string;
}

// Create a live region for screen reader announcements
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
};

export const MobileProductCard = React.memo(function MobileProductCard({
  id,
  title,
  price,
  originalPrice,
  imageUrl,
  imageBlurDataUrl,
  inStock = true,
  sizes = [],
  savedSize,
  isWishlisted = false,
  onAddToCart,
  onToggleWishlist,
  onQuickBuy,
  onQuickPreview,
  className,
}: MobileProductCardProps) {
  const [showSizeSelector, setShowSizeSelector] = React.useState(false);
  const [selectedSize, setSelectedSize] = React.useState(savedSize || '');
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = React.useState(false);

  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const wishlistButtonRef = React.useRef<HTMLButtonElement>(null);

  // Handle long press for quick preview
  const handleTouchStart = React.useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(10);
      setShowSizeSelector(true);
      announceToScreenReader(
        'Size selector opened. Select a size to add to cart.'
      );
    }, 500);
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  // Handle swipe for wishlist
  const handleDragEnd = React.useCallback(
    (event: any, info: any) => {
      setIsDragging(false);

      if (Math.abs(info.offset.x) > 100) {
        if (navigator.vibrate) navigator.vibrate(20);
        onToggleWishlist?.(id);
        const action = info.offset.x > 0 ? 'added to' : 'removed from';
        announceToScreenReader(`${title} ${action} wishlist`);
      }

      setSwipeOffset(0);
    },
    [id, onToggleWishlist, title]
  );

  const handleAddToCart = React.useCallback(() => {
    if (!inStock) return;

    if (sizes.length > 0 && !selectedSize) {
      setShowSizeSelector(true);
      announceToScreenReader('Please select a size');
      return;
    }

    if (navigator.vibrate) navigator.vibrate(15);
    onAddToCart?.(id, selectedSize);
    const sizeText = selectedSize ? `size ${selectedSize}` : '';
    announceToScreenReader(`${title} ${sizeText} added to cart`);
  }, [id, inStock, selectedSize, sizes.length, onAddToCart, title]);

  const handleQuickBuy = React.useCallback(() => {
    if (!(inStock && savedSize)) return;

    if (navigator.vibrate) navigator.vibrate(15);
    onQuickBuy?.(id, savedSize);
    announceToScreenReader(`Quick buy: ${title} size ${savedSize}`);
  }, [id, inStock, savedSize, onQuickBuy, title]);

  const handleSizeSelect = React.useCallback(
    (size: string) => {
      setSelectedSize(size);
      setShowSizeSelector(false);
      if (navigator.vibrate) navigator.vibrate(10);
      onAddToCart?.(id, size);
      announceToScreenReader(
        `Size ${size} selected and ${title} added to cart`
      );
    },
    [id, onAddToCart, title]
  );

  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Keyboard navigation support
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cardRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          if (e.target === cardRef.current) {
            e.preventDefault();
            handleAddToCart();
          }
          break;
        case 'w':
        case 'W':
          e.preventDefault();
          wishlistButtonRef.current?.click();
          break;
        case 's':
        case 'S':
          if (sizes.length > 0) {
            e.preventDefault();
            setShowSizeSelector(true);
            announceToScreenReader(
              'Size selector opened. Use arrow keys to navigate.'
            );
          }
          break;
      }
      setIsKeyboardMode(true);
    };

    const handleMouseMove = () => setIsKeyboardMode(false);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleAddToCart, sizes.length]);

  return (
    <motion.div
      aria-label={`Product: ${title}. Price: $${price.toFixed(2)}${originalPrice ? `. Original price: $${originalPrice.toFixed(2)}` : ''}${inStock ? '' : '. Out of stock'}. Press Enter to add to cart, W to toggle wishlist${sizes.length > 0 ? ', S to select size' : ''}.`}
      className={cn(
        'relative overflow-hidden rounded-lg bg-background shadow-sm',
        'transition-shadow hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      drag={isKeyboardMode ? false : 'x'}
      dragConstraints={{ left: -120, right: 120 }}
      dragElastic={0.2}
      onDrag={(event, info) => setSwipeOffset(info.offset.x)}
      onDragEnd={handleDragEnd}
      onDragStart={() => setIsDragging(true)}
      ref={cardRef}
      role="article"
      tabIndex={0}
      whileTap={{ scale: isDragging ? 1 : 0.98 }}
    >
      {/* Wishlist indicator on swipe */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            animate={{ opacity: Math.abs(swipeOffset) / 120 }}
            className={cn(
              'absolute inset-0 z-10 flex items-center justify-center',
              swipeOffset > 0 ? 'bg-pink-500/20' : 'bg-gray-500/20'
            )}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <Heart
              aria-hidden="true"
              className={cn(
                'h-12 w-12',
                swipeOffset > 0 ? 'text-pink-500' : 'text-gray-500',
                isWishlisted && swipeOffset < 0 && 'fill-current'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Container */}
      <div
        aria-label={`${title} product image`}
        className="relative aspect-[4/5] overflow-hidden bg-gray-100"
        onMouseDown={handleTouchStart}
        onMouseLeave={handleTouchEnd}
        onMouseUp={handleTouchEnd}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
        role="img"
      >
        {!isImageLoaded && <Skeleton className="absolute inset-0" />}

        <Image
          alt={title}
          blurDataURL={imageBlurDataUrl}
          className={cn(
            'object-cover transition-opacity duration-300',
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          fill
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          placeholder={imageBlurDataUrl ? 'blur' : 'empty'}
          priority={false}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          src={imageUrl}
        />

        {/* Sold Out Overlay */}
        {!inStock && (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-black/60"
          >
            <span className="font-medium text-lg text-white">Sold Out</span>
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage > 0 && inStock && (
          <Badge
            aria-label={`${discountPercentage}% discount`}
            className="absolute top-2 left-2 bg-red-500 text-white"
            variant="default"
          >
            -{discountPercentage}%
          </Badge>
        )}

        {/* Wishlist Button */}
        <Button
          aria-label={`${isWishlisted ? 'Remove from' : 'Add to'} wishlist`}
          aria-pressed={isWishlisted}
          className={cn(
            'absolute top-2 right-2 h-9 w-9 rounded-full',
            'bg-white/80 backdrop-blur-sm hover:bg-white/90',
            'touch-manipulation',
            'focus-visible:ring-2 focus-visible:ring-offset-2'
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (navigator.vibrate) navigator.vibrate(10);
            onToggleWishlist?.(id);
            const action = isWishlisted ? 'removed from' : 'added to';
            announceToScreenReader(`${title} ${action} wishlist`);
          }}
          ref={wishlistButtonRef}
          size="icon"
          variant="ghost"
        >
          <Heart
            aria-hidden="true"
            className={cn(
              'h-4 w-4',
              isWishlisted && 'fill-pink-500 text-pink-500'
            )}
          />
        </Button>
      </div>

      {/* Product Info */}
      <div className="space-y-2 p-3">
        <h3
          className="line-clamp-2 min-h-[2.5rem] font-medium text-sm"
          id={`product-title-${id}`}
        >
          {title}
        </h3>

        <div
          aria-label="Pricing"
          className="flex items-baseline gap-2"
          role="group"
        >
          <span
            aria-label={`Current price: $${price.toFixed(2)}`}
            className="font-semibold text-lg"
          >
            ${price.toFixed(2)}
          </span>
          {originalPrice && originalPrice > price && (
            <span
              aria-label={`Original price: $${originalPrice.toFixed(2)}`}
              className="text-muted-foreground text-sm line-through"
            >
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            aria-describedby={
              sizes.length > 0 && !selectedSize
                ? 'size-required-message'
                : undefined
            }
            aria-label={`${inStock ? 'Add to cart' : 'Out of stock'}: ${title}`}
            className="h-9 flex-1 touch-manipulation focus-visible:ring-2 focus-visible:ring-offset-2"
            disabled={!inStock}
            onClick={handleAddToCart}
            size="sm"
            variant={inStock ? 'default' : 'secondary'}
          >
            <ShoppingCart aria-hidden="true" className="mr-1 h-4 w-4" />
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>

          {savedSize && inStock && (
            <Button
              aria-label={`Quick buy ${title} in size ${savedSize}`}
              className="h-9 touch-manipulation px-3 focus-visible:ring-2 focus-visible:ring-offset-2"
              onClick={handleQuickBuy}
              size="sm"
              title="Quick buy with saved size"
              variant="outline"
            >
              <Zap aria-hidden="true" className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Size Selector Modal */}
      <AnimatePresence>
        {showSizeSelector && sizes.length > 0 && (
          <motion.div
            animate={{ opacity: 1 }}
            aria-labelledby="size-selector-title"
            aria-modal="true"
            className="absolute inset-0 z-20 bg-background/95 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setShowSizeSelector(false)}
            role="dialog"
          >
            <div
              className="absolute right-0 bottom-0 left-0 rounded-t-2xl bg-background p-4 shadow-lg"
              onClick={(e) => e.stopPropagation()}
              role="document"
            >
              <h4 className="mb-3 font-medium" id="size-selector-title">
                Select Size for {title}
              </h4>
              <div
                aria-label="Available sizes"
                className="grid grid-cols-4 gap-2"
                role="radiogroup"
              >
                {sizes.map((size) => (
                  <Button
                    aria-checked={selectedSize === size}
                    aria-label={`Size ${size}`}
                    className="h-12 touch-manipulation focus-visible:ring-2 focus-visible:ring-offset-2"
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    role="radio"
                    variant={selectedSize === size ? 'default' : 'outline'}
                  >
                    {size}
                  </Button>
                ))}
              </div>
              <Button
                aria-label="Cancel size selection"
                className="mt-3 w-full focus-visible:ring-2 focus-visible:ring-offset-2"
                onClick={() => {
                  setShowSizeSelector(false);
                  announceToScreenReader('Size selector closed');
                }}
                variant="ghost"
              >
                Cancel
              </Button>
              {sizes.length > 0 && !selectedSize && (
                <span className="sr-only" id="size-required-message">
                  Size selection required
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// Loading skeleton component
export function MobileProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-background shadow-sm">
      <Skeleton className="aspect-[4/5]" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

// Example usage with proper memoization
export function MobileProductGrid({ products }: { products: any[] }) {
  const handleAddToCart = React.useCallback(
    (productId: string, size?: string) => {
      // Implementation
    },
    []
  );

  const handleToggleWishlist = React.useCallback((productId: string) => {
    // Implementation
  }, []);

  const handleQuickBuy = React.useCallback(
    (productId: string, size: string) => {
      // Implementation
    },
    []
  );

  return (
    <div className="grid grid-cols-2 gap-3 p-3">
      {products.map((product) => (
        <MobileProductCard
          key={product.id}
          {...product}
          onAddToCart={handleAddToCart}
          onQuickBuy={handleQuickBuy}
          onToggleWishlist={handleToggleWishlist}
        />
      ))}
    </div>
  );
}
