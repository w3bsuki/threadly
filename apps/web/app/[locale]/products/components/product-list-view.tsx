'use client';

import { Badge, Button } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { Crown, Eye, Heart } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils/currency';
import { ProductQuickView } from '../../components/product-quick-view';

// Inline ProductPlaceholder for loading states
const ProductPlaceholder = ({
  className = 'w-full h-full',
}: {
  className?: string;
}) => {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}
    >
      <svg
        className="text-muted-foreground"
        fill="none"
        height="60"
        viewBox="0 0 80 80"
        width="60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 25 C20 25, 25 20, 40 20 C55 20, 60 25, 60 25"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M40 20 L40 15 C40 12, 42 10, 45 10 C48 10, 50 12, 50 15"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

// Get time ago string
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }
  if (diffDays === 1) {
    return '1 day ago';
  }
  return `${diffDays} days ago`;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  brand?: string;
  images: Array<{
    id: string;
    imageUrl: string;
    alt?: string;
    displayOrder: number;
  }>;
  seller: {
    id: string;
    firstName: string;
  };
  _count: {
    favorites: number;
  };
  views?: number;
  createdAt?: Date;
}

interface ProductListViewProps {
  products: Product[];
}

const conditionLabels = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  SATISFACTORY: 'Fair',
};

// Designer brands for badge detection
const designerBrands = [
  'GUCCI',
  'PRADA',
  'CHANEL',
  'LOUIS VUITTON',
  'VERSACE',
  'DIOR',
  'BALENCIAGA',
  'HERMÈS',
  'SAINT LAURENT',
  'BOTTEGA VENETA',
  'OFF-WHITE',
  'BURBERRY',
  'FENDI',
  'GIVENCHY',
  'VALENTINO',
];

// Product list item component
const ProductListItem = ({ product }: { product: Product }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPending(true);
    // TODO: Implement actual favorites API call
    setTimeout(() => {
      setIsFavorited(!isFavorited);
      setIsPending(false);
    }, 500);
  };

  const isDesigner = product.brand
    ? designerBrands.some((brand) =>
        product.brand?.toUpperCase().includes(brand)
      )
    : false;

  const uploadedAgo = product.createdAt
    ? getTimeAgo(product.createdAt)
    : 'recently';

  // Transform product data to match ProductQuickView interface
  const transformedProduct = {
    id: product.id,
    title: product.title,
    brand: product.brand || '',
    price: product.price,
    originalPrice: null,
    size: 'One Size', // TODO: Add size to product interface
    condition: product.condition,
    categoryName: product.category,
    images: product.images.map((img) => img.imageUrl),
    seller: {
      id: product.seller.id,
      name: product.seller.firstName,
      location: 'Location', // TODO: Add location to seller interface
      rating: 4.5,
    },
    favoritesCount: product._count?.favorites || 0,
    createdAt: product.createdAt || new Date(),
  };

  return (
    <article className="group relative rounded-[var(--radius-lg)] border border-border bg-background p-4 transition-shadow hover:shadow-md">
      <ProductQuickView
        product={transformedProduct}
        trigger={
          <div className="cursor-pointer">
            <div className="flex gap-4">
              {/* Product Image */}
              <div className="relative h-32 w-32 flex-shrink-0">
                <div className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] bg-secondary">
                  {product.images.length > 0 ? (
                    <Image
                      alt={product.images[0].alt || product.title}
                      className="object-cover object-center transition-opacity group-hover:opacity-75"
                      fill
                      sizes="128px"
                      src={product.images[0].imageUrl}
                    />
                  ) : (
                    <ProductPlaceholder className="h-full w-full" />
                  )}

                  {/* Condition badge */}
                  <div className="absolute top-2 left-2">
                    <Badge
                      className="bg-background/90 text-foreground text-xs"
                      variant="secondary"
                    >
                      {conditionLabels[
                        product.condition as keyof typeof conditionLabels
                      ] || product.condition.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Designer badge */}
                  {isDesigner && (
                    <div className="absolute top-2 left-2 mt-7">
                      <Badge className="border-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-xs">
                        <Crown className="mr-1 h-3 w-3" />
                        Designer
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-muted-foreground text-xs uppercase tracking-wide">
                      {product.brand || 'Unknown'}
                    </p>
                    <h3 className="mb-2 line-clamp-2 font-semibold text-foreground text-lg">
                      {product.title}
                    </h3>
                  </div>

                  {/* Heart button */}
                  <button
                    aria-label={
                      isFavorited
                        ? `Remove ${product.title} from favorites`
                        : `Add ${product.title} to favorites`
                    }
                    className={cn(
                      'rounded-[var(--radius-full)] p-2 transition-all',
                      isFavorited
                        ? 'bg-red-50 text-red-500'
                        : 'text-muted-foreground hover:bg-muted hover:text-muted-foreground'
                    )}
                    disabled={isPending}
                    onClick={handleToggleFavorite}
                  >
                    <Heart
                      className={cn('h-5 w-5', isFavorited && 'fill-current')}
                    />
                  </button>
                </div>

                {/* Price and Details */}
                <div className="mb-3">
                  <span className="font-bold text-2xl text-foreground">
                    {formatCurrency(product.price)}
                  </span>
                </div>

                {/* Description */}
                <p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
                  {product.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <div className="flex items-center space-x-4">
                    <span>Size: One Size</span>
                    <span>Category: {product.category}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {product._count?.favorites > 0 && (
                      <div className="flex items-center">
                        <Heart className="mr-1 h-3 w-3" />
                        {product._count.favorites}
                      </div>
                    )}
                    <span>
                      {product.seller.firstName} • {uploadedAgo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick View button */}
              <div className="flex flex-shrink-0 items-center">
                <Button
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  size="sm"
                  variant="outline"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Quick View
                </Button>
              </div>
            </div>
          </div>
        }
      />
    </article>
  );
};

export function ProductListView({ products }: ProductListViewProps) {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductListItem key={product.id} product={product} />
      ))}
    </div>
  );
}
