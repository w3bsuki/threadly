"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "../../../../../lib/stores/cart-store";
import { useFavorites } from "../../../../../lib/hooks/use-favorites";
import { useAnalyticsEvents } from "@repo/analytics";
import { Badge } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { SignInCTA } from "../../../../../components/sign-in-cta";
import { Card, CardContent } from '@repo/design-system/components';
import { toast } from "@repo/design-system";
import { useRouter } from "next/navigation";
import { Separator } from '@repo/design-system/components';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/design-system/components';
import {
  Heart,
  Share2,
  MessageCircle,
  Package,
  Shield,
  Calendar,
  Users,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Truck,
} from "lucide-react";
import { cn } from "@repo/design-system/lib/utils";
// Removed server-only import from client component
import { formatCurrency } from '@/lib/utils/currency';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  size?: string | null;
  brand?: string | null;
  color?: string | null;
  views: number;
  createdAt: Date;
  images: { imageUrl: string; alt?: string | null }[];
  seller: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    joinedAt: Date;
    _count: {
      listings: number;
      followers: number;
    };
  };
  category: {
    id: string;
    name: string;
    slug: string;
    parent?: {
      name: string;
      slug: string;
    } | null;
  };
  _count: {
    favorites: number;
  };
}

interface SimilarProduct {
  id: string;
  title: string;
  price: number;
  images: { imageUrl: string; alt?: string | null }[];
  seller: {
    firstName: string | null;
    lastName: string | null;
  };
}

interface ProductDetailProps {
  product: Product;
  similarProducts: SimilarProduct[];
}

const conditionLabels = {
  NEW_WITH_TAGS: "New with tags",
  NEW_WITHOUT_TAGS: "New without tags",
  VERY_GOOD: "Very good",
  GOOD: "Good",
  SATISFACTORY: "Satisfactory",
};

const conditionColors = {
  NEW_WITH_TAGS: "bg-green-100 text-green-800",
  NEW_WITHOUT_TAGS: "bg-blue-100 text-blue-800",
  VERY_GOOD: "bg-purple-100 text-purple-800",
  GOOD: "bg-yellow-100 text-yellow-800",
  SATISFACTORY: "bg-gray-100 text-gray-800",
};

