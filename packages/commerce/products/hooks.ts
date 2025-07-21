'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CommerceProduct, ProductQuery, ProductQueryResult } from '../types';
import {
  searchProducts,
  getProduct,
  getRelatedProducts,
  getTrendingProducts,
  trackProductView,
  checkProductAvailability,
} from './queries';

// Hook for product search with pagination
export function useProductSearch(initialQuery?: ProductQuery) {
  const [products, setProducts] = useState<CommerceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<ProductQuery>(initialQuery || {});
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasMore: false,
  });

  const search = useCallback(async (newQuery?: ProductQuery) => {
    setLoading(true);
    setError(null);

    const searchQuery = { ...query, ...newQuery };
    setQuery(searchQuery);

    try {
      const result = await searchProducts(searchQuery);
      setProducts(result.products);
      setPagination({
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        hasMore: result.hasMore,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products');
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Initial search
  useEffect(() => {
    search();
  }, []);

  // Load more for infinite scroll
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || loading) return;

    setLoading(true);
    try {
      const result = await searchProducts({ 
        ...query, 
        page: pagination.page + 1 
      });
      
      setProducts(prev => [...prev, ...result.products]);
      setPagination({
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        hasMore: result.hasMore,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more products');
    } finally {
      setLoading(false);
    }
  }, [query, pagination, loading]);

  // Update filters
  const updateFilters = useCallback((filters: Partial<ProductQuery>) => {
    search({ ...query, ...filters, page: 1 });
  }, [query, search]);

  // Clear filters
  const clearFilters = useCallback(() => {
    const { search: searchTerm } = query;
    search({ search: searchTerm, page: 1 });
  }, [query, search]);

  return {
    products,
    loading,
    error,
    query,
    pagination,
    search,
    loadMore,
    updateFilters,
    clearFilters,
  };
}

// Hook for single product
export function useProduct(productId: string | null) {
  const [product, setProduct] = useState<CommerceProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      return;
    }

    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getProduct(productId);
        if (!cancelled) {
          setProduct(data);
          // Track view
          trackProductView(productId).catch(console.error);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch product');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { product, loading, error };
}

// Hook for related products
export function useRelatedProducts(productId: string | null, limit: number = 8) {
  const [products, setProducts] = useState<CommerceProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;

    const fetchRelated = async () => {
      setLoading(true);
      try {
        const related = await getRelatedProducts(productId, limit);
        if (!cancelled) {
          setProducts(related);
        }
      } catch (error) {
        console.error('Failed to fetch related products:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRelated();

    return () => {
      cancelled = true;
    };
  }, [productId, limit]);

  return { products, loading };
}

// Hook for trending products
export function useTrendingProducts(category?: string, limit: number = 12) {
  const [products, setProducts] = useState<CommerceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTrending = async () => {
      setLoading(true);
      setError(null);

      try {
        const trending = await getTrendingProducts(category, limit);
        if (!cancelled) {
          setProducts(trending);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch trending');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTrending();

    return () => {
      cancelled = true;
    };
  }, [category, limit]);

  return { products, loading, error };
}

// Hook for product availability
export function useProductAvailability(productId: string | null) {
  const [availability, setAvailability] = useState<{
    available: boolean;
    quantity: number;
    message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const checkAvailability = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const result = await checkProductAvailability(productId);
      setAvailability(result);
    } catch (error) {
      console.error('Failed to check availability:', error);
      setAvailability({ available: false, quantity: 0, message: 'Error checking availability' });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return { 
    ...availability, 
    loading,
    refresh: checkAvailability 
  };
}

// Hook for product filters based on current results
export function useProductFilters(products: CommerceProduct[]) {
  return useMemo(() => {
    const conditions = new Set<string>();
    const sizes = new Set<string>();
    const colors = new Set<string>();
    const brands = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    products.forEach(product => {
      if (product.condition) conditions.add(product.condition);
      if (product.size) sizes.add(product.size);
      if (product.color) colors.add(product.color);
      if (product.brand) brands.add(product.brand);
      if (product.price < minPrice) minPrice = product.price;
      if (product.price > maxPrice) maxPrice = product.price;
    });

    return {
      conditions: Array.from(conditions).sort(),
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      brands: Array.from(brands).sort(),
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice === -Infinity ? 0 : maxPrice,
      },
    };
  }, [products]);
}