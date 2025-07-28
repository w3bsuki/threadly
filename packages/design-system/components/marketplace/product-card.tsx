'use client';

import { Eye, Heart, Share2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { cn } from '../../lib/utils';
import {
  ConditionStars,
  HeartAnimation,
  PremiumBadge,
  VerifiedBadge,
} from '../brand/icons';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    images: Array<{ imageUrl: string; alt?: string }>;
    condition: 1 | 2 | 3 | 4 | 5;
    brand?: string;
    size?: string;
    isLiked?: boolean;
    isNew?: boolean;
    discountPercentage?: number;
  };
  seller: {
    firstName?: string;
    lastName?: string;
    isVerified?: boolean;
    isPremium?: boolean;
    averageRating?: number;
  };
  variant?: 'default' | 'compact' | 'featured';
  onAddToCart?: (productId: string) => void;
  onToggleLike?: (productId: string, isLiked: boolean) => void;
  onQuickView?: (productId: string) => void;
  onShare?: (productId: string) => void;
  className?: string;
  dictionary?: {
    web?: {
      product?: {
        anonymous?: string;
        new?: string;
        adding?: string;
        inCart?: string;
        conditions?: {
          newWithTags?: string;
          newWithoutTags?: string;
          veryGood?: string;
          good?: string;
          fair?: string;
        };
      };
      tooltips?: {
        addToCart?: string;
        quickView?: string;
      };
      global?: {
        filters?: {
          size?: string;
        };
      };
    };
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  seller,
  variant = 'default',
  onAddToCart,
  onToggleLike,
  onQuickView,
  onShare,
  className,
  dictionary,
}) => {
  const [isLiked, setIsLiked] = React.useState(product.isLiked);
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const sellerName =
    `${seller.firstName || ''} ${seller.lastName || ''}`.trim() ||
    dictionary?.web?.product?.anonymous ||
    'Anonymous';
  const priceFormatted = (product.price / 100).toFixed(2);
  const originalPriceFormatted = product.originalPrice
    ? (product.originalPrice / 100).toFixed(2)
    : null;

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    onToggleLike?.(product.id, newLikedState);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    onAddToCart?.(product.id);
    setTimeout(() => setIsLoading(false), 1000); // Reset loading state
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(product.id);
  };

  const cardClasses = cn(
    'group relative cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
    {
      'max-w-sm': variant === 'default',
      'max-w-xs': variant === 'compact',
      'max-w-md border-[oklch(var(--brand-primary)/.2)]':
        variant === 'featured',
    },
    className
  );

  const imageAspectRatio =
    variant === 'compact' ? 'aspect-[3/4]' : 'aspect-[4/5]';

  return (
    <Card className={cardClasses}>
      <CardContent className="p-0">
        {/* Image Container */}
        <div
          className={`relative ${imageAspectRatio} overflow-hidden bg-muted`}
        >
          {/* Product Image */}
          {!imageError && product.images?.[0]?.imageUrl ? (
            <Image
              alt={product.images[0].alt || product.title}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              src={product.images[0].imageUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
              <span className="text-sm">No image</span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge
                className="bg-[oklch(var(--brand-secondary))] text-background text-xs"
                variant="default"
              >
                {dictionary?.web?.product?.new || 'New'}
              </Badge>
            )}
            {product.discountPercentage && (
              <Badge className="text-xs" variant="destructive">
                -{product.discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Action Buttons Overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              className="h-8 w-8 rounded-[var(--radius-full)] bg-background/90 hover:bg-background"
              onClick={handleLikeToggle}
              size="icon"
              variant="secondary"
            >
              <HeartAnimation isLiked={isLiked} size={16} />
            </Button>
            <Button
              className="h-8 w-8 rounded-[var(--radius-full)] bg-background/90 hover:bg-background"
              onClick={handleQuickView}
              size="icon"
              variant="secondary"
            >
              <Eye size={16} />
            </Button>
            <Button
              className="h-8 w-8 rounded-[var(--radius-full)] bg-background/90 hover:bg-background"
              onClick={handleShare}
              size="icon"
              variant="secondary"
            >
              <Share2 size={16} />
            </Button>
          </div>

          {/* Quick Add Button - Appears on Hover */}
          {variant !== 'compact' && (
            <div className="absolute right-2 bottom-2 left-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Button
                className="w-full"
                disabled={isLoading}
                onClick={handleAddToCart}
                variant="brand-primary"
              >
                <ShoppingCart className="mr-2" size={16} />
                {isLoading
                  ? dictionary?.web?.product?.adding || 'Adding...'
                  : dictionary?.web?.tooltips?.addToCart || 'Quick Add'}
              </Button>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-2 p-3">
          {/* Seller Info */}
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <span>{sellerName}</span>
            {seller.isVerified && <VerifiedBadge size={12} />}
            {seller.isPremium && <PremiumBadge size={12} />}
            {seller.averageRating && (
              <span className="ml-1">⭐ {seller.averageRating.toFixed(1)}</span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="line-clamp-2 font-medium text-sm leading-tight">
            {product.title}
          </h3>

          {/* Brand & Size */}
          {(product.brand || product.size) && (
            <div className="flex gap-2 text-muted-foreground text-xs">
              {product.brand && (
                <span className="font-medium">{product.brand}</span>
              )}
              {product.size && (
                <span>
                  {dictionary?.web?.global?.filters?.size || 'Size'}{' '}
                  {product.size}
                </span>
              )}
            </div>
          )}

          {/* Condition */}
          <div className="flex items-center gap-2">
            <ConditionStars rating={product.condition} size={10} />
            <span className="text-muted-foreground text-xs">
              {product.condition === 5 &&
                (dictionary?.web?.product?.conditions?.newWithTags ||
                  'New with tags')}
              {product.condition === 4 &&
                (dictionary?.web?.product?.conditions?.newWithoutTags ||
                  'New without tags')}
              {product.condition === 3 &&
                (dictionary?.web?.product?.conditions?.veryGood || 'Very good')}
              {product.condition === 2 &&
                (dictionary?.web?.product?.conditions?.good || 'Good')}
              {product.condition === 1 &&
                (dictionary?.web?.product?.conditions?.fair || 'Satisfactory')}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-[oklch(var(--brand-primary))] text-lg">
              ${priceFormatted}
            </span>
            {originalPriceFormatted && (
              <span className="text-muted-foreground text-sm line-through">
                ${originalPriceFormatted}
              </span>
            )}
          </div>

          {/* Compact Add to Cart */}
          {variant === 'compact' && (
            <Button
              className="w-full"
              disabled={isLoading}
              onClick={handleAddToCart}
              size="sm"
              variant="brand-primary"
            >
              <ShoppingCart className="mr-1" size={14} />
              {isLoading
                ? dictionary?.web?.product?.adding || 'Adding...'
                : dictionary?.web?.tooltips?.addToCart || 'Add'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Product Card Grid Container
export const ProductGrid: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}> = ({ children, variant = 'default', className }) => {
  const gridClasses = cn(
    'grid gap-4',
    {
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4':
        variant === 'default',
      'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5':
        variant === 'compact',
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': variant === 'featured',
    },
    className
  );

  return <div className={gridClasses}>{children}</div>;
};
