'use client';

import {
  Badge,
  Button,
  PullToRefreshIndicator,
} from '@repo/ui/components';
import { usePullToRefresh } from '@repo/ui/hooks/use-pull-to-refresh';
import { Filter, Heart, ShoppingCart, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Inline ProductPlaceholder for loading states
const ProductPlaceholder = ({
  className = 'w-full h-full',
}: {
  className?: string;
}) => {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}
    >
      <svg
        className="text-gray-300"
        fill="none"
        height="80"
        viewBox="0 0 80 80"
        width="80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 25 C20 25, 25 20, 40 20 C55 20, 60 25, 60 25"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M40 20 L40 15 C40 12, 42 10, 45 10 C48 10, 50 12, 50 15"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

import { toast } from '@repo/ui';
import type { FilterValue } from '@repo/api/utils/validation';
import { ProductQuickView } from '../app/[locale]/components/product-quick-view';
import { useFavorites } from '../lib/hooks/use-favorites';
import { useCartStore } from '../lib/stores/cart-store';
import { formatCurrency } from '../lib/utils/currency';

// TypeScript interfaces - REAL data structures
export interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  size: string;
  condition: string;
  category: string;
  gender: string;
  images: string[];
  seller: {
    id: string;
    name: string;
    location: string;
    rating: number;
  };
  isLiked: boolean;
  isDesigner: boolean;
  uploadedAgo: string;
  _count?: {
    favorites: number;
  };
}

interface FilterState {
  category: string;
  brand: string;
  size: string;
  priceRange: [number, number];
  condition: string;
  searchQuery: string;
}

interface FilterOptions {
  categories: string[];
  brands: string[];
  sizes: string[];
  totalCount: number;
}

