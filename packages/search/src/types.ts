export interface SearchConfig {
  appId: string;
  apiKey: string;
  searchOnlyApiKey: string;
  indexName: string;
}

export interface SearchProduct {
  id: string;
  title: string;
  description: string;
  brand?: string;
  price: number;
  condition: string;
  size?: string;
  categoryId: string;
  categoryName?: string;
  sellerId: string;
  sellerName: string;
  sellerRating?: number;
  sellerLocation?: string;
  images: string[];
  views: number;
  favorites: number;
  status: string;
  createdAt: number; // Unix timestamp for Algolia
  tags: string[];
  colors?: string[];
  materials?: string[];
  availableForTrade?: boolean;
}

export interface SearchFilters {
  query?: string;
  categories?: string[];
  brands?: string[];
  conditions?: string[];
  sizes?: string[];
  colors?: string[];
  materials?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  sellerRating?: number;
  availableForTrade?: boolean;
  location?: string;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'most_viewed' | 'most_favorited';
  [key: string]: unknown;
}

export interface SearchResult {
  hits: SearchProduct[];
  totalHits: number;
  page: number;
  totalPages: number;
  processingTimeMS: number;
  facets?: Record<string, Record<string, number>>;
  filters?: SearchFilters;
}

export interface SearchSuggestion {
  query: string;
  category?: string;
  count: number;
}

export interface SearchAnalytics {
  totalSearches: number;
  topQueries: Array<{
    query: string;
    count: number;
    clickThrough: number;
  }>;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  averageClickPosition: number;
  conversionRate: number;
}

export interface SearchIndexable {
  index(products: SearchProduct[]): Promise<void>;
  updateProduct(product: SearchProduct): Promise<void>;
  deleteProduct(productId: string): Promise<void>;
  clearIndex(): Promise<void>;
  getIndexStats(): Promise<{
    objectCount: number;
    fileSize: number;
  }>;
}

export interface SearchEngine {
  search(filters: SearchFilters, page?: number, hitsPerPage?: number): Promise<SearchResult>;
  searchSuggestions(query: string, limit?: number): Promise<SearchSuggestion[]>;
  getPopularProducts(limit?: number): Promise<SearchProduct[]>;
  getSimilarProducts(productId: string, limit?: number): Promise<SearchProduct[]>;
  getProductsByCategory(category: string, limit?: number): Promise<SearchProduct[]>;
  trackClick(productId: string, query: string, position: number): Promise<void>;
  trackConversion(productId: string, query: string): Promise<void>;
  getAnalytics(startDate: Date, endDate: Date): Promise<SearchAnalytics>;
}

// Facet configurations for filtering
export const SEARCH_FACETS = {
  CATEGORIES: 'categoryName',
  BRANDS: 'brand',
  CONDITIONS: 'condition',
  SIZES: 'size',
  COLORS: 'colors',
  MATERIALS: 'materials',
  PRICE_RANGES: 'priceRanges',
  SELLER_RATING: 'sellerRating',
  LOCATION: 'sellerLocation',
} as const;

// Search settings
export const SEARCH_SETTINGS = {
  DEFAULT_HITS_PER_PAGE: 20,
  MAX_HITS_PER_PAGE: 100,
  DEFAULT_SUGGESTION_LIMIT: 5,
  SIMILAR_PRODUCTS_LIMIT: 6,
  POPULAR_PRODUCTS_LIMIT: 10,
  FACET_LIMITS: {
    categories: 20,
    brands: 50,
    conditions: 10,
    sizes: 30,
    colors: 20,
    materials: 30,
  },
} as const;

// Re-export types from history for convenience
export type { SavedSearch, SearchHistoryItem } from './history';