'use client';

import {
  Badge,
  ConditionBadge,
  ProductGridSkeleton,
} from '@repo/ui/components';
import type { Dictionary } from '@repo/content/internationalization';
import { AppErrorBoundary as ErrorBoundary } from '@repo/ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Crown, Eye, Heart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '@/lib/utils/currency';
import { ProductImage } from '../../components/optimized-image';
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
        className="text-gray-300"
        fill="none"
        height="80"
        viewBox="0 0 80 80"
        width="80"
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
function getTimeAgo(date: Date, dictionary: Dictionary): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 60) {
    return `${diffMins} ${dictionary.web?.global?.time?.minutes || 'minutes'} ${dictionary.web?.global?.time?.ago || 'ago'}`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${dictionary.web?.global?.time?.hours || 'hours'} ${dictionary.web?.global?.time?.ago || 'ago'}`;
  }
  if (diffDays === 1) {
    return `1 ${dictionary.web?.global?.time?.day || 'day'} ${dictionary.web?.global?.time?.ago || 'ago'}`;
  }
  return `${diffDays} ${dictionary.web?.global?.time?.days || 'days'} ${dictionary.web?.global?.time?.ago || 'ago'}`;
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

interface ProductGridProps {
  products: Product[];
  isCompact?: boolean;
  dictionary: Dictionary;
  enableVirtualization?: boolean;
  containerHeight?: number;
  isLoading?: boolean;
}

// Hook to calculate columns based on screen size and compact mode
function useGridColumns(isCompact: boolean) {
  const [columns, setColumns] = useState(2);

  useEffect(() => {
    const calculateColumns = () => {
      const width = window.innerWidth;
      if (isCompact) {
        if (width >= 1280) return 7; // xl
        if (width >= 1024) return 6; // lg
        if (width >= 768) return 4; // md
        return 2; // base
      }
      if (width >= 1280) return 5; // xl
      if (width >= 1024) return 4; // lg
      if (width >= 768) return 3; // md
      return 2; // base
    };

    setColumns(calculateColumns());

    const handleResize = () => setColumns(calculateColumns());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCompact]);

  return columns;
}

// Condition labels will be mapped from dictionary

const _conditionColors = {
  NEW: 'bg-green-100 text-green-800',
  LIKE_NEW: 'bg-blue-100 text-blue-800',
  EXCELLENT: 'bg-purple-100 text-purple-800',
  GOOD: 'bg-yellow-100 text-yellow-800',
  SATISFACTORY: 'bg-gray-100 text-gray-800',
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

// Product card component
const ProductCard = ({
  product,
  dictionary,
}: {
  product: Product;
  dictionary: Dictionary;
}) => {
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
    ? getTimeAgo(new Date(product.createdAt), dictionary)
    : dictionary.web?.global?.time?.recently || 'recently';

  // Map condition labels from dictionary
  const _conditionLabels = {
    NEW: 'New',
    NEW_WITH_TAGS:
      dictionary.web?.global?.filters?.newWithTags || 'New with tags',
    NEW_WITHOUT_TAGS:
      dictionary.web?.global?.filters?.newWithTags || 'New without tags',
    LIKE_NEW: dictionary.web?.global?.filters?.likeNew || 'Like New',
    EXCELLENT: 'Excellent',
    VERY_GOOD: dictionary.web?.global?.filters?.veryGood || 'Very good',
    GOOD: dictionary.web?.global?.filters?.good || 'Good',
    SATISFACTORY: dictionary.web?.global?.filters?.fair || 'Fair',
  };

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
    <article
      aria-label={`Product: ${product.title}`}
      className="group relative bg-white"
    >
      <ProductQuickView
        product={transformedProduct}
        trigger={
          <div className="cursor-pointer">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
              {product.images.length > 0 ? (
                <ProductImage
                  alt={product.images[0].alt || product.title}
                  className="transition-opacity group-hover:opacity-75"
                  src={product.images[0].imageUrl}
                />
              ) : (
                <ProductPlaceholder className="h-full w-full object-cover object-center transition-opacity group-hover:opacity-75" />
              )}

              {/* Heart button */}
              <button
                aria-label={
                  isFavorited
                    ? `Remove ${product.title} from favorites`
                    : `Add ${product.title} to favorites`
                }
                aria-pressed={isFavorited}
                className={`absolute top-2 right-2 z-10 rounded-full p-2 transition-all ${
                  isFavorited
                    ? 'bg-red-500 text-white'
                    : 'bg-white/80 text-gray-600 hover:bg-white'
                } backdrop-blur-sm`}
                disabled={isPending}
                onClick={handleToggleFavorite}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`}
                />
              </button>

              {/* Quick View indicator - Shows on hover */}
              <div className="absolute right-2 bottom-2 left-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="flex w-full items-center justify-center rounded bg-black/80 px-3 py-2 text-white text-xs backdrop-blur-sm">
                  <Eye className="mr-1 h-3 w-3" />
                  {'Quick View'}
                </div>
              </div>

              {/* Condition badge */}
              <div className="absolute top-2 left-2">
                <ConditionBadge
                  className="bg-white/95 shadow-sm"
                  condition={
                    product.condition as
                      | 'NEW_WITH_TAGS'
                      | 'NEW_WITHOUT_TAGS'
                      | 'VERY_GOOD'
                      | 'GOOD'
                      | 'SATISFACTORY'
                      | 'FAIR'
                  }
                />
              </div>

              {/* Designer badge */}
              {isDesigner && (
                <div className="absolute top-2 left-2 mt-7">
                  <Badge className="border-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-xs">
                    <Crown className="mr-1 h-3 w-3" />
                    {dictionary.web?.global?.categories?.designer || 'Designer'}
                  </Badge>
                </div>
              )}

              {/* Favorites count */}
              {product._count?.favorites > 0 && (
                <div className="absolute bottom-2 left-2 mb-8">
                  <Badge
                    className="bg-white/90 text-gray-900 text-xs"
                    variant="secondary"
                  >
                    <Heart className="mr-1 h-3 w-3" />
                    {product._count.favorites}
                  </Badge>
                </div>
              )}
            </div>

            <div className="mt-3 space-y-1">
              <p className="text-gray-500 text-xs uppercase tracking-wide">
                {product.brand || 'Unknown'}
              </p>
              <h3 className="line-clamp-2 font-medium text-gray-900 text-sm">
                {product.title}
              </h3>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 text-lg">
                  {formatCurrency(product.price)}
                </span>
              </div>

              <p className="text-gray-500 text-xs">
                {dictionary.web?.global?.filters?.size || 'Size'} One Size
              </p>
              <p className="text-gray-400 text-xs">
                {product.seller.firstName} • {uploadedAgo}
              </p>
            </div>
          </div>
        }
      />
    </article>
  );
};

