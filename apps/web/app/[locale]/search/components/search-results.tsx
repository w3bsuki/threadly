"use client";

import { useSearchParams } from 'next/navigation';
import { useSearch } from '../../../../lib/hooks/use-search';
import { useAnalyticsEvents } from '@repo/analytics';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Search, Filter, Grid, Heart } from 'lucide-react';
// Inline ProductPlaceholder for loading states
const ProductPlaceholder = ({ className = "w-full h-full" }: { className?: string }) => {
  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center ${className}`}>
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-300"
      >
        <path
          d="M20 25 C20 25, 25 20, 40 20 C55 20, 60 25, 60 25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M40 20 L40 15 C40 12, 42 10, 45 10 C48 10, 50 12, 50 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils/currency';

interface SearchFilters {
  categories?: string[];
  brands?: string[];
  conditions?: string[];
  sizes?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
}

interface SearchResultsProps {
  initialQuery?: string;
}

export function SearchResults({ initialQuery = '' }: SearchResultsProps) {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const { trackSearchQuery, trackLoadMore: trackSearchLoadMore } = useAnalyticsEvents();

  // Extract search parameters
  const query = searchParams.get('q') || initialQuery;
  const category = searchParams.get('category');
  const brand = searchParams.get('brand'); 
  const size = searchParams.get('size');
  const condition = searchParams.get('condition');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sort = searchParams.get('sort');

  // Build initial filters from URL params
  const validSortOptions = ['relevance', 'price_asc', 'price_desc', 'newest', 'most_viewed', 'most_favorited'] as const;
  const sortBy = validSortOptions.includes(sort as any) ? sort as typeof validSortOptions[number] : 'relevance';
  
  const initialFilters = {
    query,
    categories: category ? [category] : undefined,
    brands: brand ? [brand] : undefined,
    conditions: condition ? [condition as 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR'] : undefined,
    sizes: size ? [size] : undefined,
    priceMin: minPrice ? parseInt(minPrice) : undefined,
    priceMax: maxPrice ? parseInt(maxPrice) : undefined,
    sortBy
  } as const;

  const {
    results,
    loading,
    error,
    source,
    updateFilters,
    clearFilters,
    retry,
    loadMore,
    hasMore,
    totalResults,
    isEmpty
  } = useSearch(initialFilters);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track search queries for analytics
  useEffect(() => {
    if (mounted && query && query.trim() && results) {
      trackSearchQuery(query, results.totalHits, {
        category,
        brand,
        condition,
        size,
        minPrice,
        maxPrice,
        sort: sortBy,
      });
    }
  }, [mounted, query, results, trackSearchQuery, category, brand, condition, size, minPrice, maxPrice, sortBy]);

  if (!mounted) {
    return <SearchSkeleton />;
  }

  // Transform search results to match the expected format
  const products = results?.hits.map(hit => ({
    id: hit.id,
    title: hit.title,
    brand: hit.brand || null,
    price: hit.price,
    condition: hit.condition,
    size: hit.size || null,
    images: [{ imageUrl: hit.images[0] || '' }],
    seller: {
      firstName: hit.sellerName?.split(' ')[0] || null,
      lastName: hit.sellerName?.split(' ').slice(1).join(' ') || null,
    },
    category: {
      name: hit.categoryName || 'Other'
    }
  })) || [];

  if (loading && !results) {
    return <SearchSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-red-800">Search Error</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
          <Button onClick={retry} variant="destructive">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Start Your Search</h2>
        <p className="text-gray-600">Enter a search term to find products, brands, or categories</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h2>
        <p className="text-gray-600 mb-6">
          We couldn't find any products matching "{query}". Try different keywords or browse our categories.
        </p>
        <div className="space-x-4">
          <Button variant="outline" asChild>
            <Link href="/products">Browse All Products</Link>
          </Button>
          <Button onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {query ? `Search Results for "${query}"` : 'All Products'}
          </h1>
          
          {/* Search source indicator */}
          {source && (
            <div className="text-sm text-gray-500">
              {source === 'algolia' && '⚡ Powered by Algolia'}
              {source === 'database' && '📊 Database search'}
              {source === 'error' && '⚠️ Fallback mode'}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <p className="text-gray-600">
            {loading ? 'Searching...' : 
             `Found ${totalResults.toLocaleString()} ${totalResults === 1 ? 'product' : 'products'}`}
          </p>
          
          {results?.processingTimeMS && (
            <span className="text-xs text-gray-400">
              ({results.processingTimeMS}ms)
            </span>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
              <div className="relative aspect-[3/4] bg-gray-100">
                {product.images[0] && 
                 !product.images[0].imageUrl.includes('picsum.photos') && 
                 !product.images[0].imageUrl.includes('placehold.co') ? (
                  <Image
                    src={product.images[0].imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <ProductPlaceholder className="h-full w-full" />
                )}
                
                {/* Heart Button */}
                <button 
                  className="absolute top-3 right-3 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                  aria-label="Add to favorites"
                >
                  <Heart className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-2">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                    {product.brand || 'Unknown Brand'}
                  </p>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>
                </div>
                
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                  {product.size && (
                    <Badge variant="outline" className="text-xs">
                      Size {product.size}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {product.seller 
                      ? `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() || 'Anonymous'
                      : 'Anonymous'
                    }
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {product.condition}
                  </Badge>
                </div>
                
                {product.category && (
                  <p className="text-xs text-gray-500 mt-1">
                    in {product.category.name}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      {products.length > 0 && hasMore && (
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-3 font-medium"
            onClick={() => {
              loadMore();
              trackSearchLoadMore('search_results', products.length);
            }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load more results'}
          </Button>
        </div>
      )}

      {/* End of results indicator */}
      {products.length > 0 && !hasMore && !loading && (
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">You've reached the end of the search results.</p>
        </div>
      )}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse" />
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}