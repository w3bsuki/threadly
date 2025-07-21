'use client';

/**
 * Unified Search Hook
 * Provides consistent search functionality across all apps
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import type { 
  SearchFilters, 
  SearchResult, 
  SearchProduct, 
  SearchSuggestion,
  SavedSearch,
  SearchHistoryItem 
} from '../types';

export interface UseSearchOptions {
  autoSearch?: boolean;
  debounceMs?: number;
  trackHistory?: boolean;
  cacheResults?: boolean;
}

export interface UseSearchReturn {
  // State
  results: SearchProduct[];
  suggestions: SearchSuggestion[];
  history: SearchHistoryItem[];
  savedSearches: SavedSearch[];
  isLoading: boolean;
  isLoadingSuggestions: boolean;
  error: string | null;
  totalHits: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  
  // Search actions
  search: (filters: SearchFilters, page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  getSuggestions: (query: string) => Promise<void>;
  clearResults: () => void;
  
  // History actions
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  
  // Saved searches actions
  loadSavedSearches: () => Promise<void>;
  saveSearch: (name: string, filters: SearchFilters, alertsEnabled?: boolean) => Promise<boolean>;
  updateSavedSearch: (id: string, updates: Partial<SavedSearch>) => Promise<boolean>;
  deleteSavedSearch: (id: string) => Promise<boolean>;
  toggleSearchAlerts: (id: string, enabled: boolean) => Promise<boolean>;
  
  // Utility
  executeSearch: (savedSearch: SavedSearch) => Promise<void>;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    autoSearch = false,
    debounceMs = 300,
    trackHistory = true,
    cacheResults = true,
  } = options;

  const { user } = useUser();
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [lastFilters, setLastFilters] = useState<SearchFilters | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Main search function
   */
  const search = useCallback(async (filters: SearchFilters, page = 0) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.query) params.set('q', filters.query);
      if (filters.categories?.length) params.set('categories', filters.categories.join(','));
      if (filters.brands?.length) params.set('brands', filters.brands.join(','));
      if (filters.conditions?.length) params.set('conditions', filters.conditions.join(','));
      if (filters.sizes?.length) params.set('sizes', filters.sizes.join(','));
      if (filters.colors?.length) params.set('colors', filters.colors.join(','));
      if (filters.priceRange?.min) params.set('minPrice', filters.priceRange.min.toString());
      if (filters.priceRange?.max) params.set('maxPrice', filters.priceRange.max.toString());
      if (filters.sellerRating) params.set('sellerRating', filters.sellerRating.toString());
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      params.set('page', page.toString());

      const response = await fetch(`/api/search?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const result: SearchResult = await response.json();
      
      setSearchResult(result);
      
      // Reset or append results based on page
      if (page === 0) {
        setResults(result.hits);
      } else {
        setResults(prev => [...prev, ...result.hits]);
      }
      
      setLastFilters(filters);

      // Add to local history if enabled
      if (trackHistory && filters.query) {
        const { SearchHistoryService } = await import('../history');
        SearchHistoryService.addToLocalHistory(
          filters.query,
          filters,
          result.totalHits
        );
        
        // Refresh history
        await loadHistory();
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      setError(error.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, [trackHistory]);

  /**
   * Load more results (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!lastFilters || !searchResult || isLoading) return;

    const nextPage = searchResult.page + 1;
    if (nextPage >= searchResult.totalPages) return;

    await search(lastFilters, nextPage);
  }, [lastFilters, searchResult, isLoading, search]);

  /**
   * Get search suggestions
   */
  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      
      try {
        const params = new URLSearchParams({ q: query });
        const response = await fetch(`/api/search/suggestions?${params.toString()}`);
        
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.warn('Failed to load suggestions:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, debounceMs);
  }, [debounceMs]);

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setResults([]);
    setSuggestions([]);
    setSearchResult(null);
    setLastFilters(null);
    setError(null);
  }, []);

  /**
   * Load search history
   */
  const loadHistory = useCallback(async () => {
    try {
      // Load local history
      const { SearchHistoryService } = await import('../history');
      const localHistory = SearchHistoryService.getLocalHistory();
      
      // Load database history if user is authenticated
      if (user?.id) {
        try {
          const response = await fetch('/api/search-history');
          if (response.ok) {
            const data = await response.json();
            const dbHistory = data.history || [];
            
            // Merge and deduplicate histories
            const merged = [...dbHistory, ...localHistory];
            const unique = merged.filter((item, index, arr) => 
              arr.findIndex(h => h.query === item.query) === index
            );
            
            setHistory(unique.slice(0, 50)); // Limit to 50 items
          } else {
            setHistory(localHistory);
          }
        } catch (error) {
          setHistory(localHistory);
        }
      } else {
        setHistory(localHistory);
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }, [user?.id]);

  /**
   * Clear search history
   */
  const clearHistory = useCallback(async () => {
    try {
      const { SearchHistoryService } = await import('../history');
      
      // Clear local history
      SearchHistoryService.clearLocalHistory();
      
      // Clear database history if user is authenticated
      if (user?.id) {
        await fetch('/api/search-history', { method: 'DELETE' });
      }
      
      setHistory([]);
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }, [user?.id]);

  /**
   * Load saved searches
   */
  const loadSavedSearches = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/saved-searches');
      if (response.ok) {
        const data = await response.json();
        setSavedSearches(data.searches || []);
      }
    } catch (error) {
      console.warn('Failed to load saved searches:', error);
    }
  }, [user?.id]);

  /**
   * Save a search
   */
  const saveSearch = useCallback(async (
    name: string,
    filters: SearchFilters,
    alertsEnabled = false
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          query: filters.query || '',
          filters,
          alertsEnabled,
        }),
      });

      if (response.ok) {
        await loadSavedSearches();
        return true;
      }
    } catch (error) {
      console.warn('Failed to save search:', error);
    }

    return false;
  }, [user?.id, loadSavedSearches]);

  /**
   * Update saved search
   */
  const updateSavedSearch = useCallback(async (
    id: string,
    updates: Partial<SavedSearch>
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const response = await fetch(`/api/saved-searches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadSavedSearches();
        return true;
      }
    } catch (error) {
      console.warn('Failed to update saved search:', error);
    }

    return false;
  }, [user?.id, loadSavedSearches]);

  /**
   * Delete saved search
   */
  const deleteSavedSearch = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const response = await fetch(`/api/saved-searches/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedSearches(prev => prev.filter(s => s.id !== id));
        return true;
      }
    } catch (error) {
      console.warn('Failed to delete saved search:', error);
    }

    return false;
  }, [user?.id]);

  /**
   * Toggle search alerts
   */
  const toggleSearchAlerts = useCallback(async (
    id: string,
    enabled: boolean
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const response = await fetch(`/api/saved-searches/${id}/toggle-alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        setSavedSearches(prev => prev.map(s => 
          s.id === id ? { ...s, alertsEnabled: enabled } : s
        ));
        return true;
      }
    } catch (error) {
      console.warn('Failed to toggle search alerts:', error);
    }

    return false;
  }, [user?.id]);

  /**
   * Execute a saved search
   */
  const executeSearch = useCallback(async (savedSearch: SavedSearch) => {
    const filters: SearchFilters = {
      query: savedSearch.query,
      ...(savedSearch.filters as SearchFilters || {}),
    };
    
    await search(filters);
  }, [search]);

  // Load initial data
  useEffect(() => {
    loadHistory();
    if (user?.id) {
      loadSavedSearches();
    }
  }, [user?.id, loadHistory, loadSavedSearches]);

  return {
    // State
    results,
    suggestions,
    history,
    savedSearches,
    isLoading,
    isLoadingSuggestions,
    error,
    totalHits: searchResult?.totalHits || 0,
    totalPages: searchResult?.totalPages || 0,
    currentPage: searchResult?.page || 0,
    hasNextPage: searchResult ? (searchResult.page + 1) < searchResult.totalPages : false,
    
    // Search actions
    search,
    loadMore,
    getSuggestions,
    clearResults,
    
    // History actions
    loadHistory,
    clearHistory,
    
    // Saved searches actions
    loadSavedSearches,
    saveSearch,
    updateSavedSearch,
    deleteSavedSearch,
    toggleSearchAlerts,
    
    // Utility
    executeSearch,
  };
}