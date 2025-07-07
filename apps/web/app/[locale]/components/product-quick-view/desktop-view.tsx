'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTrigger } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import { ScrollArea } from '@repo/design-system/components';
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
  ZoomIn,
  Maximize2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@repo/design-system/lib/utils';
import { toast } from '@repo/design-system';
import { useCartStore } from '../../../../lib/stores/cart-store';
import { formatCurrency } from '../../../../lib/utils/currency';

interface ProductQuickViewDesktopProps {
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

export function ProductQuickViewDesktop({ 
  product, 
  trigger,
  open,
  onOpenChange 
}: ProductQuickViewDesktopProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { addItem, isInCart } = useCartStore();
  const isProductInCart = isInCart(product.id);
  const router = useRouter();

  const validImages = product.images.filter(img => 
    img && !img.includes('placehold.co') && !img.includes('picsum.photos')
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentImageIndex < validImages.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentImageIndex, validImages.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
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
    onOpenChange?.(false);
    router.push(`/checkout/${product.id}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/product/${product.id}`);
    toast.success('Link copied to clipboard');
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
      
      <DialogContent className="!max-w-[90vw] !w-[90vw] xl:!max-w-[1400px] !p-0 overflow-hidden h-[90vh] !gap-0" hideCloseButton>
        {/* Custom close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange?.(false)}
          className="absolute top-4 right-4 z-50 bg-white/90 hover:bg-white rounded-full h-10 w-10 shadow-lg"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="grid lg:grid-cols-[60%_40%] h-full">
          {/* Image Section */}
          <div className="relative bg-gray-50 h-full">
            <div className="relative h-full flex flex-col">
              {/* Main Image */}
              <div 
                className="relative flex-1 cursor-zoom-in overflow-hidden"
                onClick={() => setIsZoomed(!isZoomed)}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setIsZoomed(false)}
              >
                {validImages.length > 0 ? (
                  <>
                    <Image
                      src={validImages[currentImageIndex] || validImages[0]}
                      alt={product.title}
                      fill
                      className={cn(
                        "object-contain transition-transform duration-200",
                        isZoomed ? "scale-150" : ""
                      )}
                      style={isZoomed ? {
                        transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                      } : {}}
                      priority
                      sizes="50vw"
                    />
                    
                    {/* Zoom indicator */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center space-x-2 text-sm shadow-md">
                      {isZoomed ? <Maximize2 className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                      <span>{isZoomed ? 'Click to zoom out' : 'Click to zoom'}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}

                {/* Navigation Arrows */}
                {validImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(prev => prev === 0 ? validImages.length - 1 : prev - 1);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full h-10 w-10 p-0 shadow-lg"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(prev => prev === validImages.length - 1 ? 0 : prev + 1);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full h-10 w-10 p-0 shadow-lg"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}

                {/* Condition badge */}
                <div className="absolute top-4 left-4">
                  <Badge 
                    className={cn(
                      "text-sm font-medium shadow-lg",
                      conditionColors[product.condition as keyof typeof conditionColors] || "bg-gray-100 text-gray-800"
                    )}
                  >
                    {conditionLabels[product.condition as keyof typeof conditionLabels] || product.condition}
                  </Badge>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {validImages.length > 1 && (
                <div className="border-t bg-white p-4">
                  <ScrollArea className="w-full">
                    <div className="flex space-x-2">
                      {validImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                            index === currentImageIndex 
                              ? "border-black" 
                              : "border-gray-200 hover:border-gray-400"
                          )}
                        >
                          <Image
                            src={image}
                            alt={`${product.title} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col h-full bg-white">
            <ScrollArea className="flex-1">
              <div className="p-8 lg:p-10">
                {/* Header */}
                <div className="mb-8">
                  <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-3">
                    {product.brand}
                  </p>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {product.title}
                  </h2>
                  
                  <div className="flex items-baseline space-x-4 mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="text-2xl text-gray-500 line-through">
                          {formatCurrency(product.originalPrice)}
                        </span>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <span className="text-gray-600">Size</span>
                      <span className="font-semibold text-gray-900">{product.size}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <span className="text-gray-600">Category</span>
                      <span className="font-semibold text-gray-900">{product.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>Listed {formatTimeAgo(product.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Seller Info */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
                  <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-2xl font-bold text-white">
                        {product.seller.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900">
                        {product.seller.name}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-semibold text-gray-900">{product.seller.rating.toFixed(1)}</span>
                          <span className="text-gray-500 ml-1">rating</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{product.seller.location}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="hidden lg:flex">
                      View Profile
                    </Button>
                  </div>
                </div>

                {/* Product Stats */}
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Heart className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">{product.favoritesCount}</span>
                          <span className="text-gray-600 ml-1">saves</span>
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={`/product/${product.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      onClick={() => onOpenChange?.(false)}
                    >
                      View Full Details
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="border-t bg-gradient-to-b from-white to-gray-50 p-6 lg:p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant={isProductInCart ? "secondary" : "outline"}
                  size="lg"
                  className="h-14 text-base font-semibold relative overflow-hidden group"
                  onClick={handleAddToCart}
                  disabled={isProductInCart}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isProductInCart ? (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2 fill-current" />
                        In Cart
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </span>
                  {!isProductInCart && (
                    <span className="absolute inset-0 bg-gray-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  )}
                </Button>
                
                <Button 
                  size="lg"
                  className="bg-black text-white hover:bg-gray-900 h-14 text-base font-semibold relative overflow-hidden group"
                  onClick={handleBuyNow}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Buy Now
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleToggleLike}
                  className={cn(
                    "h-11 font-medium transition-all",
                    isLiked ? "border-red-300 text-red-600 bg-red-50 hover:bg-red-100" : "hover:border-gray-400"
                  )}
                >
                  <Heart className={cn("h-4 w-4 mr-2 transition-all", isLiked && "fill-current")} />
                  {isLiked ? 'Saved' : 'Save to Favorites'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-11 font-medium hover:border-gray-400 transition-all"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}