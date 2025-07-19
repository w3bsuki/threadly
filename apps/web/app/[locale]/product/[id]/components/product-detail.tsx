'use client';

import { useAnalyticsEvents } from '@repo/analytics';
import { toast } from '@repo/design-system';
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
} from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import {
  formatPriceForDisplay,
  getRegionByCountryCode,
  type Region,
} from '@repo/internationalization/client';
import { getCookie } from 'cookies-next';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Package,
  Share2,
  ShoppingCart,
  Star,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
// Removed server-only import from client component
import { formatCurrency } from '@/lib/utils/currency';
import { useFavorites } from '../../../../../lib/hooks/use-favorites';
import { useCartStore } from '../../../../../lib/stores/cart-store';

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
  dictionary: any;
}

const conditionLabels = {
  NEW_WITH_TAGS: 'New with tags',
  NEW_WITHOUT_TAGS: 'New without tags',
  VERY_GOOD: 'Very good',
  GOOD: 'Good',
  SATISFACTORY: 'Satisfactory',
};

const conditionColors = {
  NEW_WITH_TAGS: 'bg-green-100 text-green-800',
  NEW_WITHOUT_TAGS: 'bg-blue-100 text-blue-800',
  VERY_GOOD: 'bg-purple-100 text-purple-800',
  GOOD: 'bg-yellow-100 text-yellow-800',
  SATISFACTORY: 'bg-secondary text-foreground/90',
};

