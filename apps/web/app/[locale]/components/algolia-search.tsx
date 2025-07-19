'use client';

import { cn } from '@repo/design-system/lib/utils';
import { algoliasearch } from 'algoliasearch';
import { Clock, Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/lib/hooks/use-debounce';

interface AlgoliaProduct {
  objectID: string;
  title: string;
  description: string;
  price: number;
  brand?: string;
  categoryName?: string;
  images: Array<{ imageUrl: string }>;
  condition: string;
  sellerName?: string;
}

interface AlgoliaSearchProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

export function AlgoliaSearch({
  className,
  placeholder = 'Search for items, brands, or members',
  onClose,
  isMobile = false,
}: AlgoliaSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AlgoliaProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Initialize Algolia client
  const searchClient = useRef<ReturnType<typeof algoliasearch> | null>(null);

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;

    if (appId && apiKey) {
      searchClient.current = algoliasearch(appId, apiKey);
    }

    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!(searchClient.current && searchQuery.trim())) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { results } = await searchClient.current.search({
        requests: [
          {
            indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'products',
            query: searchQuery,
            hitsPerPage: 6,
            filters: 'status:AVAILABLE',
          },
        ],
      });

      if (results[0] && 'hits' in results[0]) {
        setResults(results[0].hits as AlgoliaProduct[]);
      }
    } catch (_error) {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(recentSearches.length > 0);
    }
  }, [debouncedQuery, performSearch, recentSearches.length]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleProductClick(results[selectedIndex]);
      } else if (query.trim()) {
        handleSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const handleProductClick = (product: AlgoliaProduct) => {
    router.push(`/products/${product.objectID}`);
    setQuery('');
    setShowResults(false);
    onClose?.();
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      // Save to recent searches
      const newRecent = [
        query,
        ...recentSearches.filter((s) => s !== query),
      ].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));

      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setShowResults(false);
      onClose?.();
    }
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
    performSearch(search);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className={cn('relative w-full', className)} ref={searchRef}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit();
        }}
      >
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-muted-foreground/70" />
          </div>
          <input
            className={cn(
              'block w-full rounded-[var(--radius-lg)] border border-gray-300 py-2 pr-10 pl-10',
              'focus:border-black focus:ring-2 focus:ring-black',
              'text-sm placeholder-gray-500',
              isMobile && 'bg-muted'
            )}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            ref={inputRef}
            type="text"
            value={query}
          />
          {query && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              type="button"
            >
              <X className="h-4 w-4 text-muted-foreground/70 hover:text-muted-foreground" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-[var(--radius-lg)] border border-gray-200 bg-background shadow-xl">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="inline-block h-6 w-6 animate-spin rounded-[var(--radius-full)] border-gray-900 border-b-2" />
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="max-h-96 overflow-y-auto">
                {results.map((product, index) => (
                  <Link
                    className={cn(
                      'flex items-center gap-3 p-3 transition-colors hover:bg-muted',
                      selectedIndex === index && 'bg-muted'
                    )}
                    href={`/products/${product.objectID}`}
                    key={product.objectID}
                    onClick={() => {
                      setQuery('');
                      setShowResults(false);
                      onClose?.();
                    }}
                  >
                    {product.images?.[0] && (
                      <div className="relative h-12 w-12 flex-shrink-0">
                        <Image
                          alt={product.title}
                          className="rounded-[var(--radius-md)] object-cover"
                          fill
                          src={product.images[0].imageUrl}
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground text-sm">
                        {product.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {product.brand && `${product.brand} • `}${product.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="border-gray-200 border-t p-3">
                <button
                  className="font-medium text-muted-foreground text-sm hover:text-foreground"
                  onClick={handleSearchSubmit}
                >
                  View all results for "{query}"
                </button>
              </div>
            </>
          ) : query.trim() ? (
            <div className="p-8 text-center">
              <p className="mb-2 text-muted-foreground">
                No results found for "{query}"
              </p>
              <p className="text-muted-foreground/70 text-sm">
                Try searching for different keywords
              </p>
            </div>
          ) : recentSearches.length > 0 ? (
            <div>
              <div className="flex items-center justify-between border-gray-200 border-b px-4 py-2">
                <span className="font-medium text-secondary-foreground text-sm">
                  Recent Searches
                </span>
                <button
                  className="text-muted-foreground text-xs hover:text-secondary-foreground"
                  onClick={clearRecentSearches}
                >
                  Clear all
                </button>
              </div>
              <div className="py-2">
                {recentSearches.map((search, index) => (
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-secondary-foreground text-sm hover:bg-muted"
                    key={index}
                    onClick={() => handleRecentSearch(search)}
                  >
                    <Clock className="h-3 w-3 text-muted-foreground/70" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
