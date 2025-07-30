'use client';

import { useAnalyticsEvents } from '@repo/features/analytics';
import {
  Badge,
  Button,
  Card,
  CardContent,
} from '@repo/ui/components';
import { AppErrorBoundary as ErrorBoundary } from '@repo/ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Heart, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSearch } from '../../../../lib/hooks/use-search';

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
  enableVirtualization?: boolean;
  containerHeight?: number;
}

export function SearchResults({
  initialQuery = '',
  enableVirtualization = false,
  containerHeight = 600,
}: SearchResultsProps) {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(2);
  const { trackSearchQuery, trackLoadMore: trackSearchLoadMore } =
    useAnalyticsEvents();

  // Calculate columns based on screen size
  useEffect(() => {
    const calculateColumns = () => {
      if (typeof window === 'undefined') return 2;
      const width = window.innerWidth;
      if (width >= 1280) return 4; // xl
      if (width >= 1024) return 3; // lg
      if (width >= 640) return 2; // sm
      return 1; // base
    };

    setColumns(calculateColumns());

    const handleResize = () => setColumns(calculateColumns());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const validSortOptions = [
    'relevance',
    'price_asc',
    'price_desc',
    'newest',
    'most_viewed',
    'most_favorited',
  ] as const;
  const sortBy = validSortOptions.includes(
    sort as (typeof validSortOptions)[number]
  )
    ? (sort as (typeof validSortOptions)[number])
    : 'relevance';

  const initialFilters = {
    query,
    categories: category ? [category] : undefined,
    brands: brand ? [brand] : undefined,
    conditions: condition
      ? [condition as 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR']
      : undefined,
    sizes: size ? [size] : undefined,
    priceMin: minPrice ? Number.parseInt(minPrice, 10) : undefined,
    priceMax: maxPrice ? Number.parseInt(maxPrice, 10) : undefined,
    sortBy,
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
    isEmpty,
  } = useSearch(initialFilters);

  // Transform search results to match the expected format (after useSearch)
  const products =
    results?.hits.map((hit) => ({
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
        name: hit.categoryName || 'Other',
      },
    })) || [];

  // Setup virtualization for large result sets (always initialize)
  const rowCount = Math.ceil(products.length / columns);
  const estimatedRowHeight = 400;

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 2,
  });

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
  }, [
    mounted,
    query,
    results,
    trackSearchQuery,
    category,
    brand,
    condition,
    size,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  if (!mounted) {
    return <SearchSkeleton />;
  }

  if (loading && !results) {
    return <SearchSkeleton />;
  }

  if (error) {
    return (
      <div className="mb-8 rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-lg text-red-800">Search Error</h3>
            <p className="mt-1 text-red-600">{error}</p>
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
      <div className="py-12 text-center">
        <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground/70" />
        <h2 className="mb-2 font-semibold text-foreground text-xl">
          Start Your Search
        </h2>
        <p className="text-muted-foreground">
          Enter a search term to find products, brands, or categories
        </p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="py-12 text-center">
        <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground/70" />
        <h2 className="mb-2 font-semibold text-foreground text-xl">
          No Results Found
        </h2>
        <p className="mb-6 text-muted-foreground">
          We couldn't find any products matching "{query}". Try different
          keywords or browse our categories.
        </p>
        <div className="space-x-4">
          <Button asChild variant="outline">
            <Link href="/products">Browse All Products</Link>
          </Button>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <div className="text-center">
            <h3 className="mb-2 font-semibold text-foreground text-lg">
              Error loading search results
            </h3>
            <p className="text-muted-foreground text-sm">
              Please try refreshing the page or search again.
            </p>
          </div>
        </div>
      }
    >
      <div>
        {/* Search Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-bold text-2xl text-foreground">
              {query ? `Search Results for "${query}"` : 'All Products'}
            </h1>

            {/* Search source indicator */}
            {source && (
              <div className="text-muted-foreground text-sm">
                {source === 'algolia' && '⚡ Powered by Algolia'}
                {source === 'database' && '📊 Database search'}
                {source === 'error' && '⚠️ Fallback mode'}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <p className="text-muted-foreground">
              {loading
                ? 'Searching...'
                : `Found ${totalResults.toLocaleString()} ${totalResults === 1 ? 'product' : 'products'}`}
            </p>

            {results?.processingTimeMS && (
              <span className="text-muted-foreground/70 text-xs">
                ({results.processingTimeMS}ms)
              </span>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {!enableVirtualization || products.length < 50 ? (
          // Non-virtualized version for smaller lists
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <Card className="group h-full cursor-pointer overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="relative aspect-[3/4] bg-secondary">
                    {product.images[0] &&
                    !product.images[0].imageUrl.includes('picsum.photos') &&
                    !product.images[0].imageUrl.includes('placehold.co') ? (
                      <Image
                        alt={product.title}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        src={product.images[0].imageUrl}
                      />
                    ) : (
                      <ProductPlaceholder className="h-full w-full" />
                    )}

                    {/* Heart Button */}
                    <button
                      aria-label="Add to favorites"
                      className="absolute top-3 right-3 rounded-[var(--radius-full)] bg-background/90 p-2 backdrop-blur-sm transition-all hover:scale-110 hover:bg-background"
                    >
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-2">
                      <p className="font-medium text-blue-600 text-xs uppercase tracking-wide">
                        {product.brand || 'Unknown Brand'}
                      </p>
                      <h3 className="line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-blue-600">
                        {product.title}
                      </h3>
                    </div>

                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-bold text-foreground text-lg">
                        {formatCurrency(product.price)}
                      </span>
                      {product.size && (
                        <Badge className="text-xs" variant="outline">
                          Size {product.size}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground text-sm">
                      <span>
                        {product.seller
                          ? `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() ||
                            'Anonymous'
                          : 'Anonymous'}
                      </span>
                      <Badge className="text-xs" variant="secondary">
                        {product.condition}
                      </Badge>
                    </div>

                    {product.category && (
                      <p className="mt-1 text-muted-foreground text-xs">
                        in {product.category.name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          // Virtualized version for larger lists
          <div
            className="w-full"
            ref={parentRef}
            style={{ height: `${containerHeight}px`, overflow: 'auto' }}
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const rowIndex = virtualRow.index;
                const startIndex = rowIndex * columns;
                const rowProducts = products.slice(
                  startIndex,
                  startIndex + columns
                );

                return (
                  <div
                    key={virtualRow.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {rowProducts.map((product) => (
                        <Link href={`/product/${product.id}`} key={product.id}>
                          <Card className="group h-full cursor-pointer overflow-hidden transition-shadow hover:shadow-lg">
                            <div className="relative aspect-[3/4] bg-secondary">
                              {product.images[0] &&
                              !product.images[0].imageUrl.includes(
                                'picsum.photos'
                              ) &&
                              !product.images[0].imageUrl.includes(
                                'placehold.co'
                              ) ? (
                                <Image
                                  alt={product.title}
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  fill
                                  sizes="(max-width: 768px) 50vw, 25vw"
                                  src={product.images[0].imageUrl}
                                />
                              ) : (
                                <ProductPlaceholder className="h-full w-full" />
                              )}

                              {/* Heart Button */}
                              <button
                                aria-label="Add to favorites"
                                className="absolute top-3 right-3 rounded-[var(--radius-full)] bg-background/90 p-2 backdrop-blur-sm transition-all hover:scale-110 hover:bg-background"
                              >
                                <Heart className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>

                            <CardContent className="p-4">
                              <div className="mb-2">
                                <p className="font-medium text-blue-600 text-xs uppercase tracking-wide">
                                  {product.brand || 'Unknown Brand'}
                                </p>
                                <h3 className="line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-blue-600">
                                  {product.title}
                                </h3>
                              </div>

                              <div className="mb-3 flex items-center justify-between">
                                <span className="font-bold text-foreground text-lg">
                                  {formatCurrency(product.price)}
                                </span>
                                {product.size && (
                                  <Badge className="text-xs" variant="outline">
                                    Size {product.size}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-muted-foreground text-sm">
                                <span>
                                  {product.seller
                                    ? `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() ||
                                      'Anonymous'
                                    : 'Anonymous'}
                                </span>
                                <Badge className="text-xs" variant="secondary">
                                  {product.condition}
                                </Badge>
                              </div>

                              {product.category && (
                                <p className="mt-1 text-muted-foreground text-xs">
                                  in {product.category.name}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Load More Button */}
        {products.length > 0 && hasMore && (
          <div className="mt-12 text-center">
            <Button
              className="px-8 py-3 font-medium"
              disabled={loading}
              onClick={() => {
                loadMore();
                trackSearchLoadMore('search_results', products.length);
              }}
              size="lg"
              variant="outline"
            >
              {loading ? 'Loading...' : 'Load more results'}
            </Button>
          </div>
        )}

        {/* End of results indicator */}
        {products.length > 0 && !hasMore && !loading && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm">
              You've reached the end of the search results.
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="h-8 w-1/3 animate-pulse rounded-[var(--radius-md)] bg-accent" />
        <div className="h-4 w-1/6 animate-pulse rounded-[var(--radius-md)] bg-accent" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="space-y-3" key={i}>
            <div className="aspect-[3/4] animate-pulse rounded-[var(--radius-lg)] bg-accent" />
            <div className="space-y-2">
              <div className="h-4 animate-pulse rounded-[var(--radius-md)] bg-accent" />
              <div className="h-4 w-2/3 animate-pulse rounded-[var(--radius-md)] bg-accent" />
              <div className="h-4 w-1/3 animate-pulse rounded-[var(--radius-md)] bg-accent" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
