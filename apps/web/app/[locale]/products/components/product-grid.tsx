"use client";

import Link from "next/link";
import { Badge } from '@repo/design-system/components';
import { Heart, Crown, Eye } from "lucide-react";
import { cn } from "@repo/design-system/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";
import { useState } from "react";
import { ProductQuickView } from "../../components/product-quick-view";
import { ProductImage } from "../../components/optimized-image";
import { ProductGridSkeleton } from "../../components/loading-skeleton";
import type { Dictionary } from '@repo/internationalization';

// Inline ProductPlaceholder for loading states
const ProductPlaceholder = ({ className = "w-full h-full" }: { className?: string }) => {
  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center ${className}`}>
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-300"
      >
        <path
          d="M20 25 C20 25, 25 20, 40 20 C55 20, 60 25, 60 25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M40 20 L40 15 C40 12, 42 10, 45 10 C48 10, 50 12, 50 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

// Get time ago string
function getTimeAgo(date: Date, dictionary: Dictionary): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} ${dictionary.web?.global?.time?.minutes || 'minutes'} ${dictionary.web?.global?.time?.ago || 'ago'}`;
  if (diffHours < 24) return `${diffHours} ${dictionary.web?.global?.time?.hours || 'hours'} ${dictionary.web?.global?.time?.ago || 'ago'}`;
  if (diffDays === 1) return `1 ${dictionary.web?.global?.time?.day || 'day'} ${dictionary.web?.global?.time?.ago || 'ago'}`;
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
}

// Condition labels will be mapped from dictionary

const conditionColors = {
  NEW: "bg-green-100 text-green-800",
  LIKE_NEW: "bg-blue-100 text-blue-800",
  EXCELLENT: "bg-purple-100 text-purple-800",
  GOOD: "bg-yellow-100 text-yellow-800",
  SATISFACTORY: "bg-gray-100 text-gray-800",
};

// Designer brands for badge detection
const designerBrands = [
  'GUCCI', 'PRADA', 'CHANEL', 'LOUIS VUITTON', 'VERSACE', 
  'DIOR', 'BALENCIAGA', 'HERMÈS', 'SAINT LAURENT', 'BOTTEGA VENETA',
  'OFF-WHITE', 'BURBERRY', 'FENDI', 'GIVENCHY', 'VALENTINO'
];

// Product card component
const ProductCard = ({ product, dictionary }: { product: Product; dictionary: Dictionary }) => {
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

  const isDesigner = product.brand ? 
    designerBrands.some(brand => product.brand!.toUpperCase().includes(brand)) : false;

  const uploadedAgo = product.createdAt ? getTimeAgo(product.createdAt, dictionary) : dictionary.web?.global?.time?.recently || 'recently';
  
  // Map condition labels from dictionary
  const conditionLabels = {
    NEW: "New",
    NEW_WITH_TAGS: dictionary.web?.global?.filters?.newWithTags || "New with tags",
    NEW_WITHOUT_TAGS: dictionary.web?.global?.filters?.newWithTags || "New without tags",
    LIKE_NEW: dictionary.web?.global?.filters?.likeNew || "Like New", 
    EXCELLENT: "Excellent",
    VERY_GOOD: dictionary.web?.global?.filters?.veryGood || "Very good",
    GOOD: dictionary.web?.global?.filters?.good || "Good",
    SATISFACTORY: dictionary.web?.global?.filters?.fair || "Fair"
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
    images: product.images.map(img => img.imageUrl),
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
    <article className="group relative bg-white" aria-label={`Product: ${product.title}`}>
      <ProductQuickView 
        product={transformedProduct}
        trigger={
          <div className="cursor-pointer">
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 relative">
              {product.images.length > 0 ? (
                <ProductImage
                  src={product.images[0].imageUrl}
                  alt={product.images[0].alt || product.title}
                  className="group-hover:opacity-75 transition-opacity"
                />
              ) : (
                <ProductPlaceholder 
                  className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity" 
                />
              )}
              
              {/* Heart button */}
              <button 
                onClick={handleToggleFavorite}
                disabled={isPending}
                className={`absolute top-2 right-2 p-2 rounded-full transition-all z-10 ${
                  isFavorited ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
                } backdrop-blur-sm`}
                aria-label={isFavorited ? `Remove ${product.title} from favorites` : `Add ${product.title} to favorites`}
                aria-pressed={isFavorited}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>

              {/* Quick View indicator - Shows on hover */}
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-full bg-black/80 text-white backdrop-blur-sm text-xs py-2 px-3 rounded flex items-center justify-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {'Quick View'}
                </div>
              </div>

              {/* Condition badge */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs bg-white/90 text-gray-900">
                  {conditionLabels[product.condition as keyof typeof conditionLabels] || product.condition.replace('_', ' ')}
                </Badge>
              </div>

              {/* Designer badge */}
              {isDesigner && (
                <div className="absolute top-2 left-2 mt-7">
                  <Badge className="text-xs bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 border-0">
                    <Crown className="h-3 w-3 mr-1" />
                    {dictionary.web?.global?.categories?.designer || 'Designer'}
                  </Badge>
                </div>
              )}

              {/* Favorites count */}
              {product._count?.favorites > 0 && (
                <div className="absolute bottom-2 left-2 mb-8">
                  <Badge variant="secondary" className="text-xs bg-white/90 text-gray-900">
                    <Heart className="h-3 w-3 mr-1" />
                    {product._count.favorites}
                  </Badge>
                </div>
              )}
            </div>

            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand || 'Unknown'}</p>
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.title}</h3>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(product.price)}
                </span>
              </div>
              
              <p className="text-xs text-gray-500">{dictionary.web?.global?.filters?.size || 'Size'} One Size</p>
              <p className="text-xs text-gray-400">{product.seller.firstName} • {uploadedAgo}</p>
            </div>
          </div>
        }
      />
    </article>
  );
};

export function ProductGrid({ products, isCompact = false, dictionary }: ProductGridProps) {
  const gridClass = isCompact 
    ? "grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7"
    : "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} dictionary={dictionary} />
      ))}
    </div>
  );
}