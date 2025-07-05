'use client';

import { useSearch, type SearchFilters } from '@/lib/hooks/use-search';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { LazyImage } from '@repo/design-system/components';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@repo/design-system/components';
import { SearchFilters as SearchFiltersComponent } from './search-filters';
import { SavedSearches } from './saved-searches';
import { SearchHistory } from './search-history';
import { RecentlyViewed } from './recently-viewed';
import { SearchResultsSkeleton } from '@/components/skeletons';

interface SearchResultsProps {
  initialQuery?: string;
  initialFilters?: Partial<SearchFilters>;
}

export function SearchResults({ initialQuery = '', initialFilters }: SearchResultsProps) {
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
            Try Again
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
          <h3 className="mt-4 text-lg font-semibold">Search for products</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a search term to find products in our marketplace
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <SavedSearches 
            currentQuery={filters.query}
            currentFilters={filters}
          />
          <SearchHistory
            onSearchSelect={(query) => updateFilters({ query })}
            currentQuery={filters.query}
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
        <h3 className="mt-4 text-lg font-semibold">No products found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No products found for "{filters.query}". Try adjusting your search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search filters */}
      <SearchFiltersComponent
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        facets={results?.facets}
      />

      {/* Search metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
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
              currentQuery={filters.query}
              currentFilters={filters}
            />
          )}
          {results && (
            <p className="text-xs text-muted-foreground">
              Found in {results.processingTimeMS}ms
            </p>
          )}
        </div>
      </div>

      {/* Results grid */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
        {results?.hits.map((product) => (
          <div 
            key={product.id} 
            className="group cursor-pointer rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <LazyImage
              src={product.images[0] || ''}
              alt={product.title}
              aspectRatio="square"
              fill
              className="object-cover w-full h-full"
              quality={80}
              blur={true}
            />
            <div className="p-3">
              <h3 className="font-medium text-sm truncate">{product.title}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {product.sellerName}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="outline" className="text-xs">
                  {product.condition}
                </Badge>
                {product.brand && (
                  <Badge variant="secondary" className="text-xs">
                    {product.brand}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="font-semibold text-sm">${product.price.toFixed(2)}</p>
                <AddToCartButton 
                  product={{
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    condition: product.condition,
                    sellerId: `seller-${product.id}`, // Generate sellerId since it's not in search results
                    seller: {
                      firstName: product.sellerName.split(' ')[0],
                      lastName: product.sellerName.split(' ').slice(1).join(' '),
                    },
                    images: product.images.map(url => ({ url })),
                    size: product.size,
                    color: product.color,
                    status: 'AVAILABLE',
                  }} 
                  size="sm" 
                  showText={false}
                  className="touch-target"
                />
              </div>
              
              {/* Additional metadata */}
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
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
          <Button 
            onClick={loadMore}
            variant="outline"
            disabled={loading}
          >
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