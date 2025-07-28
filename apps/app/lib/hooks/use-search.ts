'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from './use-debounce';

export interface SearchFilters {
  query?: string;
  categories?: string[];
  brands?: string[];
  conditions?: ('NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR')[];
  sizes?: string[];
  colors?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?:
    | 'relevance'
    | 'price_asc'
    | 'price_desc'
    | 'newest'
    | 'most_viewed'
    | 'most_favorited';
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface SearchProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  brand?: string;
  size?: string;
  color?: string;
  images: string[];
  categoryName: string;
  sellerName: string;
  sellerRating: number;
  views: number;
  favorites: number;
  createdAt: number;
}

export interface SearchResult {
  hits: SearchProduct[];
  totalHits: number;
  page: number;
  totalPages: number;
  processingTimeMS: number;
  facets?: Record<string, Record<string, number>>;
}

export interface SearchResponse {
  message: string;
  source: 'algolia' | 'database' | 'error';
  results: SearchResult;
  algoliaConfigured: boolean;
  filters?: {
    applied: SearchFilters;
    available: Record<string, Record<string, number>>;
  };
}

export interface SearchSuggestion {
  query: string;
  category?: string;
  count: number;
}

export interface AutocompleteItem {
  id: string;
  title: string;
  brand?: string;
  price: number;
  image?: string;
  category: string;
}

export interface SuggestionsResponse {
  query: string;
  suggestions: SearchSuggestion[];
  autocomplete: AutocompleteItem[];
  source: 'algolia' | 'fallback' | 'error';
  configured: boolean;
}

// SECURITY: Production-safe API URL handling - no localhost fallbacks
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined'
    ? window.location.origin
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined);

export function useSearch(initialFilters: SearchFilters = {}) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [source, setSource] = useState<'algolia' | 'database' | 'error'>(
    'algolia'
  );

  // Debounce search query for better UX
  const debouncedQuery = useDebounce(filters.query || '', 300);

  const buildSearchUrl = useCallback(
    (searchFilters: SearchFilters, searchPage: number) => {
      // SECURITY: Validate API_BASE is available
      if (!API_BASE) {
        throw new Error('API URL not configured');
      }

      const params = new URLSearchParams();

      if (debouncedQuery) params.set('q', debouncedQuery);
      if (searchFilters.categories?.length) {
        searchFilters.categories.forEach((cat) =>
          params.append('categories', cat)
        );
      }
      if (searchFilters.brands?.length) {
        searchFilters.brands.forEach((brand) => params.append('brands', brand));
      }
      if (searchFilters.conditions?.length) {
        searchFilters.conditions.forEach((condition) =>
          params.append('conditions', condition)
        );
      }
      if (searchFilters.sizes?.length) {
        searchFilters.sizes.forEach((size) => params.append('sizes', size));
      }
      if (searchFilters.colors?.length) {
        searchFilters.colors.forEach((color) => params.append('colors', color));
      }
      if (searchFilters.priceMin !== undefined)
        params.set('priceMin', searchFilters.priceMin.toString());
      if (searchFilters.priceMax !== undefined)
        params.set('priceMax', searchFilters.priceMax.toString());
      if (searchFilters.sortBy) params.set('sortBy', searchFilters.sortBy);

      params.set('page', searchPage.toString());
      params.set('hitsPerPage', '20');

      return `${API_BASE}/api/search?${params.toString()}`;
    },
    [debouncedQuery]
  );

  const performSearch = useCallback(
    async (searchFilters: SearchFilters, searchPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const url = buildSearchUrl(searchFilters, searchPage);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data: SearchResponse = await response.json();

        setResults(data.results);
        setSource(data.source);

        if (data.source === 'error') {
          setError('Search service temporarily unavailable');
        } else if (searchPage === 0 && debouncedQuery) {
          // Track search history for first page of results
          fetch('/api/search-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: debouncedQuery,
              filters: searchFilters,
              resultCount: data.results?.totalHits || 0,
            }),
          }).catch((err) => {});
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Search failed';
        setError(message);
        setResults(null);
        setSource('error');
      } finally {
        setLoading(false);
      }
    },
    [buildSearchUrl]
  );

  // Perform search when filters or page change
  useEffect(() => {
    // Only search if we have a query or filters
    if (
      debouncedQuery ||
      Object.keys(filters).some(
        (key) => key !== 'query' && filters[key as keyof SearchFilters]
      )
    ) {
      performSearch(filters, page);
    } else {
      // Clear results if no query/filters
      setResults(null);
      setLoading(false);
    }
  }, [debouncedQuery, filters, page, performSearch]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(0); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ query: filters.query }); // Keep query, clear other filters
    setPage(0);
  }, [filters.query]);

  const loadMore = useCallback(() => {
    if (results && page < results.totalPages - 1) {
      setPage((prev) => prev + 1);
    }
  }, [results, page]);

  const retry = useCallback(() => {
    performSearch(filters, page);
  }, [performSearch, filters, page]);

  return {
    // State
    filters,
    results,
    loading,
    error,
    page,
    source,

    // Actions
    updateFilters,
    clearFilters,
    loadMore,
    retry,

    // Computed
    hasMore: results ? page < results.totalPages - 1 : false,
    totalResults: results?.totalHits || 0,
    isEmpty: results?.hits.length === 0,
  };
}

// Hook for search suggestions/autocomplete
export function useSearchSuggestions(query: string, limit = 8) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [autocomplete, setAutocomplete] = useState<AutocompleteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(false);

  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setAutocomplete([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchSuggestions = async () => {
      try {
        const params = new URLSearchParams({
          q: debouncedQuery,
          limit: limit.toString(),
        });

        const response = await fetch(
          `${API_BASE}/api/search/suggestions?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error('Suggestions request failed');
        }

        const data: SuggestionsResponse = await response.json();

        if (!cancelled) {
          setSuggestions(data.suggestions || []);
          setAutocomplete(data.autocomplete || []);
          setConfigured(data.configured);
        }
      } catch (error) {
        if (!cancelled) {
          setSuggestions([]);
          setAutocomplete([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, limit]);

  return {
    suggestions,
    autocomplete,
    loading,
    configured,
    isEmpty: suggestions.length === 0 && autocomplete.length === 0,
  };
}

// Hook for popular products
export function usePopularProducts(category?: string, limit = 10) {
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopular = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
        });

        if (category) {
          params.set('category', category);
        }

        const response = await fetch(
          `${API_BASE}/api/search/popular?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch popular products');
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load popular products';
        setError(message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, [category, limit]);

  return {
    products,
    loading,
    error,
    isEmpty: products.length === 0,
  };
}
