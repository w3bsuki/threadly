"use client";

import Image from "next/image";
import { Badge } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Heart, Crown, Eye, Star, MapPin } from "lucide-react";
import { cn } from "@repo/design-system/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";
import { useState } from "react";
import { ProductQuickView } from "../../components/product-quick-view";

// Inline ProductPlaceholder for loading states
const ProductPlaceholder = ({ className = "w-full h-full" }: { className?: string }) => {
  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center ${className}`}>
      <svg
        width="60"
        height="60"
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
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
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
  NEW: "New",
  LIKE_NEW: "Like New", 
  EXCELLENT: "Excellent",
  GOOD: "Good",
  SATISFACTORY: "Fair"
};

// Designer brands for badge detection
const designerBrands = [
  'GUCCI', 'PRADA', 'CHANEL', 'LOUIS VUITTON', 'VERSACE', 
  'DIOR', 'BALENCIAGA', 'HERMÈS', 'SAINT LAURENT', 'BOTTEGA VENETA',
  'OFF-WHITE', 'BURBERRY', 'FENDI', 'GIVENCHY', 'VALENTINO'
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

  const isDesigner = product.brand ? 
    designerBrands.some(brand => product.brand!.toUpperCase().includes(brand)) : false;

  const uploadedAgo = product.createdAt ? getTimeAgo(product.createdAt) : 'recently';

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
    <article className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <ProductQuickView 
        product={transformedProduct}
        trigger={
          <div className="cursor-pointer">
            <div className="flex gap-4">
              {/* Product Image */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 relative">
                  {product.images.length > 0 ? (
                    <Image
                      src={product.images[0].imageUrl}
                      alt={product.images[0].alt || product.title}
                      fill
                      className="object-cover object-center group-hover:opacity-75 transition-opacity"
                      sizes="128px"
                    />
                  ) : (
                    <ProductPlaceholder className="h-full w-full" />
                  )}
                  
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
                        Designer
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.brand || 'Unknown'}</p>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">{product.title}</h3>
                  </div>
                  
                  {/* Heart button */}
                  <button 
                    onClick={handleToggleFavorite}
                    disabled={isPending}
                    className={cn(
                      'p-2 rounded-full transition-all',
                      isFavorited ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    )}
                    aria-label={isFavorited ? `Remove ${product.title} from favorites` : `Add ${product.title} to favorites`}
                  >
                    <Heart className={cn('h-5 w-5', isFavorited && 'fill-current')} />
                  </button>
                </div>

                {/* Price and Details */}
                <div className="mb-3">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Size: One Size</span>
                    <span>Category: {product.category}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {product._count?.favorites > 0 && (
                      <div className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {product._count.favorites}
                      </div>
                    )}
                    <span>{product.seller.firstName} • {uploadedAgo}</span>
                  </div>
                </div>
              </div>

              {/* Quick View button */}
              <div className="flex-shrink-0 flex items-center">
                <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-4 w-4 mr-2" />
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