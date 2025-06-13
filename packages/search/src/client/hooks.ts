import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SearchFilters, SearchResult, SearchSuggestion } from '../types';

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Search hook
export function useSearch() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const debouncedQuery = useDebounce(filters.query || '', 300);

  const search = useCallback(async (newFilters?: Partial<SearchFilters>, newPage = 0) => {
    setLoading(true);
    setError(null);

    try {
      const searchFilters = { ...filters, ...newFilters };
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: searchFilters,
          page: newPage,
          hitsPerPage: 20,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const result: SearchResult = await response.json();
      setResults(result);
      setPage(newPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(0);
    setResults(null);
  }, []);

  const nextPage = useCallback(() => {
    if (results && page < results.totalPages - 1) {
      search(filters, page + 1);
    }
  }, [results, page, search, filters]);

  const prevPage = useCallback(() => {
    if (page > 0) {
      search(filters, page - 1);
    }
  }, [page, search, filters]);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== undefined) {
      search({ query: debouncedQuery });
    }
  }, [debouncedQuery, search]);

  return {
    filters,
    results,
    loading,
    error,
    page,
    search,
    updateFilters,
    clearFilters,
    nextPage,
    prevPage,
    hasNextPage: results ? page < results.totalPages - 1 : false,
    hasPrevPage: page > 0,
  };
}

// Search suggestions hook
export function useSearchSuggestions(query: string, enabled = true) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    if (!enabled || !debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, enabled]);

  return { suggestions, loading };
}

// Autocomplete hook
export function useAutocomplete(query: string, enabled = true) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 150);

  useEffect(() => {
    if (!enabled || !debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchAutocomplete = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(debouncedQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchAutocomplete();
  }, [debouncedQuery, enabled]);

  return { suggestions, loading };
}

// Search facets hook
export function useSearchFacets(query?: string) {
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFacets = async () => {
      setLoading(true);
      try {
        const url = query 
          ? `/api/search/facets?q=${encodeURIComponent(query)}`
          : '/api/search/facets';
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setFacets(data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchFacets();
  }, [query]);

  return { facets, loading };
}

// Popular products hook
export function usePopularProducts(limit = 10) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const response = await fetch(`/api/search/popular?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, [limit]);

  return { products, loading };
}

// Similar products hook
export function useSimilarProducts(productId: string, limit = 6) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchSimilarProducts = async () => {
      try {
        const response = await fetch(`/api/search/similar/${productId}?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [productId, limit]);

  return { products, loading };
}

// Search analytics hook
export function useSearchAnalytics() {
  const trackClick = useCallback(async (productId: string, query: string, position: number) => {
    try {
      await fetch('/api/search/analytics/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, query, position }),
      });
    } catch (error) {
    }
  }, []);

  const trackConversion = useCallback(async (productId: string, query: string) => {
    try {
      await fetch('/api/search/analytics/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, query }),
      });
    } catch (error) {
    }
  }, []);

  return { trackClick, trackConversion };
}

// Search history hook
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('search-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (error) {
      }
    }
  }, []);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    setHistory(prev => {
      const newHistory = [query, ...prev.filter(q => q !== query)].slice(0, 10);
      localStorage.setItem('search-history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('search-history');
  }, []);

  const removeFromHistory = useCallback((query: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(q => q !== query);
      localStorage.setItem('search-history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}