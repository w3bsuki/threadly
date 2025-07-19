'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { HeartAnimation, ConditionStars, VerifiedBadge, PremiumBadge } from '../brand/icons';
import { ShoppingCart, Eye, Share2, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';

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
  const [isLiked, setIsLiked] = React.useState(product.isLiked || false);
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const sellerName = `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || dictionary?.web?.product?.anonymous || 'Anonymous';
  const priceFormatted = (product.price / 100).toFixed(2);
  const originalPriceFormatted = product.originalPrice ? (product.originalPrice / 100).toFixed(2) : null;

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
    'group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer',
    {
      'max-w-sm': variant === 'default',
      'max-w-xs': variant === 'compact',
      'max-w-md border-[oklch(var(--brand-primary)/.2)]': variant === 'featured',
    },
    className
  );

  const imageAspectRatio = variant === 'compact' ? 'aspect-[3/4]' : 'aspect-[4/5]';

  return (
    <Card className={cardClasses}>
      <CardContent className="p-0">
        {/* Image Container */}
        <div className={`relative ${imageAspectRatio} overflow-hidden bg-muted`}>
          {/* Product Image */}
          {!imageError && product.images?.[0]?.imageUrl ? (
            <Image
              src={product.images[0].imageUrl}
              alt={product.images[0].alt || product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
              <span className="text-sm">No image</span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge variant="default" className="bg-[oklch(var(--brand-secondary))] text-background text-xs">
{dictionary?.web?.product?.new || 'New'}
              </Badge>
            )}
            {product.discountPercentage && (
              <Badge variant="destructive" className="text-xs">
                -{product.discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Action Buttons Overlay */}
          <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-[var(--radius-full)] bg-background/90 hover:bg-background"
              onClick={handleLikeToggle}
            >
              <HeartAnimation isLiked={isLiked} size={16} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-[var(--radius-full)] bg-background/90 hover:bg-background"
              onClick={handleQuickView}
            >
              <Eye size={16} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-[var(--radius-full)] bg-background/90 hover:bg-background"
              onClick={handleShare}
            >
              <Share2 size={16} />
            </Button>
          </div>

          {/* Quick Add Button - Appears on Hover */}
          {variant !== 'compact' && (
            <div className="absolute bottom-2 left-2 right-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
              <Button
                variant="brand-primary"
                className="w-full"
                onClick={handleAddToCart}
                disabled={isLoading}
              >
                <ShoppingCart className="mr-2" size={16} />
{isLoading ? (dictionary?.web?.product?.adding || 'Adding...') : (dictionary?.web?.tooltips?.addToCart || 'Quick Add')}
              </Button>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3 space-y-2">
          {/* Seller Info */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{sellerName}</span>
            {seller.isVerified && <VerifiedBadge size={12} />}
            {seller.isPremium && <PremiumBadge size={12} />}
            {seller.averageRating && (
              <span className="ml-1">⭐ {seller.averageRating.toFixed(1)}</span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-medium text-sm line-clamp-2 leading-tight">
            {product.title}
          </h3>

          {/* Brand & Size */}
          {(product.brand || product.size) && (
            <div className="flex gap-2 text-xs text-muted-foreground">
              {product.brand && <span className="font-medium">{product.brand}</span>}
{product.size && <span>{dictionary?.web?.global?.filters?.size || 'Size'} {product.size}</span>}
            </div>
          )}

          {/* Condition */}
          <div className="flex items-center gap-2">
            <ConditionStars rating={product.condition} size={10} />
<span className="text-xs text-muted-foreground">
              {product.condition === 5 && (dictionary?.web?.product?.conditions?.newWithTags || 'New with tags')}
              {product.condition === 4 && (dictionary?.web?.product?.conditions?.newWithoutTags || 'New without tags')}
              {product.condition === 3 && (dictionary?.web?.product?.conditions?.veryGood || 'Very good')}
              {product.condition === 2 && (dictionary?.web?.product?.conditions?.good || 'Good')}
              {product.condition === 1 && (dictionary?.web?.product?.conditions?.fair || 'Satisfactory')}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[oklch(var(--brand-primary))]">
              ${priceFormatted}
            </span>
            {originalPriceFormatted && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPriceFormatted}
              </span>
            )}
          </div>

          {/* Compact Add to Cart */}
          {variant === 'compact' && (
            <Button
              variant="brand-primary"
              size="sm"
              className="w-full"
              onClick={handleAddToCart}
              disabled={isLoading}
            >
              <ShoppingCart className="mr-1" size={14} />
{isLoading ? (dictionary?.web?.product?.adding || 'Adding...') : (dictionary?.web?.tooltips?.addToCart || 'Add')}
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
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4': variant === 'default',
      'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5': variant === 'compact',
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': variant === 'featured',
    },
    className
  );

  return <div className={gridClasses}>{children}</div>;
};