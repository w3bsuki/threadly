import { getMemoryCache } from './memory-cache';
import { getRedisCache } from './redis-cache';
import { CACHE_KEYS, CACHE_TAGS, CACHE_TTL, type CacheConfig } from './types';

interface CacheInterface {
  get(key: string): Promise<unknown>;
  set(
    key: string,
    value: unknown,
    options?: { ttl?: number; tags?: string[] }
  ): Promise<void>;
  del(key: string | string[]): Promise<void>;
  mget?(keys: string[]): Promise<unknown[]>;
  mset?(
    entries: Array<{
      key: string;
      value: unknown;
      options?: { ttl?: number; tags?: string[] };
    }>
  ): Promise<void>;
  clear?(): Promise<void>;
  invalidateByTag?(tag: string): Promise<void>;
  invalidateByTags?(tags: string[]): Promise<void>;
  isHealthy?(): Promise<boolean>;
  remember<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { ttl?: number; tags?: string[] }
  ): Promise<T>;
  getStats?(): Promise<unknown>;
}

export class MarketplaceCacheService {
  private cache: CacheInterface;
  private useMemoryCache = false;
  public readonly TTL = CACHE_TTL;

  constructor(config?: CacheConfig) {
    try {
      if (config?.url && config?.token) {
        this.cache = getRedisCache(config);
      } else {
        throw new Error('Redis config missing');
      }
    } catch (error) {
      // Fallback to memory cache
      this.cache = getMemoryCache();
      this.useMemoryCache = true;
    }
  }

  // Product caching
  async cacheProduct(product: any): Promise<void> {
    await this.cache.set(CACHE_KEYS.PRODUCT(product.id), product, {
      ttl: CACHE_TTL.LONG,
      tags: [CACHE_TAGS.PRODUCTS],
    });
  }

  async getProduct(productId: string): Promise<unknown | null> {
    return this.cache.get(CACHE_KEYS.PRODUCT(productId));
  }