export function ProductGrid({
  products,
  isCompact = false,
  dictionary,
  enableVirtualization = false,
  containerHeight = 600,
  isLoading = false,
}: ProductGridProps) {
  const columns = useGridColumns(isCompact);
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate rows and row height
  const rowCount = Math.ceil(products.length / columns);
  const estimatedRowHeight = isCompact ? 280 : 320;

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 2,
  });

  const gridClass = isCompact
    ? 'grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7'
    : 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  // Show loading skeleton
  if (isLoading) {
    return <ProductGridSkeleton count={12} />;
  }

  // Non-virtualized version for small lists or when disabled
  if (!enableVirtualization || products.length < 50) {
    return (
      <ErrorBoundary
        fallback={
          <div className="flex min-h-[400px] items-center justify-center p-4">
            <div className="text-center">
              <h3 className="mb-2 font-semibold text-gray-900 text-lg">
                Unable to load products
              </h3>
              <p className="text-gray-600 text-sm">
                Please try refreshing the page.
              </p>
            </div>
          </div>
        }
      >
        <div className={gridClass}>
          {products.map((product) => (
            <ProductCard
              dictionary={dictionary}
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </ErrorBoundary>
    );
  }

  // Virtualized version for large lists
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <div className="text-center">
            <h3 className="mb-2 font-semibold text-gray-900 text-lg">
              Unable to load products
            </h3>
            <p className="text-gray-600 text-sm">
              Please try refreshing the page.
            </p>
          </div>
        </div>
      }
    >
      <div
        className="w-full"
        ref={parentRef}
        style={{ height: `${containerHeight}px`, overflow: 'auto' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const rowIndex = virtualRow.index;
            const startIndex = rowIndex * columns;
            const rowProducts = products.slice(
              startIndex,
              startIndex + columns
            );

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className={gridClass}>
                  {rowProducts.map((product) => (
                    <ProductCard
                      dictionary={dictionary}
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ErrorBoundary>
  );
}