export function ProductDetail({
  product,
  similarProducts,
  dictionary,
}: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [_isImageGalleryOpen, _setIsImageGalleryOpen] = useState(false);
  const { addItem, isInCart } = useCartStore();
  const { toggleFavorite, checkFavorite, isFavorited, isPending } =
    useFavorites();
  const { trackProductView, trackCartAdd, trackProductFavorite } =
    useAnalyticsEvents();
  const _galleryRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isProductInCart = isInCart(product.id);

  // Get user's region for price display
  const [userRegion, setUserRegion] = useState<Region | undefined>();
  const [userCurrency, setUserCurrency] = useState<string>('USD');

  const memberSince = new Date(product.seller.joinedAt).getFullYear();

  // Check if product is already favorited on mount and track product view
  useEffect(() => {
    checkFavorite(product.id);

    // Get user's region and currency preferences
    const regionCode = getCookie('region') as string;
    const currency = (getCookie('preferredCurrency') as string) || 'USD';
    if (regionCode) {
      const region = getRegionByCountryCode(regionCode);
      setUserRegion(region);
    }
    setUserCurrency(currency);

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
    if (result.success) {
      // Track favorite action
      trackProductFavorite(
        {
          id: product.id,
          title: product.title,
          price: product.price / 100,
          category: product.category.name,
        },
        isFavorited(product.id)
      );
    }
  };

  const handleAddToCart = () => {
    try {
      const sellerName =
        product.seller.firstName && product.seller.lastName
          ? `${product.seller.firstName} ${product.seller.lastName}`
          : 'Anonymous Seller';

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
    handleAddToCart();
    router.push('/cart');
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Touch swipe handling for mobile
  const handleTouchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!handleTouchStart.current) {
      return;
    }

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
    <div className="min-h-screen bg-background">
      {/* Mobile Header - Breadcrumb hidden on mobile */}
      <div className="container px-4 py-4 md:py-6">
        <Breadcrumb className="mb-6 hidden md:block">
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
              <BreadcrumbPage className="truncate">
                {product.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Enhanced Image Gallery */}
          <div className="space-y-3 md:space-y-4">
            <div
              className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-secondary md:rounded-[var(--radius-2xl)]"
              onTouchMove={handleTouchMove}
              onTouchStart={(e) => {
                handleTouchStart.current = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY,
                };
              }}
            >
              {product.images[selectedImageIndex] ? (
                <Image
                  alt={product.images[selectedImageIndex].alt || product.title}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  src={product.images[selectedImageIndex].imageUrl}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground/70">
                  <Package className="h-16 w-16" />
                </div>
              )}

              {/* Image Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <Button
                    className="-translate-y-1/2 absolute top-1/2 left-2 h-10 w-10 rounded-[var(--radius-full)] bg-background/80 p-0 shadow-sm backdrop-blur-sm hover:bg-background"
                    onClick={() => handleImageNavigation('prev')}
                    size="sm"
                    variant="ghost"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    className="-translate-y-1/2 absolute top-1/2 right-2 h-10 w-10 rounded-[var(--radius-full)] bg-background/80 p-0 shadow-sm backdrop-blur-sm hover:bg-background"
                    onClick={() => handleImageNavigation('next')}
                    size="sm"
                    variant="ghost"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {/* Image indicators */}
                  <div className="-translate-x-1/2 absolute bottom-4 left-1/2 flex space-x-2">
                    {product.images.map((_, index) => (
                      <button
                        className={cn(
                          'h-2 w-2 rounded-[var(--radius-full)] transition-colors',
                          index === selectedImageIndex
                            ? 'bg-background'
                            : 'bg-background/50'
                        )}
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Grid - Desktop only */}
            {product.images.length > 1 && (
              <div className="hidden grid-cols-4 gap-2 md:grid">
                {product.images.map((image, index) => (
                  <button
                    className={cn(
                      'aspect-square overflow-hidden rounded-[var(--radius-lg)] border-2 bg-secondary transition-colors',
                      selectedImageIndex === index
                        ? 'border-black'
                        : 'border-transparent hover:border-gray-300'
                    )}
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      alt={image.alt || `${product.title} ${index + 1}`}
                      className="h-full w-full object-cover"
                      height={120}
                      src={image.imageUrl}
                      width={120}
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
                <h1 className="mb-3 font-bold text-2xl leading-tight md:text-3xl">
                  {product.title}
                </h1>
                <div className="mb-4">
                  <div className="font-bold text-3xl text-foreground md:text-4xl">
                    {userRegion
                      ? formatPriceForDisplay(
                          product.price,
                          userRegion,
                          userCurrency as any
                        ).displayPrice
                      : formatCurrency(product.price)}
                  </div>
                  {userRegion && (
                    <p className="mt-1 text-muted-foreground text-sm">
                      {
                        formatPriceForDisplay(
                          product.price,
                          userRegion,
                          userCurrency as any
                        ).taxInfo
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Badges - Mobile optimized */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    'font-medium text-sm',
                    conditionColors[
                      product.condition as keyof typeof conditionColors
                    ]
                  )}
                  variant="secondary"
                >
                  {
                    conditionLabels[
                      product.condition as keyof typeof conditionLabels
                    ]
                  }
                </Badge>
                {product.size && (
                  <Badge className="text-sm" variant="outline">
                    Size {product.size}
                  </Badge>
                )}
                {product.brand && (
                  <Badge className="font-medium text-sm" variant="outline">
                    {product.brand}
                  </Badge>
                )}
              </div>

              {/* Product Stats */}
              <div className="flex items-center gap-4 text-muted-foreground text-sm">
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
                  {Math.ceil(
                    (Date.now() - new Date(product.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                  d ago
                </span>
              </div>
            </div>

            {/* Seller Information - Compact Card */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {product.seller.imageUrl ? (
                    <Image
                      alt={
                        `${product.seller.firstName} ${product.seller.lastName}` ||
                        'Seller'
                      }
                      className="rounded-[var(--radius-full)]"
                      height={48}
                      src={product.seller.imageUrl}
                      width={48}
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-accent">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      className="hover:underline"
                      href={`/seller/${product.seller.id}`}
                    >
                      <h3 className="truncate font-semibold text-foreground text-sm">
                        {product.seller.firstName && product.seller.lastName
                          ? `${product.seller.firstName} ${product.seller.lastName}`
                          : 'Anonymous Seller'}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3 text-muted-foreground text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>4.8</span>
                      </div>
                      <span>•</span>
                      <span>{product.seller._count.listings} sold</span>
                      <span>•</span>
                      <span className="hidden sm:inline">
                        Member since {memberSince}
                      </span>
                      <span className="sm:hidden">{memberSince}</span>
                    </div>
                  </div>
                  <Link
                    href={`/messages?sellerId=${product.seller.id}&productId=${product.id}`}
                  >
                    <Button className="text-xs" size="sm" variant="outline">
                      <MessageCircle className="mr-1 h-3 w-3" />
                      Message
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Product Details - Collapsed on mobile */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <h3 className="mb-3 font-semibold text-sm">Details</h3>
                <div className="space-y-2 text-sm">
                  {product.brand && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brand</span>
                      <span className="font-medium">{product.brand}</span>
                    </div>
                  )}
                  {product.size && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size</span>
                      <span className="font-medium">{product.size}</span>
                    </div>
                  )}
                  {product.color && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color</span>
                      <span className="font-medium">{product.color}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condition</span>
                    <span className="font-medium">
                      {
                        conditionLabels[
                          product.condition as keyof typeof conditionLabels
                        ]
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{product.category.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Action Buttons */}
            <div className="hidden space-y-3 md:block">
              {isProductInCart ? (
                <Button
                  className="h-12 w-full bg-primary/90 font-medium text-base text-background hover:bg-secondary-foreground"
                  onClick={() => router.push('/cart')}
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  View Cart
                </Button>
              ) : (
                <>
                  <Button
                    className="h-12 w-full bg-primary font-medium text-base text-background hover:bg-primary/90"
                    onClick={handleBuyNow}
                    size="lg"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Buy Now
                  </Button>
                  <Button
                    className="h-12 w-full font-medium text-base"
                    onClick={handleAddToCart}
                    size="lg"
                    variant="outline"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="h-10 w-full"
                  disabled={isPending}
                  onClick={handleToggleFavorite}
                  variant="outline"
                >
                  <Heart
                    className={cn(
                      'mr-2 h-4 w-4',
                      isFavorited(product.id) && 'fill-current'
                    )}
                  />
                  {isFavorited(product.id) ? 'Saved' : 'Save'}
                </Button>
                <Button className="h-10 w-full" variant="outline">
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
            <h3 className="mb-3 font-semibold text-base">Description</h3>
            <p className="whitespace-pre-wrap text-secondary-foreground leading-relaxed">
              {product.description}
            </p>
          </CardContent>
        </Card>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-6 font-bold text-xl md:text-2xl">
              Similar Items
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {similarProducts.map((similar) => (
                <Link href={`/product/${similar.id}`} key={similar.id}>
                  <Card className="group overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg">
                    <div className="relative aspect-[3/4] bg-secondary">
                      {similar.images[0] ? (
                        <Image
                          alt={similar.images[0].alt || similar.title}
                          className="object-cover transition-transform duration-200 group-hover:scale-105"
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          src={similar.images[0].imageUrl}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground/70">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h4 className="mb-1 line-clamp-2 font-medium text-sm leading-tight">
                        {similar.title}
                      </h4>
                      <p className="mb-2 truncate text-muted-foreground text-xs">
                        {similar.seller.firstName && similar.seller.lastName
                          ? `${similar.seller.firstName} ${similar.seller.lastName}`
                          : 'Anonymous'}
                      </p>
                      <span className="font-semibold text-base text-foreground">
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
      <div className="fixed right-0 bottom-0 left-0 space-y-3 border-gray-200 border-t bg-background p-4 md:hidden">
        <div className="flex gap-3">
          <Button
            className="h-12 flex-1 border-black text-foreground hover:bg-muted"
            disabled={isPending}
            onClick={handleToggleFavorite}
            variant="outline"
          >
            <Heart
              className={cn(
                'mr-2 h-4 w-4',
                isFavorited(product.id) && 'fill-current'
              )}
            />
            {isFavorited(product.id)
              ? dictionary.web.global.navigation.saved || 'Saved'
              : dictionary.web.cart.save || 'Save'}
          </Button>
          <Button className="h-12 border-gray-300 px-4" variant="outline">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        {isProductInCart ? (
          <Button
            className="h-12 w-full bg-primary/90 font-medium text-base text-background hover:bg-secondary-foreground"
            onClick={() => router.push('/cart')}
            size="lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {dictionary.web.global.navigation.myCart || 'View Cart'}
          </Button>
        ) : (
          <Button
            className="h-12 w-full bg-primary font-medium text-base text-background hover:bg-primary/90"
            onClick={handleBuyNow}
            size="lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {dictionary.web.cart.addToCart || 'Buy Now'} -{' '}
            {userRegion
              ? formatPriceForDisplay(
                  product.price,
                  userRegion,
                  userCurrency as any
                ).displayPrice
              : formatCurrency(product.price)}
          </Button>
        )}
      </div>

      {/* Mobile bottom padding */}
      <div className="h-32 md:hidden" />
    </div>
  );
}
