'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { useAnalyticsEvents } from '@repo/analytics';
import { Heart, Filter, Grid, List, ChevronDown, Crown, X, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo, useCallback } from 'react';
import { ProductPlaceholder } from '../../components/product-placeholder';
import { ProductQuickView } from '../../components/product-quick-view';

// TypeScript interfaces
type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular';

interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  size: string;
  condition: string;
  categoryId: string;
  categoryName: string;
  parentCategoryName?: string;
  images: string[];
  seller: {
    id: string;
    name: string;
    location: string;
    rating: number;
  };
  favoritesCount: number;
  createdAt: Date;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count: {
    products: number;
  };
}

interface ProductGridClientProps {
  initialProducts: Product[];
  categories: Category[];
  defaultCategory?: string;
}

interface FilterState {
  category: string;
  brand: string;
  size: string;
  priceRange: [number, number];
  condition: string;
  sortBy: SortOption;
  searchQuery: string;
}

// Pure UI component for product cards
const ProductCard = ({ product }: { product: Product }) => {
  const [isLiked, setIsLiked] = useState(false);
  const { trackProductFavorite, trackProductQuickView } = useAnalyticsEvents();

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    // Track the favorite/unfavorite action
    trackProductFavorite(product, newLikedState);
    // TODO: Save to localStorage or user favorites
  };

  // Format time ago
  const timeAgo = () => {
    const now = new Date();
    const created = new Date(product.createdAt);
    const diff = now.getTime() - created.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="group relative bg-white">
      {/* Main card content - opens quick view dialog */}
      <ProductQuickView 
        product={product}
        trigger={
          <div className="cursor-pointer">
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 relative">
              {product.images.length > 0 && product.images[0] && 
               !product.images[0].includes('placehold.co') && 
               !product.images[0].includes('picsum.photos') ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover object-center group-hover:opacity-75 transition-opacity"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              ) : (
                <ProductPlaceholder className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity" />
              )}
              
              {/* Heart button */}
              <button 
                onClick={handleToggleLike}
                className={`absolute top-2 right-2 p-2 rounded-full transition-all z-10 ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
                } backdrop-blur-sm`}
                aria-label="Add to favourites"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
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
                  {product.condition}
                </Badge>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</p>
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.title}</h3>
              
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                )}
              </div>
              
              <p className="text-xs text-gray-500">Size {product.size}</p>
              <p className="text-xs text-gray-400">{product.seller.location} • {timeAgo()}</p>
            </div>
          </div>
        }
      />
    </div>
  );
};

// Custom hook for product filtering and sorting
const useProductFilters = (products: Product[], categories: Category[], defaultCategory?: string) => {
  const [filters, setFilters] = useState<FilterState>({
    category: defaultCategory || 'All',
    brand: 'All brands',
    size: 'All sizes',
    priceRange: [0, 5000],
    condition: 'All conditions',
    sortBy: 'newest',
    searchQuery: ''
  });

  // Get unique brands from products
  const brands = useMemo(() => {
    const brandSet = new Set(products.map(p => p.brand).filter(Boolean));
    return ['All brands', ...Array.from(brandSet).sort()];
  }, [products]);

  // Get unique sizes from products
  const sizes = useMemo(() => {
    const sizeSet = new Set(products.map(p => p.size).filter(Boolean));
    return ['All sizes', ...Array.from(sizeSet).sort()];
  }, [products]);

  // Get conditions from database enum
  const conditions = ['All conditions', 'NEW_WITH_TAGS', 'LIKE_NEW', 'VERY_GOOD', 'GOOD', 'FAIR'];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (filters.category !== 'All') {
      filtered = filtered.filter(product => 
        product.categoryName === filters.category || 
        product.parentCategoryName === filters.category
      );
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
        product.categoryName.toLowerCase().includes(query)
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
        filtered.sort((a, b) => b.favoritesCount - a.favoritesCount);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  }, [products, filters]);

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
    activeFilterCount,
    brands,
    sizes,
    conditions
  };
};

