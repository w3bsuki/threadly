'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Zap } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'

export interface MobileProductCardProps {
  id: string
  title: string
  price: number
  originalPrice?: number
  imageUrl: string
  imageBlurDataUrl?: string
  inStock?: boolean
  sizes?: string[]
  savedSize?: string
  isWishlisted?: boolean
  onAddToCart?: (productId: string, size?: string) => void
  onToggleWishlist?: (productId: string) => void
  onQuickBuy?: (productId: string, size: string) => void
  onQuickPreview?: (productId: string) => void
  className?: string
}

// Create a live region for screen reader announcements
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  document.body.appendChild(announcement)
  setTimeout(() => document.body.removeChild(announcement), 1000)
}

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
  className
}: MobileProductCardProps) {
  const [showSizeSelector, setShowSizeSelector] = React.useState(false)
  const [selectedSize, setSelectedSize] = React.useState(savedSize || '')
  const [isImageLoaded, setIsImageLoaded] = React.useState(false)
  const [swipeOffset, setSwipeOffset] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isKeyboardMode, setIsKeyboardMode] = React.useState(false)
  
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const wishlistButtonRef = React.useRef<HTMLButtonElement>(null)

  // Handle long press for quick preview
  const handleTouchStart = React.useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(10)
      setShowSizeSelector(true)
      announceToScreenReader('Size selector opened. Select a size to add to cart.')
    }, 500)
  }, [])

  const handleTouchEnd = React.useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }, [])

  // Handle swipe for wishlist
  const handleDragEnd = React.useCallback(
    (event: any, info: any) => {
      setIsDragging(false)
      
      if (Math.abs(info.offset.x) > 100) {
        if (navigator.vibrate) navigator.vibrate(20)
        onToggleWishlist?.(id)
        const action = info.offset.x > 0 ? 'added to' : 'removed from'
        announceToScreenReader(`${title} ${action} wishlist`)
      }
      
      setSwipeOffset(0)
    },
    [id, onToggleWishlist, title]
  )

  const handleAddToCart = React.useCallback(() => {
    if (!inStock) return
    
    if (sizes.length > 0 && !selectedSize) {
      setShowSizeSelector(true)
      announceToScreenReader('Please select a size')
      return
    }
    
    if (navigator.vibrate) navigator.vibrate(15)
    onAddToCart?.(id, selectedSize)
    const sizeText = selectedSize ? `size ${selectedSize}` : ''
    announceToScreenReader(`${title} ${sizeText} added to cart`)
  }, [id, inStock, selectedSize, sizes.length, onAddToCart, title])

  const handleQuickBuy = React.useCallback(() => {
    if (!inStock || !savedSize) return
    
    if (navigator.vibrate) navigator.vibrate(15)
    onQuickBuy?.(id, savedSize)
    announceToScreenReader(`Quick buy: ${title} size ${savedSize}`)
  }, [id, inStock, savedSize, onQuickBuy, title])

  const handleSizeSelect = React.useCallback((size: string) => {
    setSelectedSize(size)
    setShowSizeSelector(false)
    if (navigator.vibrate) navigator.vibrate(10)
    onAddToCart?.(id, size)
    announceToScreenReader(`Size ${size} selected and ${title} added to cart`)
  }, [id, onAddToCart, title])

  const discountPercentage = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0

  // Keyboard navigation support
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cardRef.current?.contains(document.activeElement)) return
      
      switch (e.key) {
        case 'Enter':
        case ' ':
          if (e.target === cardRef.current) {
            e.preventDefault()
            handleAddToCart()
          }
          break
        case 'w':
        case 'W':
          e.preventDefault()
          wishlistButtonRef.current?.click()
          break
        case 's':
        case 'S':
          if (sizes.length > 0) {
            e.preventDefault()
            setShowSizeSelector(true)
            announceToScreenReader('Size selector opened. Use arrow keys to navigate.')
          }
          break
      }
      setIsKeyboardMode(true)
    }

    const handleMouseMove = () => setIsKeyboardMode(false)
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleAddToCart, sizes.length])

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-lg bg-background shadow-sm',
        'transition-shadow hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      drag={!isKeyboardMode ? "x" : false}
      dragConstraints={{ left: -120, right: 120 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDrag={(event, info) => setSwipeOffset(info.offset.x)}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: isDragging ? 1 : 0.98 }}
      tabIndex={0}
      role="article"
      aria-label={`Product: ${title}. Price: $${price.toFixed(2)}${originalPrice ? `. Original price: $${originalPrice.toFixed(2)}` : ''}${!inStock ? '. Out of stock' : ''}. Press Enter to add to cart, W to toggle wishlist${sizes.length > 0 ? ', S to select size' : ''}.`}
    >
      {/* Wishlist indicator on swipe */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className={cn(
              'absolute inset-0 z-10 flex items-center justify-center',
              swipeOffset > 0 ? 'bg-pink-500/20' : 'bg-gray-500/20'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: Math.abs(swipeOffset) / 120 }}
            exit={{ opacity: 0 }}
          >
            <Heart
              className={cn(
                'h-12 w-12',
                swipeOffset > 0 ? 'text-pink-500' : 'text-gray-500',
                isWishlisted && swipeOffset < 0 && 'fill-current'
              )}
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Container */}
      <div 
        className="relative aspect-[4/5] overflow-hidden bg-gray-100"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        role="img"
        aria-label={`${title} product image`}
      >
        {!isImageLoaded && (
          <Skeleton className="absolute inset-0" />
        )}
        
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          className={cn(
            'object-cover transition-opacity duration-300',
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          placeholder={imageBlurDataUrl ? 'blur' : 'empty'}
          blurDataURL={imageBlurDataUrl}
          onLoad={() => setIsImageLoaded(true)}
          priority={false}
          loading="lazy"
        />

        {/* Sold Out Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center" aria-hidden="true">
            <span className="text-white font-medium text-lg">Sold Out</span>
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage > 0 && inStock && (
          <Badge 
            className="absolute top-2 left-2 bg-red-500 text-white"
            variant="default"
            aria-label={`${discountPercentage}% discount`}
          >
            -{discountPercentage}%
          </Badge>
        )}

        {/* Wishlist Button */}
        <Button
          ref={wishlistButtonRef}
          size="icon"
          variant="ghost"
          className={cn(
            'absolute top-2 right-2 h-9 w-9 rounded-full',
            'bg-white/80 backdrop-blur-sm hover:bg-white/90',
            'touch-manipulation',
            'focus-visible:ring-2 focus-visible:ring-offset-2'
          )}
          onClick={(e) => {
            e.stopPropagation()
            if (navigator.vibrate) navigator.vibrate(10)
            onToggleWishlist?.(id)
            const action = isWishlisted ? 'removed from' : 'added to'
            announceToScreenReader(`${title} ${action} wishlist`)
          }}
          aria-label={`${isWishlisted ? 'Remove from' : 'Add to'} wishlist`}
          aria-pressed={isWishlisted}
        >
          <Heart 
            className={cn(
              'h-4 w-4',
              isWishlisted && 'fill-pink-500 text-pink-500'
            )} 
            aria-hidden="true"
          />
        </Button>
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-2">
        <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]" id={`product-title-${id}`}>
          {title}
        </h3>
        
        <div className="flex items-baseline gap-2" role="group" aria-label="Pricing">
          <span className="font-semibold text-lg" aria-label={`Current price: $${price.toFixed(2)}`}>
            ${price.toFixed(2)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-muted-foreground line-through" aria-label={`Original price: $${originalPrice.toFixed(2)}`}>
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={inStock ? 'default' : 'secondary'}
            disabled={!inStock}
            className="flex-1 h-9 touch-manipulation focus-visible:ring-2 focus-visible:ring-offset-2"
            onClick={handleAddToCart}
            aria-label={`${inStock ? 'Add to cart' : 'Out of stock'}: ${title}`}
            aria-describedby={sizes.length > 0 && !selectedSize ? 'size-required-message' : undefined}
          >
            <ShoppingCart className="h-4 w-4 mr-1" aria-hidden="true" />
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
          
          {savedSize && inStock && (
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-3 touch-manipulation focus-visible:ring-2 focus-visible:ring-offset-2"
              onClick={handleQuickBuy}
              aria-label={`Quick buy ${title} in size ${savedSize}`}
              title="Quick buy with saved size"
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      {/* Size Selector Modal */}
      <AnimatePresence>
        {showSizeSelector && sizes.length > 0 && (
          <motion.div
            className="absolute inset-0 z-20 bg-background/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSizeSelector(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-selector-title"
          >
            <div 
              className="absolute bottom-0 left-0 right-0 p-4 bg-background rounded-t-2xl shadow-lg"
              onClick={(e) => e.stopPropagation()}
              role="document"
            >
              <h4 id="size-selector-title" className="font-medium mb-3">Select Size for {title}</h4>
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Available sizes">
                {sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? 'default' : 'outline'}
                    className="h-12 touch-manipulation focus-visible:ring-2 focus-visible:ring-offset-2"
                    onClick={() => handleSizeSelect(size)}
                    role="radio"
                    aria-checked={selectedSize === size}
                    aria-label={`Size ${size}`}
                  >
                    {size}
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                className="w-full mt-3 focus-visible:ring-2 focus-visible:ring-offset-2"
                onClick={() => {
                  setShowSizeSelector(false)
                  announceToScreenReader('Size selector closed')
                }}
                aria-label="Cancel size selection"
              >
                Cancel
              </Button>
              {sizes.length > 0 && !selectedSize && (
                <span id="size-required-message" className="sr-only">
                  Size selection required
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

// Loading skeleton component
export function MobileProductCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-background shadow-sm">
      <Skeleton className="aspect-[4/5]" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

// Example usage with proper memoization
export function MobileProductGrid({ products }: { products: any[] }) {
  const handleAddToCart = React.useCallback((productId: string, size?: string) => {
    // Implementation
  }, [])

  const handleToggleWishlist = React.useCallback((productId: string) => {
    // Implementation
  }, [])

  const handleQuickBuy = React.useCallback((productId: string, size: string) => {
    // Implementation
  }, [])

  return (
    <div className="grid grid-cols-2 gap-3 p-3">
      {products.map((product) => (
        <MobileProductCard
          key={product.id}
          {...product}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          onQuickBuy={handleQuickBuy}
        />
      ))}
    </div>
  )
}