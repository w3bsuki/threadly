'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@repo/design-system/components/ui/dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Separator } from '@repo/design-system/components/ui/separator';
import { 
  Heart, 
  Share2, 
  ShoppingCart, 
  Eye,
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@repo/design-system/lib/utils';

interface ProductQuickViewProps {
  product: {
    id: string;
    title: string;
    brand: string;
    price: number;
    originalPrice?: number | null;
    size: string;
    condition: string;
    categoryName: string;
    images: string[];
    seller: {
      id: string;
      name: string;
      location: string;
      rating: number;
    };
    favoritesCount: number;
    createdAt: Date;
  };
  trigger?: React.ReactNode;
}

const conditionLabels = {
  'NEW_WITH_TAGS': 'New with tags',
  'NEW_WITHOUT_TAGS': 'New without tags',
  'VERY_GOOD': 'Very good',
  'GOOD': 'Good',
  'SATISFACTORY': 'Satisfactory',
  'FAIR': 'Fair'
};

const conditionColors = {
  'NEW_WITH_TAGS': 'bg-green-100 text-green-800',
  'NEW_WITHOUT_TAGS': 'bg-blue-100 text-blue-800',
  'VERY_GOOD': 'bg-purple-100 text-purple-800',
  'GOOD': 'bg-yellow-100 text-yellow-800',
  'SATISFACTORY': 'bg-orange-100 text-orange-800',
  'FAIR': 'bg-gray-100 text-gray-800'
};

export function ProductQuickView({ product, trigger }: ProductQuickViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement favorites API call
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const validImages = product.images.filter(img => 
    img && !img.includes('placehold.co') && !img.includes('picsum.photos')
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white/90 hover:bg-white border-gray-200"
          >
            <Eye className="h-4 w-4 mr-1" />
            Quick View
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 m-2 md:m-6">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex flex-col md:grid md:grid-cols-2 max-h-[95vh]">
          {/* Image Section */}
          <div className="relative bg-gray-100 md:min-h-0">
            <div className="aspect-[4/3] md:aspect-square relative">
              {validImages.length > 0 ? (
                <Image
                  src={validImages[currentImageIndex] || validImages[0]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}

              {/* Image Navigation */}
              {validImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
                    {validImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          index === currentImageIndex ? "bg-white" : "bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Condition badge */}
              <div className="absolute top-4 left-4">
                <Badge 
                  className={cn(
                    "text-xs font-medium",
                    conditionColors[product.condition as keyof typeof conditionColors] || "bg-gray-100 text-gray-800"
                  )}
                >
                  {conditionLabels[product.condition as keyof typeof conditionLabels] || product.condition}
                </Badge>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 flex flex-col">
            {/* Mobile: Sticky action bar at bottom */}
            <div className="md:hidden order-last bg-white border-t p-4 space-y-3">
              <Button 
                className="w-full bg-black text-white hover:bg-gray-800 h-12 text-base font-medium"
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = `/checkout/${product.id}`;
                }}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Buy Now - ${product.price.toFixed(2)}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleToggleLike}
                  className={cn(
                    "h-10",
                    isLiked ? "border-red-300 text-red-600 bg-red-50" : ""
                  )}
                >
                  <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current")} />
                  {isLiked ? 'Saved' : 'Save'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-10"
                  onClick={() => setIsOpen(false)}
                  asChild
                >
                  <Link href={`/product/${product.id}`}>
                    View More
                  </Link>
                </Button>
              </div>
            </div>

            {/* Content area */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1">
            {/* Header */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">
                {product.brand}
              </p>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {product.title}
              </h2>
              
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Size {product.size}</span>
                <span>•</span>
                <span>{product.categoryName}</span>
                <span>•</span>
                <span>{formatTimeAgo(product.createdAt)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Seller Info */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Sold by</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {product.seller.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {product.seller.name}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{product.seller.rating.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{product.seller.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Desktop Action Buttons */}
            <div className="hidden md:block space-y-3">
              <Button 
                className="w-full bg-black text-white hover:bg-gray-800 h-12 text-base font-medium"
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = `/checkout/${product.id}`;
                }}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Buy Now
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleToggleLike}
                  className={cn(
                    "h-10",
                    isLiked ? "border-red-300 text-red-600 bg-red-50" : ""
                  )}
                >
                  <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current")} />
                  {isLiked ? 'Saved' : 'Save'}
                </Button>
                
                <Button variant="outline" className="h-10">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full h-10"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link href={`/product/${product.id}`}>
                  View Full Details
                </Link>
              </Button>
            </div>

            {/* Product Stats */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{product.favoritesCount} people saved this</span>
                <span>Listed {formatTimeAgo(product.createdAt)}</span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}