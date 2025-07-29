'use client';

import { useAnalyticsEvents } from '@repo/analytics';
import { toast } from '@repo/ui';
import {
  getRegionByCountryCode,
  type Region,
} from '@repo/internationalization/client';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Product, SimilarProduct } from '../../types';
import { MobileStickyActions } from './mobile-sticky-actions';
import { ProductActions } from './product-actions';
import { ProductBreadcrumb } from './product-breadcrumb';
import { ProductDescription } from './product-description';
import { ProductDetailsCard } from './product-details-card';
import { ProductHeader } from './product-header';
import { ProductImageGallery } from './product-image-gallery';
import { SellerInfoCard } from './seller-info-card';
import { SimilarProducts } from './similar-products';

interface ProductDetailContainerProps {
  product: Product;
  similarProducts: SimilarProduct[];
  dictionary: any;
  isInCart: boolean;
  addToCart: (item: any) => void;
  checkFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => Promise<{ success: boolean }>;
  isFavorited: (productId: string) => boolean;
  isPending: boolean;
}

export function ProductDetailContainer({
  product,
  similarProducts,
  dictionary,
  isInCart,
  addToCart,
  checkFavorite,
  toggleFavorite,
  isFavorited: checkIsFavorited,
  isPending,
}: ProductDetailContainerProps) {
  const { trackProductView, trackCartAdd, trackProductFavorite } =
    useAnalyticsEvents();
  const router = useRouter();

  // Get user's region for price display
  const [userRegion, setUserRegion] = useState<Region | undefined>();
  const [userCurrency, setUserCurrency] = useState<string>('USD');

  const isFavorited = checkIsFavorited(product.id);

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
        isFavorited
      );
    }
  };

  const handleAddToCart = () => {
    try {
      const sellerName =
        product.seller.firstName && product.seller.lastName
          ? `${product.seller.firstName} ${product.seller.lastName}`
          : 'Anonymous Seller';

      addToCart({
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-4 md:py-6">
        <ProductBreadcrumb
          category={product.category}
          productTitle={product.title}
        />

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Enhanced Image Gallery */}
          <ProductImageGallery images={product.images} title={product.title} />

          {/* Product Information */}
          <div className="space-y-6">
            <ProductHeader
              product={product}
              userCurrency={userCurrency}
              userRegion={userRegion}
            />

            <SellerInfoCard productId={product.id} seller={product.seller} />

            <ProductDetailsCard product={product} />

            {/* Desktop Action Buttons */}
            <div className="hidden md:block">
              <ProductActions
                isFavorited={isFavorited}
                isInCart={isInCart}
                isPending={isPending}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onToggleFavorite={handleToggleFavorite}
                productId={product.id}
              />
            </div>
          </div>
        </div>

        <ProductDescription description={product.description} />

        <SimilarProducts products={similarProducts} />
      </div>

      {/* Mobile Sticky Action Bar */}
      <MobileStickyActions
        dictionary={dictionary}
        isFavorited={isFavorited}
        isInCart={isInCart}
        isPending={isPending}
        onBuyNow={handleBuyNow}
        onToggleFavorite={handleToggleFavorite}
        price={product.price}
        productId={product.id}
        userCurrency={userCurrency}
        userRegion={userRegion}
      />
    </div>
  );
}