// Product card component
const ProductCard = ({ product }: { product: Product }) => {
  const { toggleFavorite, isFavorited, isPending } = useFavorites();
  const { addItem, isInCart } = useCartStore();
  const isProductInCart = isInCart(product.id);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleFavorite(product.id);
    if (!result.success) {
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  // Transform product data to match ProductQuickView interface
  const transformedProduct = {
    id: product.id,
    title: product.title,
    brand: product.brand,
    price: product.price, // Price is already in dollars
    originalPrice: product.originalPrice ? product.originalPrice : null,
    size: product.size,
    condition: product.condition,
    categoryName: product.category,
    images: product.images,
    seller: {
      id: product.seller.id,
      name: product.seller.name,
      location: product.seller.location,
      rating: product.seller.rating,
    },
    favoritesCount: product._count?.favorites || 0,
    createdAt: new Date(), // We don't have this in the current interface, so use current date
  };

  return (
    <article
      aria-label={`Product: ${product.title}`}
      className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-gray-100 bg-background transition-all duration-200 hover:shadow-lg"
    >
      <ProductQuickView
        product={transformedProduct}
        trigger={
          <div className="flex h-full cursor-pointer flex-col">
            {/* Image Container with Wishlist Button */}
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
              {product.images.length > 0 ? (
                <Image
                  alt={product.title}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  fill
                  priority={false}
                  quality={85}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  src={product.images[0]}
                />
              ) : (
                <ProductPlaceholder className="h-full w-full" />
              )}

              {/* Wishlist Button - Top Right */}
              <button
                aria-label={
                  isFavorited(product.id)
                    ? 'Remove from favorites'
                    : 'Add to favorites'
                }
                className={`absolute top-2 right-2 h-9 w-9 rounded-[var(--radius-full)] shadow-sm transition-all ${
                  isFavorited(product.id)
                    ? 'bg-red-500 text-background'
                    : 'bg-background/90 text-secondary-foreground backdrop-blur-sm hover:bg-background'
                } flex items-center justify-center`}
                disabled={isPending}
                onClick={handleToggleFavorite}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorited(product.id) ? 'fill-current' : ''}`}
                />
              </button>

              {/* Status Badge - Top Left */}
              {(product.isDesigner ||
                product.condition === 'NEW_WITH_TAGS') && (
                <div className="absolute top-2 left-2">
                  {product.isDesigner ? (
                    <Badge className="border-0 bg-[var(--brand-primary)] px-2 py-0.5 font-semibold text-[10px] text-background">
                      DESIGNER
                    </Badge>
                  ) : (
                    product.condition === 'NEW_WITH_TAGS' && (
                      <Badge className="border-0 bg-green-500 px-2 py-0.5 font-semibold text-[10px] text-background">
                        NEW
                      </Badge>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="relative flex flex-1 flex-col p-3">
              {/* Brand & Title */}
              <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">
                {product.brand}
              </p>
              <h3 className="mt-0.5 line-clamp-2 font-medium text-foreground text-sm leading-tight">
                {product.title}
              </h3>

              {/* Seller Info */}
              <p className="mt-1 text-muted-foreground/70 text-xs">
                by {product.seller.name} • {product.seller.location}
              </p>

              {/* Price & Size */}
              <div className="mt-auto pt-2">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="font-bold text-foreground text-lg">
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="ml-1.5 text-muted-foreground/70 text-xs line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                    <p className="mt-0.5 text-muted-foreground text-xs">
                      Size {product.size}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cart Button - Bottom Right Corner */}
              <button
                aria-label={isProductInCart ? 'In cart' : 'Add to cart'}
                className={`absolute right-2 bottom-2 h-8 w-8 rounded-[var(--radius-full)] shadow-sm transition-colors ${
                  isProductInCart
                    ? 'bg-green-500 text-background'
                    : 'bg-primary text-background hover:bg-primary/90'
                } flex items-center justify-center`}
                onClick={handleAddToCart}
              >
                <ShoppingCart
                  className={`h-4 w-4 ${isProductInCart ? 'fill-current' : ''}`}
                />
              </button>
            </div>
          </div>
        }
      />
    </article>
  );
};

// Custom hook for product filtering and sorting
const useProductFilters = (products: Product[], defaultCategory?: string) => {
  const [filters, setFilters] = useState<FilterState>({
    category: defaultCategory || 'All',
    brand: 'All brands',
    size: 'All sizes',
    priceRange: [0, 5000],
    condition: 'All conditions',
    searchQuery: '',
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Gender filter (based on defaultCategory)
    if (
      defaultCategory &&
      ['men', 'women', 'kids', 'unisex'].includes(defaultCategory)
    ) {
      filtered = filtered.filter(
        (product) =>
          product.gender === defaultCategory || product.gender === 'unisex'
      );
    }

    // Category filter
    if (filters.category !== 'All') {
      filtered = filtered.filter(
        (product) => product.category === filters.category
      );
    }

    // Brand filter
    if (filters.brand !== 'All brands') {
      filtered = filtered.filter((product) => product.brand === filters.brand);
    }

    // Size filter
    if (filters.size !== 'All sizes') {
      filtered = filtered.filter((product) => product.size === filters.size);
    }

    // Price range filter
    filtered = filtered.filter(
      (product) =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1]
    );

    // Condition filter
    if (filters.condition !== 'All conditions') {
      filtered = filtered.filter(
        (product) => product.condition === filters.condition
      );
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    // Products are already sorted by the server based on URL params
    // No client-side sorting needed since MobileQuickFilters handles it

    return filtered;
  }, [products, filters, defaultCategory]);

  const updateFilter = useCallback(
    (key: keyof FilterState, value: FilterValue) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      category: 'All',
      brand: 'All brands',
      size: 'All sizes',
      priceRange: [0, 5000],
      condition: 'All conditions',
      searchQuery: '',
    });
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All') {
      count++;
    }
    if (filters.brand !== 'All brands') {
      count++;
    }
    if (filters.size !== 'All sizes') {
      count++;
    }
    if (filters.condition !== 'All conditions') {
      count++;
    }
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) {
      count++;
    }
    return count;
  }, [filters]);

  return {
    filters,
    filteredProducts,
    updateFilter,
    clearFilters,
    activeFilterCount,
  };
};

interface ProductGridClientProps {
  initialProducts: Product[];
  filterOptions: FilterOptions;
  defaultCategory?: string;
}

// Main component - NOW WITH REAL DATA
export function ProductGridClient({
  initialProducts,
  filterOptions,
  defaultCategory,
}: ProductGridClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    filters,
    filteredProducts,
    updateFilter,
    clearFilters,
    activeFilterCount,
  } = useProductFilters(products, defaultCategory);

  // Pull to refresh functionality
  const handleRefresh = useCallback(async () => {
    try {
      // Fetch fresh products from the server
      const response = await fetch(
        `/api/search?refresh=true&category=${defaultCategory || ''}`
      );
      if (response.ok) {
        const freshProducts = await response.json();
        setProducts(freshProducts);
      }
    } catch (_error) {}
  }, [defaultCategory]);

  const {
    isPulling,
    isRefreshing,
    pullDistance,
    canRefresh,
    setupEventListeners,
  } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    resistance: 2.5,
  });

  // Set up pull-to-refresh event listeners
  useEffect(() => {
    if (containerRef.current) {
      const cleanup = setupEventListeners(containerRef.current);
      return cleanup;
    }
  }, [setupEventListeners]);

  // Favorites are now handled directly in ProductCard component

  // Load more functionality is handled by parent component through props
  const handleLoadMore = useCallback(async () => {
    setIsLoading(true);
    try {
      // Pagination is handled by the server component that provides the products
    } catch (_error) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Build filter options from real data
  const realFilterOptions = {
    categories: ['All', ...filterOptions.categories],
    brands: ['All brands', ...filterOptions.brands],
    sizes: ['All sizes', ...filterOptions.sizes],
    conditions: ['All conditions', 'LIKE_NEW', 'VERY_GOOD', 'GOOD'],
  };

  return (
    <>
      {/* Pull to refresh indicator */}
      <PullToRefreshIndicator
        canRefresh={canRefresh}
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        threshold={80}
      />

      <div className="py-1 pb-4" ref={containerRef}>
        {/* Filter Bar */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Filter Button */}
            <Button
              className="hidden md:flex"
              onClick={() => setShowFilters(!showFilters)}
              size="default"
              variant="outline"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {/* Filter Chips */}
            <div className="hidden items-center space-x-2 lg:flex">
              <select
                className="rounded-[var(--radius-md)] border border-gray-200 bg-background px-3 py-1.5 text-sm transition-colors duration-200 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                onChange={(e) => updateFilter('category', e.target.value)}
                value={filters.category}
              >
                {realFilterOptions.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                className="rounded-[var(--radius-md)] border border-gray-200 bg-background px-3 py-1.5 text-sm transition-colors duration-200 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                onChange={(e) => updateFilter('brand', e.target.value)}
                value={filters.brand}
              >
                {realFilterOptions.brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              <select
                className="rounded-[var(--radius-md)] border border-gray-200 bg-background px-3 py-1.5 text-sm transition-colors duration-200 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                onChange={(e) => updateFilter('condition', e.target.value)}
                value={filters.condition}
              >
                {realFilterOptions.conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <Button
                className="text-muted-foreground text-xs hover:text-secondary-foreground"
                onClick={clearFilters}
                size="sm"
                variant="ghost"
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Results count */}
            <span className="hidden font-medium text-muted-foreground text-sm md:block">
              {filteredProducts.length} of {filterOptions.totalCount} items
            </span>
          </div>
        </div>

        {/* Mobile filter panel */}
        {showFilters && (
          <div className="mb-2 space-y-2 rounded-[var(--radius-lg)] border border-gray-200 bg-background p-2 md:hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Filters</h3>
              {activeFilterCount > 0 && (
                <Button onClick={clearFilters} size="sm" variant="ghost">
                  Clear all
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                className="rounded-[var(--radius-md)] border border-gray-200 px-3 py-2 text-sm"
                onChange={(e) => updateFilter('category', e.target.value)}
                value={filters.category}
              >
                {realFilterOptions.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                className="rounded-[var(--radius-md)] border border-gray-200 px-3 py-2 text-sm"
                onChange={(e) => updateFilter('brand', e.target.value)}
                value={filters.brand}
              >
                {realFilterOptions.brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              <select
                className="rounded-[var(--radius-md)] border border-gray-200 px-3 py-2 text-sm"
                onChange={(e) => updateFilter('size', e.target.value)}
                value={filters.size}
              >
                {realFilterOptions.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <select
                className="rounded-[var(--radius-md)] border border-gray-200 px-3 py-2 text-sm"
                onChange={(e) => updateFilter('condition', e.target.value)}
                value={filters.condition}
              >
                {realFilterOptions.conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Product Grid - Mobile optimized */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="py-12 text-center">
            <p className="mb-4 text-lg text-muted-foreground">
              No products found
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}

        {/* Load More - Pagination handled by URL params */}
        {filteredProducts.length > 0 &&
          filteredProducts.length < filterOptions.totalCount && (
            <div className="mt-12 text-center">
              <Button
                className="px-8 py-3 font-medium"
                disabled={isLoading}
                onClick={handleLoadMore}
                size="lg"
                variant="outline"
              >
                {isLoading ? 'Loading...' : 'Load more items'}
              </Button>
            </div>
          )}
      </div>
    </>
  );
}