export function ProductDetail({ product, similarProducts }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const { addItem, isInCart } = useCartStore();
  const { toggleFavorite, checkFavorite, isFavorited, isPending } = useFavorites();
  const { trackProductView, trackCartAdd, trackProductFavorite } = useAnalyticsEvents();
  const galleryRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const isProductInCart = isInCart(product.id);

  const memberSince = new Date(product.seller.joinedAt).getFullYear();

  // Check if product is already favorited on mount and track product view
  useEffect(() => {
    checkFavorite(product.id);
    
    // Track product view for analytics
    trackProductView({
      id: product.id,
      title: product.title,
      price: product.price / 100, // Convert to dollars
      brand: product.brand,
      category: product.category.name,
      condition: product.condition,
      seller_id: product.seller.id,
    });
  }, [product, checkFavorite, trackProductView]);

  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(product.id);
    if (!result.success) {
      console.error('Failed to toggle favorite:', result.error);
    } else {
      // Track favorite action
      trackProductFavorite({
        id: product.id,
        title: product.title,
        price: product.price / 100,
        category: product.category.name,
      }, isFavorited(product.id));
    }
  };

  const handleAddToCart = () => {
    try {
      const sellerName = product.seller.firstName && product.seller.lastName
        ? `${product.seller.firstName} ${product.seller.lastName}`
        : "Anonymous Seller";
        
      addItem({
        productId: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.images[0]?.imageUrl || '',
        sellerId: product.seller.id,
        sellerName,
        condition: product.condition,
        size: product.size || undefined,
      });
      
      // Track add to cart
      trackCartAdd({
        id: product.id,
        title: product.title,
        price: product.price / 100,
        category: product.category.name,
        brand: product.brand,
        condition: product.condition,
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
    handleAddToCart();
    router.push('/cart');
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImageIndex(prev => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex(prev => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Touch swipe handling for mobile
  const handleTouchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!handleTouchStart.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = handleTouchStart.current.x - currentX;
    const diffY = handleTouchStart.current.y - currentY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        handleImageNavigation('next');
      } else {
        handleImageNavigation('prev');
      }
      handleTouchStart.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header - Breadcrumb hidden on mobile */}
      <div className="container px-4 py-4 md:py-6">
        <Breadcrumb className="hidden md:block mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {product.category.parent && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${product.category.parent.slug}`}>
                    {product.category.parent.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${product.category.slug}`}>
                {product.category.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate">{product.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Enhanced Image Gallery */}
          <div className="space-y-3 md:space-y-4">
            <div 
              className="relative aspect-square bg-gray-100 rounded-xl md:rounded-2xl overflow-hidden"
              onTouchStart={(e) => {
                handleTouchStart.current = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY
                };
              }}
              onTouchMove={handleTouchMove}
            >
              {product.images[selectedImageIndex] ? (
                <Image
                  src={product.images[selectedImageIndex].imageUrl}
                  alt={product.images[selectedImageIndex].alt || product.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Package className="h-16 w-16" />
                </div>
              )}

              {/* Image Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleImageNavigation('prev')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full h-10 w-10 p-0 shadow-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleImageNavigation('next')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full h-10 w-10 p-0 shadow-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          index === selectedImageIndex ? "bg-white" : "bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Grid - Desktop only */}
            {product.images.length > 1 && (
              <div className="hidden md:grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors",
                      selectedImageIndex === index 
                        ? "border-black" 
                        : "border-transparent hover:border-gray-300"
                    )}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.alt || `${product.title} ${index + 1}`}
                      width={120}
                      height={120}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3">
                  {product.title}
                </h1>
                <div className="text-3xl md:text-4xl font-bold text-black mb-4">
                  {formatCurrency(product.price)}
                </div>
              </div>
              
              {/* Badges - Mobile optimized */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge 
                  variant="secondary"
                  className={cn(
                    "text-sm font-medium",
                    conditionColors[product.condition as keyof typeof conditionColors]
                  )}
                >
                  {conditionLabels[product.condition as keyof typeof conditionLabels]}
                </Badge>
                {product.size && (
                  <Badge variant="outline" className="text-sm">
                    Size {product.size}
                  </Badge>
                )}
                {product.brand && (
                  <Badge variant="outline" className="text-sm font-medium">
                    {product.brand}
                  </Badge>
                )}
              </div>

              {/* Product Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{product._count.favorites}</span>
                </div>
                <span>•</span>
                <span>{product.views} views</span>
                <span>•</span>
                <span className="hidden sm:inline">
                  Listed {new Date(product.createdAt).toLocaleDateString()}
                </span>
                <span className="sm:hidden">
                  {Math.ceil((Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d ago
                </span>
              </div>
            </div>

            {/* Seller Information - Compact Card */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {product.seller.imageUrl ? (
                    <Image
                      src={product.seller.imageUrl}
                      alt={`${product.seller.firstName} ${product.seller.lastName}` || "Seller"}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/seller/${product.seller.id}`} className="hover:underline">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {product.seller.firstName && product.seller.lastName 
                          ? `${product.seller.firstName} ${product.seller.lastName}` 
                          : "Anonymous Seller"}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>4.8</span>
                      </div>
                      <span>•</span>
                      <span>{product.seller._count.listings} sold</span>
                      <span>•</span>
                      <span className="hidden sm:inline">Member since {memberSince}</span>
                      <span className="sm:hidden">{memberSince}</span>
                    </div>
                  </div>
                  <Link href={`/messages?sellerId=${product.seller.id}&productId=${product.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Message
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Product Details - Collapsed on mobile */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-sm">Details</h3>
                <div className="space-y-2 text-sm">
                  {product.brand && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Brand</span>
                      <span className="font-medium">{product.brand}</span>
                    </div>
                  )}
                  {product.size && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Size</span>
                      <span className="font-medium">{product.size}</span>
                    </div>
                  )}
                  {product.color && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Color</span>
                      <span className="font-medium">{product.color}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Condition</span>
                    <span className="font-medium">
                      {conditionLabels[product.condition as keyof typeof conditionLabels]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category</span>
                    <span className="font-medium">{product.category.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Action Buttons */}
            <div className="hidden md:block space-y-3">
              {isProductInCart ? (
                <Button 
                  size="lg" 
                  className="w-full bg-gray-800 text-white hover:bg-gray-700 h-12 text-base font-medium"
                  onClick={() => router.push('/cart')}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  View Cart
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="w-full bg-black text-white hover:bg-gray-800 h-12 text-base font-medium"
                    onClick={handleBuyNow}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Buy Now
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full h-12 text-base font-medium"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                </>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full h-10"
                  onClick={handleToggleFavorite}
                  disabled={isPending}
                >
                  <Heart className={cn("mr-2 h-4 w-4", isFavorited(product.id) && "fill-current")} />
                  {isFavorited(product.id) ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" className="w-full h-10">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="mt-8 border border-gray-200">
          <CardContent className="p-4 md:p-6">
            <h3 className="font-semibold mb-3 text-base">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </CardContent>
        </Card>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl md:text-2xl font-bold mb-6">Similar Items</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {similarProducts.map((similar) => (
                <Link key={similar.id} href={`/product/${similar.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden">
                    <div className="relative aspect-[3/4] bg-gray-100">
                      {similar.images[0] ? (
                        <Image
                          src={similar.images[0].imageUrl}
                          alt={similar.images[0].alt || similar.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-medium line-clamp-2 mb-1 text-sm leading-tight">
                        {similar.title}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2 truncate">
                        {similar.seller.firstName && similar.seller.lastName 
                          ? `${similar.seller.firstName} ${similar.seller.lastName}` 
                          : "Anonymous"}
                      </p>
                      <span className="text-base font-semibold text-black">
                        {formatCurrency(similar.price)}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-3">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 h-12 border-black text-black hover:bg-gray-50"
            onClick={handleToggleFavorite}
            disabled={isPending}
          >
            <Heart className={cn("mr-2 h-4 w-4", isFavorited(product.id) && "fill-current")} />
            {isFavorited(product.id) ? "Saved" : "Save"}
          </Button>
          <Button variant="outline" className="h-12 px-4 border-gray-300">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        {isProductInCart ? (
          <Button 
            size="lg" 
            className="w-full bg-gray-800 text-white hover:bg-gray-700 h-12 text-base font-medium"
            onClick={() => router.push('/cart')}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            View Cart
          </Button>
        ) : (
          <Button 
            size="lg" 
            className="w-full bg-black text-white hover:bg-gray-800 h-12 text-base font-medium"
            onClick={handleBuyNow}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Buy Now - {formatCurrency(product.price)}
          </Button>
        )}
      </div>

      {/* Mobile bottom padding */}
      <div className="md:hidden h-32" />
    </div>
  );
}