  async cacheProductsByCategory(
    category: string,
    products: unknown[]
  ): Promise<void> {
    await this.cache.set(CACHE_KEYS.CATEGORY_PRODUCTS(category), products, {
      ttl: CACHE_TTL.MEDIUM,
      tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.CATEGORIES],
    });
  }

  async getProductsByCategory(category: string): Promise<any[] | null> {
    const result = await this.cache.get(CACHE_KEYS.CATEGORY_PRODUCTS(category));
    return result as any[] | null;
  }

  // Search results caching
  async cacheSearchResults(query: string, results: any): Promise<void> {
    await this.cache.set(CACHE_KEYS.SEARCH_RESULTS(query), results, {
      ttl: CACHE_TTL.SHORT,
      tags: [CACHE_TAGS.SEARCH, CACHE_TAGS.PRODUCTS],
    });
  }

  async getSearchResults(query: string): Promise<any | null> {
    return this.cache.get(CACHE_KEYS.SEARCH_RESULTS(query));
  }

  // User profile caching
  async cacheUserProfile(userId: string, profile: any): Promise<void> {
    await this.cache.set(CACHE_KEYS.USER_PROFILE(userId), profile, {
      ttl: CACHE_TTL.LONG,
      tags: [CACHE_TAGS.USERS],
    });
  }

  async getUserProfile(userId: string): Promise<any | null> {
    return this.cache.get(CACHE_KEYS.USER_PROFILE(userId));
  }

  // User favorites caching
  async cacheUserFavorites(userId: string, favorites: any[]): Promise<void> {
    await this.cache.set(CACHE_KEYS.USER_FAVORITES(userId), favorites, {
      ttl: CACHE_TTL.MEDIUM,
      tags: [CACHE_TAGS.USERS],
    });
  }

  async getUserFavorites(userId: string): Promise<any[] | null> {
    const result = await this.cache.get(CACHE_KEYS.USER_FAVORITES(userId));
    return result as any[] | null;
  }

  // User listings caching
  async cacheUserListings(
    userId: string,
    listings: any,
    cursor?: string
  ): Promise<void> {
    await this.cache.set(CACHE_KEYS.USER_LISTINGS(userId, cursor), listings, {
      ttl: CACHE_TTL.MEDIUM,
      tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.USERS],
    });
  }

  async getUserListings(userId: string, cursor?: string): Promise<any | null> {
    return this.cache.get(CACHE_KEYS.USER_LISTINGS(userId, cursor));
  }

  // Homepage data caching
  async cacheHomepageData(data: any): Promise<void> {
    await this.cache.set(CACHE_KEYS.HOMEPAGE_DATA, data, {
      ttl: CACHE_TTL.MEDIUM,
      tags: [CACHE_TAGS.PRODUCTS],
    });
  }

  async getHomepageData(): Promise<any | null> {
    return this.cache.get(CACHE_KEYS.HOMEPAGE_DATA);
  }

  // Trending products
  async cacheTrendingProducts(products: any[]): Promise<void> {
    await this.cache.set(CACHE_KEYS.TRENDING_PRODUCTS, products, {
      ttl: CACHE_TTL.LONG,
      tags: [CACHE_TAGS.PRODUCTS],
    });
  }

  async getTrendingProducts(): Promise<any[] | null> {
    const result = await this.cache.get(CACHE_KEYS.TRENDING_PRODUCTS);
    return result as any[] | null;
  }

  // Featured categories
  async cacheFeaturedCategories(categories: any[]): Promise<void> {
    await this.cache.set(CACHE_KEYS.FEATURED_CATEGORIES, categories, {
      ttl: CACHE_TTL.VERY_LONG,
      tags: [CACHE_TAGS.CATEGORIES],
    });
  }

  async getFeaturedCategories(): Promise<any[] | null> {
    const result = await this.cache.get(CACHE_KEYS.FEATURED_CATEGORIES);
    return result as any[] | null;
  }

  // New arrivals
  async cacheNewArrivals(products: any[]): Promise<void> {
    await this.cache.set(CACHE_KEYS.NEW_ARRIVALS, products, {
      ttl: CACHE_TTL.MEDIUM,
      tags: [CACHE_TAGS.PRODUCTS],
    });
  }

  async getNewArrivals(): Promise<any[] | null> {
    const result = await this.cache.get(CACHE_KEYS.NEW_ARRIVALS);
    return result as any[] | null;
  }

  // Conversations caching
  async cacheConversation(
    conversationId: string,
    conversation: any
  ): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.CONVERSATION(conversationId),
      conversation,
      {
        ttl: CACHE_TTL.SHORT,
        tags: [CACHE_TAGS.CONVERSATIONS],
      }
    );
  }

  async getConversation(conversationId: string): Promise<any | null> {
    return this.cache.get(CACHE_KEYS.CONVERSATION(conversationId));
  }

  async cacheUserConversations(
    userId: string,
    conversations: any[]
  ): Promise<void> {
    await this.cache.set(CACHE_KEYS.USER_CONVERSATIONS(userId), conversations, {
      ttl: CACHE_TTL.SHORT,
      tags: [CACHE_TAGS.CONVERSATIONS],
    });
  }

  async getUserConversations(userId: string): Promise<any[] | null> {
    const result = await this.cache.get(CACHE_KEYS.USER_CONVERSATIONS(userId));
    return result as any[] | null;
  }

  // Notifications caching
  async cacheUserNotifications(
    userId: string,
    notifications: any[]
  ): Promise<void> {
    await this.cache.set(CACHE_KEYS.NOTIFICATIONS(userId), notifications, {
      ttl: CACHE_TTL.SHORT,
      tags: [CACHE_TAGS.NOTIFICATIONS],
    });
  }

  async getUserNotifications(userId: string): Promise<any[] | null> {
    const result = await this.cache.get(CACHE_KEYS.NOTIFICATIONS(userId));
    return result as any[] | null;
  }

  // Admin statistics caching
  async cacheAdminStats(stats: any): Promise<void> {
    await this.cache.set(CACHE_KEYS.ADMIN_STATS, stats, {
      ttl: CACHE_TTL.MEDIUM,
      tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.USERS, CACHE_TAGS.ORDERS],
    });
  }

  async getAdminStats(): Promise<any | null> {
    return this.cache.get(CACHE_KEYS.ADMIN_STATS);
  }

  // Cache invalidation methods
  async invalidateProduct(productId: string): Promise<void> {
    const promises = [this.cache.del(CACHE_KEYS.PRODUCT(productId))];
    if (this.cache.invalidateByTag) {
      promises.push(this.cache.invalidateByTag(CACHE_TAGS.PRODUCTS));
    }
    await Promise.all(promises);
  }

  async invalidateUser(userId: string): Promise<void> {
    const promises = [
      this.cache.del(CACHE_KEYS.USER_PROFILE(userId)),
      this.cache.del(CACHE_KEYS.USER_FAVORITES(userId)),
      this.cache.del(CACHE_KEYS.USER_CONVERSATIONS(userId)),
      this.cache.del(CACHE_KEYS.NOTIFICATIONS(userId)),
    ];
    if (this.cache.invalidateByTag) {
      promises.push(this.cache.invalidateByTag(CACHE_TAGS.USERS));
    }
    await Promise.all(promises);
  }

  async invalidateUserListings(_userId: string): Promise<void> {
    // Invalidate all pagination variants for this user's listings
    if (this.cache.invalidateByTag) {
      await this.cache.invalidateByTag(CACHE_TAGS.USERS);
    }
  }

  async invalidateAllProducts(): Promise<void> {
    if (this.cache.invalidateByTag) {
      await this.cache.invalidateByTag(CACHE_TAGS.PRODUCTS);
    }
  }

  async invalidateSearchResults(): Promise<void> {
    if (this.cache.invalidateByTag) {
      await this.cache.invalidateByTag(CACHE_TAGS.SEARCH);
    }
  }

  async invalidateConversations(): Promise<void> {
    if (this.cache.invalidateByTag) {
      await this.cache.invalidateByTag(CACHE_TAGS.CONVERSATIONS);
    }
  }

  // Generic tag invalidation
  async invalidateByTag(tag: string): Promise<void> {
    if (this.cache.invalidateByTag) {
      await this.cache.invalidateByTag(tag);
    }
  }

  // Warm cache methods for critical data
  async warmProductCache(products: any[]): Promise<void> {
    const cacheOperations = products.map((product) => ({
      key: CACHE_KEYS.PRODUCT(product.id),
      value: product,
      options: {
        ttl: CACHE_TTL.LONG,
        tags: [CACHE_TAGS.PRODUCTS],
      },
    }));

    if (this.cache.mset) {
      await this.cache.mset(cacheOperations);
    } else {
      // Fallback to individual sets
      await Promise.all(
        cacheOperations.map((op) =>
          this.cache.set(op.key, op.value, op.options)
        )
      );
    }
  }

  // Generic cache methods
  async get<T>(key: string): Promise<T | null> {
    const result = await this.cache.get(key);
    return result as T | null;
  }

  async set<T>(
    key: string,
    value: T,
    options?: { ttl?: number; tags?: string[] }
  ): Promise<void> {
    return this.cache.set(key, value, options);
  }

  // Cache-aside pattern wrapper
  async remember<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM,
    tags: string[] = []
  ): Promise<T> {
    return this.cache.remember(key, fetcher, { ttl, tags });
  }

  // Statistics
  async getStats() {
    if (this.cache.getStats) {
      return this.cache.getStats();
    }
    return null;
  }

  // Check cache backend type
  getCacheType(): string {
    return this.useMemoryCache ? 'memory' : 'redis';
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      const testKey = 'health-check';
      await this.set(testKey, { timestamp: Date.now() }, { ttl: 60 });
      const result = await this.get(testKey);
      await this.cache.del(testKey);
      return result !== null;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
let marketplaceCacheService: MarketplaceCacheService | null = null;

export function getCacheService(config?: CacheConfig): MarketplaceCacheService {
  if (!marketplaceCacheService) {
    // If no config provided, try to use environment variables
    let finalConfig: CacheConfig | undefined = config;

    if (
      !config &&
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      finalConfig = {
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      };
    }

    // Always create a cache service, even without config (will use memory cache)
    marketplaceCacheService = new MarketplaceCacheService(finalConfig);
  }

  return marketplaceCacheService;
}
