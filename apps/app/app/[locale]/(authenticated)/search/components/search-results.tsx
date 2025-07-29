'use client';

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  LazyImage,
  SearchResultsSkeleton,
} from '@repo/ui/components';
import type { Dictionary } from '@repo/internationalization';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { type SearchFilters, useSearch } from '@/lib/hooks/use-search';
import { RecentlyViewed } from './recently-viewed';
import { SavedSearches } from './saved-searches';
import { SearchFilters as SearchFiltersComponent } from './search-filters';
import { SearchHistory } from './search-history';

interface SearchResultsProps {
  initialQuery?: string;
  initialFilters?: Partial<SearchFilters>;
  dictionary: Dictionary;
}

export function SearchResults({
  initialQuery = '',
  initialFilters,
  dictionary,
}: SearchResultsProps) {
  const {
    filters,
    results,
    loading,
    error,
    source,
    updateFilters,
    clearFilters,
    loadMore,
    retry,
    hasMore,
    totalResults,
    isEmpty,
  } = useSearch(initialFilters || { query: initialQuery });

  // Loading state
  if (loading && !results) {
    return <SearchResultsSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button onClick={retry} size="sm" variant="outline">
            {dictionary.dashboard.validation.tryAgain}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!filters.query && isEmpty) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-semibold text-lg">
            {dictionary.dashboard.search.title}
          </h3>
          <p className="mt-2 text-muted-foreground text-sm">
            {dictionary.dashboard.search.searchPlaceholder}
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
          <SavedSearches
            currentFilters={filters}
            currentQuery={filters.query}
          />
          <SearchHistory
            currentQuery={filters.query}
            onSearchSelect={(query) => updateFilters({ query })}
          />
          <RecentlyViewed />
        </div>
      </div>
    );
  }

  // No results state
  if (isEmpty && filters.query) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 font-semibold text-lg">
          {dictionary.dashboard.search.noResults}
        </h3>
        <p className="mt-2 text-muted-foreground text-sm">
          {dictionary.dashboard.search.noResults} "{filters.query}".{' '}
          {dictionary.dashboard.validation.tryAgain}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search filters */}
      <SearchFiltersComponent
        dictionary={dictionary}
        facets={results?.facets}
        filters={filters}
        onClearFilters={clearFilters}
        onFiltersChange={updateFilters}
      />

      {/* Search metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-sm">
            {totalResults.toLocaleString()} results
            {filters.query && ` for "${filters.query}"`}
          </p>
          <Badge variant={source === 'algolia' ? 'default' : 'secondary'}>
            {source === 'algolia' ? 'Fast Search' : 'Database'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {filters.query && (
            <SavedSearches
              currentFilters={filters}
              currentQuery={filters.query}
            />
          )}
          {results && (
            <p className="text-muted-foreground text-xs">
              Found in {results.processingTimeMS}ms
            </p>
          )}
        </div>
      </div>

      {/* Results grid */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
        {results?.hits.map((product) => (
          <div
            className="group cursor-pointer overflow-hidden rounded-[var(--radius-xl)] border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md"
            key={product.id}
          >
            <LazyImage
              alt={product.title}
              aspectRatio="square"
              blur={true}
              className="h-full w-full object-cover"
              fill
              quality={80}
              src={product.images[0] || ''}
            />
            <div className="p-3">
              <h3 className="truncate font-medium text-sm">{product.title}</h3>
              <p className="truncate text-muted-foreground text-xs">
                {product.sellerName}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <Badge className="text-xs" variant="outline">
                  {product.condition}
                </Badge>
                {product.brand && (
                  <Badge className="text-xs" variant="secondary">
                    {product.brand}
                  </Badge>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="font-semibold text-sm">
                  ${product.price.toFixed(2)}
                </p>
                <AddToCartButton
                  className="touch-target"
                  product={{
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    condition: product.condition,
                    sellerId: `seller-${product.id}`, // Generate sellerId since it's not in search results
                    seller: {
                      firstName: product.sellerName.split(' ')[0],
                      lastName: product.sellerName
                        .split(' ')
                        .slice(1)
                        .join(' '),
                    },
                    images: product.images.map((url) => ({ url })),
                    size: product.size,
                    color: product.color,
                    status: 'AVAILABLE',
                  }}
                  showText={false}
                  size="sm"
                />
              </div>

              {/* Additional metadata */}
              <div className="mt-2 flex items-center justify-between text-muted-foreground text-xs">
                <span>{product.views} views</span>
                <span>{product.favorites} favorites</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button disabled={loading} onClick={loadMore} variant="outline">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
