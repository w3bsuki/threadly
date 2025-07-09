export interface CacheConfig {
  url: string;
  token?: string;
  defaultTTL?: number; // Time to live in seconds
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // For cache invalidation
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalOperations: number;
}

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttl: number): Promise<void>;
  clear(): Promise<void>;
  invalidateByTag(tag: string): Promise<void>;
  getStats(): Promise<CacheStats>;
}

// Predefined cache keys and TTLs
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  PRODUCT: (id: string) => `product:${id}`,
  CATEGORY_PRODUCTS: (category: string) => `category:${category}:products`,
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  USER_FAVORITES: (userId: string) => `user:${userId}:favorites`,
  SEARCH_RESULTS: (query: string) => `search:${Buffer.from(query).toString('base64')}`,
  TRENDING_PRODUCTS: 'trending:products',
  FEATURED_CATEGORIES: 'featured:categories',
  NEW_ARRIVALS: 'new:arrivals',
  HOMEPAGE_DATA: 'homepage:data',
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
  CONVERSATION: (id: string) => `conversation:${id}`,
  USER_CONVERSATIONS: (userId: string) => `user:${userId}:conversations`,
} as const;

export const CACHE_TTL = {
  SHORT: 60, // 1 minute - for frequently changing data like products
  MEDIUM: 5 * 60, // 5 minutes - for semi-dynamic content
  LONG: 30 * 60, // 30 minutes - for relatively stable data
  VERY_LONG: 2 * 60 * 60, // 2 hours - for static content
  WEEK: 7 * 24 * 60 * 60, // 1 week - for rarely changing data
} as const;

export const CACHE_TAGS = {
  PRODUCTS: 'products',
  USERS: 'users',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  NOTIFICATIONS: 'notifications',
  CONVERSATIONS: 'conversations',
  SEARCH: 'search',
} as const;