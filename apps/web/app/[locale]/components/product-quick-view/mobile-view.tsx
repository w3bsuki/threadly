'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose
} from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import { 
  Heart, 
  Share2, 
  ShoppingCart, 
  Eye,
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Minus
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@repo/design-system/lib/utils';
import { toast } from '@repo/design-system';
import { useCartStore } from '../../../../lib/stores/cart-store';
import { formatCurrency } from '../../../../lib/utils/currency';
import { OptimizedImage } from '../optimized-image';

interface ProductQuickViewMobileProps {
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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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

export function ProductQuickViewMobile({ 
  product, 
  trigger,
  open,
  onOpenChange 
}: ProductQuickViewMobileProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const { addItem, isInCart } = useCartStore();
  const isProductInCart = isInCart(product.id);
  const router = useRouter();

  const validImages = product.images.filter(img => 
    img && !img.includes('placehold.co') && !img.includes('picsum.photos')
  );

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentImageIndex < validImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleToggleLike = async () => {
    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }
    } catch (error) {
      setIsLiked(isLiked);
      toast.error('Failed to save favorite');
    }
  };

  const handleAddToCart = () => {
    try {
      addItem({
        productId: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.images[0] || '',
        sellerId: product.seller.id,
        sellerName: product.seller.name,
        condition: product.condition,
        size: product.size,
      });
      toast.success("Added to cart", {
        description: `${product.title} has been added to your cart.`,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to add item to cart. Please try again.",
      });
    }
  };

  const handleBuyNow = () => {
    if (!isProductInCart) {
      handleAddToCart();
    }
    onOpenChange?.(false);
    router.push('/cart');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} for ${formatCurrency(product.price)}`,
          url: `/product/${product.id}`,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + `/product/${product.id}`);
      toast.success('Link copied to clipboard');
    }
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="sm"
            className="p-2"
          >
            <Eye className="h-5 w-5" />
          </Button>
        )}
      </DrawerTrigger>
      
      <DrawerContent className="h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Image Section - Fixed aspect ratio */}
          <div className="relative aspect-square bg-gray-100">
            {validImages.length > 0 ? (
              <div
                className="relative w-full h-full"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <OptimizedImage
                  src={validImages[currentImageIndex] || validImages[0]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">
                <span className="text-gray-400">No image available</span>
              </div>
            )}

            {/* Close button */}
            <DrawerClose className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md">
              <X className="h-5 w-5" />
            </DrawerClose>

            {/* Condition badge */}
            <div className="absolute top-3 left-3">
              <Badge 
                className={cn(
                  "text-xs font-medium shadow-md",
                  conditionColors[product.condition as keyof typeof conditionColors] || "bg-gray-100 text-gray-800"
                )}
              >
                {conditionLabels[product.condition as keyof typeof conditionLabels] || product.condition}
              </Badge>
            </div>

            {/* Image indicators */}
            {validImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                {validImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentImageIndex 
                        ? "bg-white w-6" 
                        : "bg-white/50"
                    )}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 -webkit-overflow-scrolling-touch">
            {/* Header */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">
                {product.brand}
              </p>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {product.title}
              </h2>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Heart className="h-4 w-4" />
                  <span>{product.favoritesCount}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Size {product.size}</span>
                <span>•</span>
                <span>{product.categoryName}</span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Seller Info */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Sold by</h3>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {product.seller.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
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

            {/* Product Stats */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Listed {formatTimeAgo(product.createdAt)}</span>
                <Link 
                  href={`/product/${product.id}`}
                  className="text-black font-medium"
                  onClick={() => onOpenChange?.(false)}
                >
                  View Full Details →
                </Link>
              </div>
            </div>
          </div>

          {/* Fixed Action Bar */}
          <div className="border-t bg-white p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant={isProductInCart ? "secondary" : "default"}
                onClick={handleAddToCart}
                disabled={isProductInCart}
                className="h-12 text-sm font-medium"
              >
                {isProductInCart ? (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-1.5 fill-current" />
                    In Cart
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add to Cart
                  </>
                )}
              </Button>
              
              <Button 
                className="h-12 text-sm font-medium bg-black text-white hover:bg-gray-800"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleToggleLike}
                className={cn(
                  "h-10 text-sm",
                  isLiked ? "border-red-300 text-red-600 bg-red-50" : ""
                )}
              >
                <Heart className={cn("h-4 w-4 mr-1.5", isLiked && "fill-current")} />
                {isLiked ? 'Saved' : 'Save'}
              </Button>
              
              <Button 
                variant="outline" 
                className="h-10 text-sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-1.5" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}