// Main component
export function ProductGridClient({ 
  initialProducts, 
  categories,
  defaultCategory 
}: ProductGridClientProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  
  const { trackSearchFilters, trackLoadMore, trackCategoryView } = useAnalyticsEvents();
  
  const { 
    filters, 
    filteredProducts, 
    updateFilter, 
    clearFilters, 
    activeFilterCount,
    brands,
    sizes,
    conditions
  } = useProductFilters(allProducts, categories, defaultCategory);

  // Get category names for filter
  const categoryNames = useMemo(() => {
    return ['All', ...categories.map(c => c.name)];
  }, [categories]);

  const sortOptions = [
    { value: 'newest' as const, label: 'Newest first' },
    { value: 'price-low' as const, label: 'Price: Low to High' },
    { value: 'price-high' as const, label: 'Price: High to Low' },
    { value: 'popular' as const, label: 'Most Popular' },
  ];

  // Load more products function
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreProducts) return;

    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const nextPage = currentPage + 1;
      const searchParams = new URLSearchParams({
        page: nextPage.toString(),
        limit: '20',
        sortBy: filters.sortBy,
      });

      // Add category filter if applied
      if (filters.category !== 'All') {
        searchParams.append('category', filters.category);
      }

      // Add search filter if applied
      if (filters.searchQuery) {
        searchParams.append('search', filters.searchQuery);
      }

      const response = await fetch(`/api/products?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to load more products');
      }

      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        setAllProducts(prev => [...prev, ...data.products]);
        setCurrentPage(nextPage);
        setHasMoreProducts(data.pagination.hasNextPage);
        
        // Track successful load more
        trackLoadMore('products', allProducts.length + data.products.length);
      } else {
        setHasMoreProducts(false);
      }
    } catch (error) {
      setLoadMoreError('Failed to load more products. Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMoreProducts, isLoadingMore, filters.sortBy, filters.category, filters.searchQuery]);

  // Reset pagination when filters change
  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    updateFilter(key, value);
    
    // Track filter usage for analytics
    if (key === 'category' && value !== 'All') {
      trackCategoryView(value);
    }
    
    // Track when filters are applied
    trackSearchFilters({ [key]: value });
    
    // Reset pagination when filters change (except for search)
    if (key !== 'searchQuery') {
      setAllProducts(initialProducts);
      setCurrentPage(1);
      setHasMoreProducts(true);
      setLoadMoreError(null);
    }
  }, [updateFilter, initialProducts, trackCategoryView, trackSearchFilters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
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
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="text-xs text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
              aria-label="Filter by category"
            >
              {categoryNames.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="text-xs text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
              aria-label="Filter by brand"
            >
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="text-xs text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
              aria-label="Filter by condition"
            >
              {conditions.map(condition => (
                <option key={condition} value={condition}>
                  {condition.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
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
            {filteredProducts.length.toLocaleString()} items
          </span>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value as SortOption)}
            className="text-sm border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
            aria-label="Sort products by"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* View toggle */}
          <div className="hidden md:flex items-center border rounded-md">
            <Button variant="ghost" size="sm" className="rounded-r-none border-r bg-gray-50">
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-l-none">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile filter button */}
      <div className="md:hidden mb-4">
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="w-full font-medium py-3 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters & Sort
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-black text-white text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Mobile Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white space-y-4">
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
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="text-sm border border-gray-200 rounded px-3 py-2"
                aria-label="Filter by category"
              >
                {categoryNames.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="text-sm border border-gray-200 rounded px-3 py-2"
                aria-label="Filter by brand"
              >
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>

              <select
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="text-sm border border-gray-200 rounded px-3 py-2"
                aria-label="Filter by size"
              >
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>

              <select
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="text-sm border border-gray-200 rounded px-3 py-2"
                aria-label="Filter by condition"
              >
                {conditions.map(condition => (
                  <option key={condition} value={condition}>
                    {condition.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value as SortOption)}
              className="w-full text-sm border border-gray-200 rounded px-3 py-2"
              aria-label="Sort products by"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* No results state */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No products found</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}

      {/* Load More */}
      {filteredProducts.length > 0 && hasMoreProducts && (
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-3 font-medium"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading...' : 'Load more items'}
          </Button>
          {loadMoreError && (
            <p className="text-red-500 text-sm mt-2">{loadMoreError}</p>
          )}
        </div>
      )}

      {/* End of results indicator */}
      {filteredProducts.length > 0 && !hasMoreProducts && !isLoadingMore && (
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">You've reached the end of the results.</p>
        </div>
      )}
    </div>
  );
}