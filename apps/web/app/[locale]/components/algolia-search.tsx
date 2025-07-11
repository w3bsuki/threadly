'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { algoliasearch } from 'algoliasearch';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { cn } from '@repo/design-system/lib';

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

export function AlgoliaSearch({ className, placeholder = "Search for items, brands, or members", onClose, isMobile = false }: AlgoliaSearchProps) {
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
    if (!searchClient.current || !searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { results } = await searchClient.current.search({
        requests: [{
          indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'products',
          query: searchQuery,
          params: {
            hitsPerPage: 6,
            filters: 'status:AVAILABLE',
          },
        }],
      });

      if (results[0] && 'hits' in results[0]) {
        setResults(results[0].hits as AlgoliaProduct[]);
      }
    } catch (error) {
      console.error('Search error:', error);
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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
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
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
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
      const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
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
    <div ref={searchRef} className={cn("relative w-full", className)}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowResults(true)}
            placeholder={placeholder}
            className={cn(
              "block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg",
              "focus:ring-2 focus:ring-black focus:border-black",
              "placeholder-gray-500 text-sm",
              isMobile && "bg-gray-50"
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="max-h-96 overflow-y-auto">
                {results.map((product, index) => (
                  <Link
                    key={product.objectID}
                    href={`/products/${product.objectID}`}
                    onClick={() => { setQuery(''); setShowResults(false); onClose?.(); }}
                    className={cn(
                      "flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors",
                      selectedIndex === index && "bg-gray-50"
                    )}
                  >
                    {product.images?.[0] && (
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={product.images[0].imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                      <p className="text-xs text-gray-500">
                        {product.brand && `${product.brand} • `}
                        ${product.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="border-t border-gray-200 p-3">
                <button
                  onClick={handleSearchSubmit}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  View all results for "{query}"
                </button>
              </div>
            </>
          ) : query.trim() ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-2">No results found for "{query}"</p>
              <p className="text-sm text-gray-400">Try searching for different keywords</p>
            </div>
          ) : recentSearches.length > 0 ? (
            <div>
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              </div>
              <div className="py-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(search)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Clock className="h-3 w-3 text-gray-400" />
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