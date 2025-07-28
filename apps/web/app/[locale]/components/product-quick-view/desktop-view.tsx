'use client';

import { toast } from '@repo/design-system';
import {
  Badge,
  Button,
  ConditionBadge,
  Dialog,
  DialogContent,
  DialogTrigger,
  ScrollArea,
  Separator,
} from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MapPin,
  Maximize2,
  Plus,
  Share2,
  ShoppingCart,
  Star,
  X,
  ZoomIn,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

export function ProductQuickViewDesktop({
  product,
  trigger,
  open,
  onOpenChange,
}: ProductQuickViewDesktopProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { addItem, isInCart } = useCartStore();
  const isProductInCart = isInCart(product.id);
  const router = useRouter();

  const validImages = product.images.filter(
    (img) =>
      img && !img.includes('placehold.co') && !img.includes('picsum.photos')
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) {
        return;
      }

      if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
        setCurrentImageIndex((prev) => prev - 1);
      } else if (
        e.key === 'ArrowRight' &&
        currentImageIndex < validImages.length - 1
      ) {
        setCurrentImageIndex((prev) => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentImageIndex, validImages.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) {
      return;
    }

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
    } catch (_error) {
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
      toast.success('Added to cart', {
        description: `${product.title} has been added to your cart.`,
      });
    } catch (_error) {
      toast.error('Error', {
        description: 'Failed to add item to cart. Please try again.',
      });
    }
  };

  const handleBuyNow = () => {
    onOpenChange?.(false);
    router.push(`/checkout/${product.id}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/product/${product.id}`
    );
    toast.success('Link copied to clipboard');
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const dateObj = date instanceof Date ? date : new Date(date);
    const diff = now.getTime() - dateObj.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className="border-gray-200 bg-background/90 hover:bg-background"
            size="sm"
            variant="outline"
          >
            <Eye className="mr-1 h-4 w-4" />
            Quick View
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] w-[95vw] max-w-6xl gap-0 overflow-hidden rounded-[var(--radius-xl)] p-0">
        <div className="grid h-full min-h-0 lg:grid-cols-2">
          {/* Image Section */}
          <div className="relative overflow-hidden bg-muted">
            <div className="relative flex h-full flex-col">
              {/* Main Image */}
              <div
                className="relative aspect-square cursor-zoom-in overflow-hidden"
                onClick={() => setIsZoomed(!isZoomed)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                {validImages.length > 0 ? (
                  <>
                    <Image
                      alt={product.title}
                      className={cn(
                        'object-cover transition-transform duration-200',
                        isZoomed ? 'scale-150' : ''
                      )}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      src={validImages[currentImageIndex] || validImages[0]}
                      style={
                        isZoomed
                          ? {
                              transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                            }
                          : {}
                      }
                    />

                    {/* Zoom indicator */}
                    <div className="absolute top-4 right-4 flex items-center space-x-2 rounded-lg bg-background/90 px-3 py-2 text-sm shadow-md backdrop-blur-sm">
                      {isZoomed ? (
                        <Maximize2 className="h-4 w-4" />
                      ) : (
                        <ZoomIn className="h-4 w-4" />
                      )}
                      <span>
                        {isZoomed ? 'Click to zoom out' : 'Click to zoom'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center bg-accent">
                    <span className="text-muted-foreground/70">
                      No image available
                    </span>
                  </div>
                )}

                {/* Navigation Arrows */}
                {validImages.length > 1 && (
                  <>
                    <Button
                      className="-translate-y-1/2 absolute top-1/2 left-4 h-10 w-10 rounded-full bg-background/90 shadow-lg hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? validImages.length - 1 : prev - 1
                        );
                      }}
                      size="icon"
                      variant="ghost"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <Button
                      className="-translate-y-1/2 absolute top-1/2 right-4 h-10 w-10 rounded-full bg-background/90 shadow-lg hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) =>
                          prev === validImages.length - 1 ? 0 : prev + 1
                        );
                      }}
                      size="icon"
                      variant="ghost"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}

                {/* Condition badge */}
                <div className="absolute top-4 left-4">
                  <ConditionBadge
                    className="shadow-lg"
                    condition={product.condition as any}
                  />
                </div>
              </div>

              {/* Thumbnail Strip */}
              {validImages.length > 1 && (
                <div className="border-t bg-background p-4">
                  <ScrollArea className="w-full">
                    <div className="flex space-x-2">
                      {validImages.map((image, index) => (
                        <button
                          className={cn(
                            'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                            index === currentImageIndex
                              ? 'border-primary'
                              : 'border-border hover:border-muted-foreground'
                          )}
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <Image
                            alt={`${product.title} - Image ${index + 1}`}
                            className="object-cover"
                            fill
                            sizes="80px"
                            src={image}
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
          <div className="flex h-full flex-col bg-background">
            <ScrollArea className="flex-1">
              <div className="p-8 lg:p-10">
                {/* Header */}
                <div className="mb-8">
                  <p className="mb-3 font-semibold text-muted-foreground text-sm uppercase tracking-widest">
                    {product.brand}
                  </p>
                  <h2 className="mb-6 font-bold text-3xl text-foreground leading-tight lg:text-4xl">
                    {product.title}
                  </h2>

                  <div className="mb-6 flex items-baseline space-x-4">
                    <span className="font-bold text-4xl text-foreground">
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="text-2xl text-muted-foreground line-through">
                          {formatCurrency(product.originalPrice)}
                        </span>
                        <Badge className="bg-green-50 text-green-600">
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                          )}
                          % OFF
                        </Badge>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-muted px-3 py-1.5">
                      <span className="text-muted-foreground">Size</span>
                      <span className="font-semibold text-foreground">
                        {product.size}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-muted px-3 py-1.5">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-semibold text-foreground">
                        {product.categoryName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>Listed {formatTimeAgo(product.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Seller Info */}
                <div className="mb-8">
                  <h3 className="mb-4 font-semibold text-foreground text-lg">
                    Seller Information
                  </h3>
                  <div className="flex items-center space-x-4 rounded-xl border bg-muted p-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-md">
                      <span className="font-bold text-2xl text-primary-foreground">
                        {product.seller.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-lg">
                        {product.seller.name}
                      </p>
                      <div className="mt-1 flex items-center space-x-4 text-muted-foreground text-sm">
                        <div className="flex items-center">
                          <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-foreground">
                            {product.seller.rating.toFixed(1)}
                          </span>
                          <span className="ml-1 text-muted-foreground">
                            rating
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4 text-muted-foreground/70" />
                          <span>{product.seller.location}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="hidden lg:flex"
                      size="sm"
                      variant="outline"
                    >
                      View Profile
                    </Button>
                  </div>
                </div>

                {/* Product Stats */}
                <div className="rounded-xl border bg-accent p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="rounded-lg bg-background p-2 shadow-sm">
                          <Heart className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">
                            {product.favoritesCount}
                          </span>
                          <span className="ml-1 text-muted-foreground">
                            saves
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      className="flex items-center gap-1 font-medium text-indigo-600 text-sm hover:text-indigo-700"
                      href={`/product/${product.id}`}
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
            <div className="space-y-4 border-t bg-background p-6 lg:p-8">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  className="h-12 font-semibold"
                  disabled={isProductInCart}
                  onClick={handleAddToCart}
                  size="lg"
                  variant={isProductInCart ? 'secondary' : 'outline'}
                >
                  {isProductInCart ? (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5 fill-current" />
                      In Cart
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <Button
                  className="h-12 font-semibold"
                  onClick={handleBuyNow}
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Buy Now
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  className={cn(
                    'h-12 font-medium',
                    isLiked
                      ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                      : ''
                  )}
                  onClick={handleToggleLike}
                  variant="outline"
                >
                  <Heart
                    className={cn('mr-2 h-4 w-4', isLiked && 'fill-current')}
                  />
                  {isLiked ? 'Saved' : 'Save to Favorites'}
                </Button>

                <Button
                  className="h-12 font-medium"
                  onClick={handleShare}
                  variant="outline"
                >
                  <Share2 className="mr-2 h-4 w-4" />
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
