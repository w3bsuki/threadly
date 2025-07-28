'use client';

import type { Category, Product, ProductImage, User } from '@repo/database';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  LazyImage,
  Separator,
  toast,
} from '@repo/design-system/components';
import { ProductImageGallery } from '@repo/design-system/components/marketplace/product-image';
import { cn } from '@repo/design-system/lib/utils';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  MoreVertical,
  Package,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ReportDialog } from '@/components/report-dialog';

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
          toast.success(
            favorited ? 'Removed from favorites' : 'Added to favorites'
          );
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
    <div className="mx-auto max-w-7xl">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button className="mb-4" onClick={() => router.back()} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>

        <div className="text-muted-foreground text-sm">
          <Link className="hover:underline" href="/browse">
            Browse
          </Link>
          {' > '}
          <Link
            className="hover:underline"
            href={`/browse?category=${product.category.id}`}
          >
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
            aspectRatio="1/1"
            className="w-full"
            currentIndex={currentImageIndex}
            images={product.images || []}
            onImageChange={setCurrentImageIndex}
            showThumbnails={true}
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Title and Actions */}
          <div>
            <div className="mb-2 flex items-start justify-between">
              <h1 className="font-bold text-2xl">{product.title}</h1>
              <div className="flex gap-2">
                <Button
                  disabled={isPending}
                  onClick={handleFavoriteToggle}
                  size="icon"
                  variant="outline"
                >
                  <Heart
                    className={cn(
                      'h-4 w-4',
                      favorited ? 'fill-red-500 text-red-500' : ''
                    )}
                  />
                </Button>
                <Button onClick={shareProduct} size="icon" variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="outline">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <ReportDialog
                      targetId={product.id}
                      targetName={product.title}
                      type="PRODUCT"
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Report Product
                      </DropdownMenuItem>
                    </ReportDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground text-sm">
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
            <div className="font-bold text-3xl text-green-600">
              {formatCurrency(product.price)}
            </div>
            <div className="flex items-center gap-2">
              <Badge className="capitalize" variant="outline">
                {product.condition.toLowerCase()}
              </Badge>
              <Badge>{product.category.name}</Badge>
              <Badge variant="secondary">Available</Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button className="w-full" onClick={handleBuyNow}>
                <CreditCard className="mr-2 h-4 w-4" />
                Buy Now
              </Button>
              <Button
                className="w-full"
                onClick={handleAddToCart}
                variant="outline"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
            <Button
              className="w-full"
              onClick={handleMessageSeller}
              variant="outline"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Message Seller
            </Button>
          </div>

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={product.seller.profileImage || undefined} />
                  <AvatarFallback>
                    {getSellerInitials(product.seller)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {getSellerName(product.seller)}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
                <Button asChild className="flex-1" size="sm" variant="outline">
                  <Link href={`/seller/${product.seller.id}`}>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </Link>
                </Button>
                <Button
                  onClick={handleMessageSeller}
                  size="sm"
                  variant="outline"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
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
                <h4 className="mb-2 font-medium">Description</h4>
                <p className="whitespace-pre-wrap text-muted-foreground text-sm">
                  {product.description}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Category:</span>
                  <p className="text-muted-foreground">
                    {product.category.name}
                  </p>
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
              <div className="mb-2 flex items-center gap-2 text-green-700">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Protected Purchase</span>
              </div>
              <p className="text-green-600 text-sm">
                Your payment is protected. If the item doesn't match the
                description, get your money back.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 font-semibold text-xl">Similar Items</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {similarProducts.map((item) => (
              <Card className="transition-shadow hover:shadow-md" key={item.id}>
                <LazyImage
                  alt={item.title}
                  aspectRatio="square"
                  blur={true}
                  className="rounded-t-lg object-cover transition-transform duration-200 hover:scale-105"
                  fill
                  quality={75}
                  src={item.images[0]?.imageUrl || ''}
                />
                <CardContent className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-medium">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-600">
                      {formatCurrency(item.price)}
                    </span>
                    <Button asChild size="sm">
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
          <h2 className="mb-6 font-semibold text-xl">
            More from {getSellerName(product.seller)}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sellerProducts.map((item) => (
              <Card className="transition-shadow hover:shadow-md" key={item.id}>
                <LazyImage
                  alt={item.title}
                  aspectRatio="square"
                  blur={true}
                  className="rounded-t-lg object-cover transition-transform duration-200 hover:scale-105"
                  fill
                  quality={75}
                  src={item.images[0]?.imageUrl || ''}
                />
                <CardContent className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-medium">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-600">
                      {formatCurrency(item.price)}
                    </span>
                    <Button asChild size="sm">
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
