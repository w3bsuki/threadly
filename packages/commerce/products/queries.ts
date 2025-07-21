import type { CommerceProduct, ProductQuery, ProductQueryResult } from '../types';

// Build query string from ProductQuery object
function buildQueryString(query: ProductQuery): string {
  const params = new URLSearchParams();

  if (query.search) params.append('search', query.search);
  if (query.category) params.append('category', query.category);
  if (query.subcategory) params.append('subcategory', query.subcategory);
  if (query.minPrice !== undefined) params.append('minPrice', query.minPrice.toString());
  if (query.maxPrice !== undefined) params.append('maxPrice', query.maxPrice.toString());
  if (query.sellerId) params.append('sellerId', query.sellerId);
  if (query.status) params.append('status', query.status);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());

  // Handle array parameters
  if (query.condition?.length) {
    query.condition.forEach(c => params.append('condition', c));
  }
  if (query.size?.length) {
    query.size.forEach(s => params.append('size', s));
  }
  if (query.color?.length) {
    query.color.forEach(c => params.append('color', c));
  }
  if (query.brand?.length) {
    query.brand.forEach(b => params.append('brand', b));
  }

  return params.toString();
}

// Search products
export async function searchProducts(
  query: ProductQuery = {}
): Promise<ProductQueryResult> {
  const queryString = buildQueryString(query);
  const response = await fetch(`/api/products${queryString ? `?${queryString}` : ''}`);

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
}

// Get single product
export async function getProduct(productId: string): Promise<CommerceProduct | null> {
  const response = await fetch(`/api/products/${productId}`);

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch product');
  }

  return response.json();
}

// Get products by seller
export async function getSellerProducts(
  sellerId: string,
  query?: Omit<ProductQuery, 'sellerId'>
): Promise<ProductQueryResult> {
  return searchProducts({ ...query, sellerId });
}

// Get related products
export async function getRelatedProducts(
  productId: string,
  limit: number = 8
): Promise<CommerceProduct[]> {
  const response = await fetch(`/api/products/${productId}/related?limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to fetch related products');
  }

  return response.json();
}

// Get trending products
export async function getTrendingProducts(
  category?: string,
  limit: number = 12
): Promise<CommerceProduct[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  params.append('limit', limit.toString());

  const response = await fetch(`/api/products/trending?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch trending products');
  }

  return response.json();
}

// Get recently viewed products
export async function getRecentlyViewedProducts(
  limit: number = 8
): Promise<CommerceProduct[]> {
  const response = await fetch(`/api/products/recently-viewed?limit=${limit}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recently viewed products');
  }

  return response.json();
}

// Track product view
export async function trackProductView(productId: string): Promise<void> {
  await fetch(`/api/products/${productId}/view`, {
    method: 'POST',
    credentials: 'include',
  });
}

// Check product availability
export async function checkProductAvailability(
  productId: string
): Promise<{
  available: boolean;
  quantity: number;
  message?: string;
}> {
  const response = await fetch(`/api/products/${productId}/availability`);

  if (!response.ok) {
    throw new Error('Failed to check availability');
  }

  return response.json();
}

// Batch check availability
export async function checkBatchAvailability(
  productIds: string[]
): Promise<Record<string, {
  available: boolean;
  quantity: number;
}>> {
  const response = await fetch('/api/products/availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to check batch availability');
  }

  return response.json();
}

// Get product recommendations
export async function getProductRecommendations(
  userId?: string,
  limit: number = 12
): Promise<CommerceProduct[]> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (userId) params.append('userId', userId);

  const response = await fetch(`/api/products/recommendations?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }

  return response.json();
}

// Get categories
export async function getCategories(): Promise<{
  id: string;
  name: string;
  slug: string;
  subcategories?: { id: string; name: string; slug: string }[];
}[]> {
  const response = await fetch('/api/categories');

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}

// Get product filters
export async function getProductFilters(
  category?: string
): Promise<{
  conditions: string[];
  sizes: string[];
  colors: string[];
  brands: string[];
  priceRange: { min: number; max: number };
}> {
  const params = category ? `?category=${category}` : '';
  const response = await fetch(`/api/products/filters${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch filters');
  }

  return response.json();
}