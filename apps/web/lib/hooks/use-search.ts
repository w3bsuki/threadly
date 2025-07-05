'use client';

import { useState, useEffect, useCallback } from 'react';
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
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'most_viewed' | 'most_favorited';
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

// Use local API endpoint for search
const API_BASE = '';

// Product type definition
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  brand?: string;
  size?: string;
  color?: string;
  images: { imageUrl: string }[];
  category?: { name: string };
  seller: { firstName?: string; lastName?: string };
  views?: number;
  _count?: { favorites?: number };
  createdAt: string;
}

export function useSearch(initialFilters: SearchFilters = {}) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [source, setSource] = useState<'algolia' | 'database' | 'error'>('algolia');

  // Debounce search query for better UX
  const debouncedQuery = useDebounce(filters.query || '', 300);

  const buildSearchUrl = useCallback((searchFilters: SearchFilters, searchPage: number) => {
    const params = new URLSearchParams();
    
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (searchFilters.categories?.length) {
      searchFilters.categories.forEach(cat => params.append('categories', cat));
    }
    if (searchFilters.brands?.length) {
      searchFilters.brands.forEach(brand => params.append('brands', brand));
    }
    if (searchFilters.conditions?.length) {
      searchFilters.conditions.forEach(condition => params.append('conditions', condition));
    }
    if (searchFilters.sizes?.length) {
      searchFilters.sizes.forEach(size => params.append('sizes', size));
    }
    if (searchFilters.colors?.length) {
      searchFilters.colors.forEach(color => params.append('colors', color));
    }
    if (searchFilters.priceMin !== undefined) params.set('priceMin', searchFilters.priceMin.toString());
    if (searchFilters.priceMax !== undefined) params.set('priceMax', searchFilters.priceMax.toString());
    if (searchFilters.sortBy) params.set('sortBy', searchFilters.sortBy);
    
    params.set('page', searchPage.toString());
    params.set('hitsPerPage', '20');

    return `${API_BASE}/api/search?${params.toString()}`;
  }, [debouncedQuery]);

  const performSearch = useCallback(async (searchFilters: SearchFilters, searchPage: number) => {
    setLoading(true);
    setError(null);

    try {
      // Simple search using local API
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('q', debouncedQuery);
      
      const response = await fetch(`/api/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const products = await response.json();
      
      // Transform to expected format
      const searchResult: SearchResult = {
        hits: products.map((p: Product) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          price: p.price,
          condition: p.condition,
          brand: p.brand,
          size: p.size,
          color: p.color,
          images: p.images.map((img: { imageUrl: string }) => img.imageUrl),
          categoryName: p.category?.name || 'Other',
          sellerName: `${p.seller.firstName || ''} ${p.seller.lastName || ''}`.trim() || 'Anonymous',
          sellerRating: 4.5, // Default for now
          views: p.views || 0,
          favorites: p._count?.favorites || 0,
          createdAt: new Date(p.createdAt).getTime(),
        })),
        totalHits: products.length,
        page: 0,
        totalPages: 1,
        processingTimeMS: 0,
      };
      
      setResults(searchResult);
      setSource('database');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      setResults(null);
      setSource('error');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  // Perform search when filters or page change
  useEffect(() => {
    // Only search if we have a query or filters
    if (debouncedQuery || Object.keys(filters).some(key => key !== 'query' && filters[key as keyof SearchFilters])) {
      performSearch(filters, page);
    } else {
      // Clear results if no query/filters
      setResults(null);
      setLoading(false);
    }
  }, [debouncedQuery, filters, page, performSearch]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ query: filters.query }); // Keep query, clear other filters
    setPage(0);
  }, [filters.query]);

  const loadMore = useCallback(() => {
    if (results && page < results.totalPages - 1) {
      setPage(prev => prev + 1);
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