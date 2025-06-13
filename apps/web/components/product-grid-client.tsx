'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { usePullToRefresh } from '@repo/design-system/hooks/use-pull-to-refresh';
import { PullToRefreshIndicator } from '@repo/design-system/components/ui/pull-to-refresh';
import { Heart, Filter, Grid, List, ChevronDown, Crown, X, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ProductPlaceholder } from './product-placeholder';
import { useFavorites } from '../lib/hooks/use-favorites';
import { ProductQuickView } from '../app/[locale]/components/product-quick-view';

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
  sortBy: 'newest' | 'price-low' | 'price-high' | 'popular';
  searchQuery: string;
}

interface FilterOptions {
  categories: string[];
  brands: string[];
  sizes: string[];
  totalCount: number;
}

// Product card component
const ProductCard = ({ product }: { 
  product: Product; 
}) => {
  const { toggleFavorite, isFavorited, isPending } = useFavorites();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleFavorite(product.id);
    if (!result.success) {
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
  <div className="group relative bg-white">
    {/* Main card content - opens quick view dialog */}
    <ProductQuickView 
      product={transformedProduct}
      trigger={
        <div className="cursor-pointer">
          <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 relative">
            {product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover object-center group-hover:opacity-75 transition-opacity"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ) : (
              <ProductPlaceholder 
                className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity" 
                seed={product.id}
              />
            )}
            
            {/* Heart button */}
            <button 
              onClick={handleToggleFavorite}
              disabled={isPending}
              className={`absolute top-2 right-2 p-2 rounded-full transition-all z-10 ${
                isFavorited(product.id) ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
              } backdrop-blur-sm`}
              aria-label="Add to favourites"
            >
              <Heart className={`h-4 w-4 ${isFavorited(product.id) ? 'fill-current' : ''}`} />
            </button>

            {/* Quick View indicator - Shows on hover */}
            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-full bg-black/80 text-white backdrop-blur-sm text-xs py-2 px-3 rounded flex items-center justify-center">
                <Eye className="h-3 w-3 mr-1" />
                Quick View
              </div>
            </div>

            {/* Condition badge */}
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs bg-white/90 text-gray-900">
                {product.condition.replace('_', ' ')}
              </Badge>
            </div>

            {/* Designer badge */}
            {product.isDesigner && (
              <div className="absolute top-2 left-2 mt-7">
                <Badge className="text-xs bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Designer
                </Badge>
              </div>
            )}

            {/* Favorites count */}
            {product._count?.favorites ? (
              <div className="absolute bottom-2 left-2 mb-8">
                <Badge variant="secondary" className="text-xs bg-white/90 text-gray-900">
                  <Heart className="h-3 w-3 mr-1" />
                  {product._count.favorites}
                </Badge>
              </div>
            ) : null}
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</p>
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.title}</h3>
            
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            <p className="text-xs text-gray-500">Size {product.size}</p>
            <p className="text-xs text-gray-400">{product.seller.location} • {product.uploadedAgo}</p>
          </div>
        </div>
      }
    />
  </div>
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
    sortBy: 'newest',
    searchQuery: ''
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Gender filter (based on defaultCategory)
    if (defaultCategory && ['men', 'women', 'kids', 'unisex'].includes(defaultCategory)) {
      filtered = filtered.filter(product => 
        product.gender === defaultCategory || product.gender === 'unisex'
      );
    }

    // Category filter
    if (filters.category !== 'All') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Brand filter
    if (filters.brand !== 'All brands') {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }

    // Size filter
    if (filters.size !== 'All sizes') {
      filtered = filtered.filter(product => product.size === filters.size);
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Condition filter
    if (filters.condition !== 'All conditions') {
      filtered = filtered.filter(product => product.condition === filters.condition);
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Sort products
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => (b._count?.favorites || 0) - (a._count?.favorites || 0));
        break;
      case 'newest':
      default:
        // Already in newest order from server
        break;
    }

    return filtered;
  }, [products, filters, defaultCategory]);

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: 'All',
      brand: 'All brands',
      size: 'All sizes',
      priceRange: [0, 5000],
      condition: 'All conditions',
      sortBy: 'newest',
      searchQuery: ''
    });
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.brand !== 'All brands') count++;
    if (filters.size !== 'All sizes') count++;
    if (filters.condition !== 'All conditions') count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredProducts,
    updateFilter,
    clearFilters,
    activeFilterCount
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
  defaultCategory 
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
    activeFilterCount 
  } = useProductFilters(products, defaultCategory);

  // Pull to refresh functionality
  const handleRefresh = useCallback(async () => {
    try {
      // Fetch fresh products from the server
      const response = await fetch(`/api/search?refresh=true&category=${defaultCategory || ''}`);
      if (response.ok) {
        const freshProducts = await response.json();
        setProducts(freshProducts);
      }
    } catch (error) {
    }
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

  // Load more products
  const handleLoadMore = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Fetch more products from API
      // const response = await fetch(`/api/products?offset=${products.length}`);
      // const newProducts = await response.json();
      // setProducts(prev => [...prev, ...newProducts]);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [products.length]);

  // Build filter options from real data
  const realFilterOptions = {
    categories: ['All', ...filterOptions.categories],
    brands: ['All brands', ...filterOptions.brands],
    sizes: ['All sizes', ...filterOptions.sizes],
    conditions: ['All conditions', 'LIKE_NEW', 'VERY_GOOD', 'GOOD'],
    sortOptions: [
      { value: 'newest' as const, label: 'Newest first' },
      { value: 'price-low' as const, label: 'Price: Low to High' },
      { value: 'price-high' as const, label: 'Price: High to Low' },
      { value: 'popular' as const, label: 'Most Popular' },
    ]
  };

  return (
    <>
      {/* Pull to refresh indicator */}
      <PullToRefreshIndicator
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        canRefresh={canRefresh}
        threshold={80}
      />
      
      <div ref={containerRef} className="max-w-7xl mx-auto px-4 py-6">
      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Filter Button */}
          <Button 
            variant="outline" 
            size="default"
            onClick={() => setShowFilters(!showFilters)}
            className="hidden md:flex font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-6 py-2.5"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-black text-white text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          {/* Filter Chips */}
          <div className="hidden lg:flex items-center space-x-2">
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="text-xs text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
            >
              {realFilterOptions.categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filters.brand}
              onChange={(e) => updateFilter('brand', e.target.value)}
              className="text-xs text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
            >
              {realFilterOptions.brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={filters.condition}
              onChange={(e) => updateFilter('condition', e.target.value)}
              className="text-xs text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
            >
              {realFilterOptions.conditions.map(condition => (
                <option key={condition} value={condition}>
                  {condition.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Results count */}
          <span className="text-sm text-gray-600 hidden md:block font-medium">
            {filteredProducts.length} of {filterOptions.totalCount} items
          </span>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="text-sm border border-gray-200 rounded px-3 py-1.5"
          >
            {realFilterOptions.sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile filter panel */}
      {showFilters && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white space-y-4 md:hidden">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Filters</h3>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="text-sm border border-gray-200 rounded px-3 py-2"
            >
              {realFilterOptions.categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filters.brand}
              onChange={(e) => updateFilter('brand', e.target.value)}
              className="text-sm border border-gray-200 rounded px-3 py-2"
            >
              {realFilterOptions.brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={filters.size}
              onChange={(e) => updateFilter('size', e.target.value)}
              className="text-sm border border-gray-200 rounded px-3 py-2"
            >
              {realFilterOptions.sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            <select
              value={filters.condition}
              onChange={(e) => updateFilter('condition', e.target.value)}
              className="text-sm border border-gray-200 rounded px-3 py-2"
            >
              {realFilterOptions.conditions.map(condition => (
                <option key={condition} value={condition}>
                  {condition.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Product Grid - REAL PRODUCTS */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No products found</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}

      {/* Load More - TODO: Implement real pagination */}
      {filteredProducts.length > 0 && filteredProducts.length < filterOptions.totalCount && (
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-3 font-medium"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load more items'}
          </Button>
        </div>
      )}
      </div>
    </>
  );
}