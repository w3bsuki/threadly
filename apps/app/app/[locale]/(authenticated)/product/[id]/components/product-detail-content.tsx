'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ProductImageGallery } from '@repo/design-system/components/marketplace/product-image';
import { LazyImage } from '@repo/design-system/components';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import { toast } from '@repo/design-system/components';
import { ReportDialog } from '@/components/report-dialog';
import {
  Heart,
  Share2,
  MessageCircle,
  Package,
  Shield,
  Calendar,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Truck,
  Eye,
  User,
  CreditCard,
  ArrowLeft,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import type { Product, ProductImage, User, Category } from '@repo/database';

interface ProductWithRelations extends Product {
  images: ProductImage[];
  seller: User & {
    profileImage?: string | null;
    averageRating?: number;
    _count: {
      productsAsseller: number;
    };
  };
  category: Category;
  _count: {
    favorites: number;
  };
}

interface ProductDetailContentProps {
  product: ProductWithRelations;
  currentUser: User;
  isFavorited: boolean;
  similarProducts: ProductWithRelations[];
  sellerProducts: ProductWithRelations[];
}

export const ProductDetailContent = ({
  product,
  currentUser,
  isFavorited,
  similarProducts,
  sellerProducts,
}: ProductDetailContentProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favorited, setFavorited] = useState(isFavorited);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount); // Price is already in dollars
  };

  const getSellerName = (seller: User) => {
    if (seller.firstName && seller.lastName) {
      return `${seller.firstName} ${seller.lastName}`;
    }
    return 'Unknown Seller';
  };

  const getSellerInitials = (seller: User) => {
    if (seller.firstName && seller.lastName) {
      return `${seller.firstName[0]}${seller.lastName[0]}`;
    }
    return 'U';
  };

  const handleFavoriteToggle = () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/favorites/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: product.id }),
        });

        if (response.ok) {
          setFavorited(!favorited);
          toast.success(favorited ? 'Removed from favorites' : 'Added to favorites');
        } else {
          toast.error('Failed to update favorites');
        }
      } catch (error) {
        toast.error('Something went wrong');
      }
    });
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    router.push(`/checkout/${product.id}`);
  };

  const handleMessageSeller = () => {
    router.push(`/messages?user=${product.seller.id}&product=${product.id}`);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev < product.images.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev > 0 ? prev - 1 : product.images.length - 1
    );
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse
        </Button>
        
        <div className="text-sm text-muted-foreground">
          <Link href="/browse" className="hover:underline">Browse</Link>
          {' > '}
          <Link href={`/browse?category=${product.category.id}`} className="hover:underline">
            {product.category.name}
          </Link>
          {' > '}
          <span>{product.title}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <ProductImageGallery
            images={product.images || []}
            currentIndex={currentImageIndex}
            onImageChange={setCurrentImageIndex}
            aspectRatio="1/1"
            showThumbnails={true}
            className="w-full"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Title and Actions */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold">{product.title}</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleFavoriteToggle}
                  disabled={isPending}
                >
                  <Heart 
                    className={cn(
                      "h-4 w-4",
                      favorited ? "fill-red-500 text-red-500" : ""
                    )}
                  />
                </Button>
                <Button variant="outline" size="icon" onClick={shareProduct}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <ReportDialog
                      type="PRODUCT"
                      targetId={product.id}
                      targetName={product.title}
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Report Product
                      </DropdownMenuItem>
                    </ReportDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {product.views || 0} views
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {product._count.favorites} favorites
              </div>
            </div>
          </div>

          {/* Price and Status */}
          <div className="space-y-3">
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(product.price)}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {product.condition.toLowerCase()}
              </Badge>
              <Badge>{product.category.name}</Badge>
              <Badge variant="secondary">Available</Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleBuyNow} className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
              <Button variant="outline" onClick={handleAddToCart} className="w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
            <Button 
              variant="outline" 
              onClick={handleMessageSeller}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message Seller
            </Button>
          </div>

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={product.seller.profileImage || undefined} />
                  <AvatarFallback>
                    {getSellerInitials(product.seller)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{getSellerName(product.seller)}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {product.seller.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {product.seller.averageRating.toFixed(1)}
                      </div>
                    )}
                    <span>•</span>
                    <span>{product.seller._count.productsAsseller} sales</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild className="flex-1">
                  <Link href={`/seller/${product.seller.id}`}>
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
                <Button size="sm" variant="outline" onClick={handleMessageSeller}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Category:</span>
                  <p className="text-muted-foreground">{product.category.name}</p>
                </div>
                <div>
                  <span className="font-medium">Condition:</span>
                  <p className="text-muted-foreground capitalize">
                    {product.condition.toLowerCase()}
                  </p>
                </div>
                {product.size && (
                  <div>
                    <span className="font-medium">Size:</span>
                    <p className="text-muted-foreground">{product.size}</p>
                  </div>
                )}
                {product.brand && (
                  <div>
                    <span className="font-medium">Brand:</span>
                    <p className="text-muted-foreground">{product.brand}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trust & Safety */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Protected Purchase</span>
              </div>
              <p className="text-sm text-green-600">
                Your payment is protected. If the item doesn't match the description, get your money back.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Similar Items</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {similarProducts.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <LazyImage
                  src={item.images[0]?.imageUrl || ''}
                  alt={item.title}
                  aspectRatio="square"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-200 rounded-t-lg"
                  quality={75}
                  blur={true}
                />
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-2 mb-2">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-600">
                      {formatCurrency(item.price)}
                    </span>
                    <Button size="sm" asChild>
                      <Link href={`/product/${item.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Seller's Other Items */}
      {sellerProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">
            More from {getSellerName(product.seller)}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sellerProducts.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <LazyImage
                  src={item.images[0]?.imageUrl || ''}
                  alt={item.title}
                  aspectRatio="square"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-200 rounded-t-lg"
                  quality={75}
                  blur={true}
                />
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-2 mb-2">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-600">
                      {formatCurrency(item.price)}
                    </span>
                    <Button size="sm" asChild>
                      <Link href={`/product/${item.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};