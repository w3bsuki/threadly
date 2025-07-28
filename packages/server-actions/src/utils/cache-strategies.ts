import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';

export interface CacheConfig {
  revalidate?: number | false;
  tags?: string[];
}

// Cache tag generators for consistent naming
export const cacheTags = {
  all: (entity: string) => `${entity}:all`,
  byId: (entity: string, id: string) => `${entity}:${id}`,
  byUser: (entity: string, userId: string) => `${entity}:user:${userId}`,
  byQuery: (entity: string, query: string) => `${entity}:query:${query}`,
  byStatus: (entity: string, status: string) => `${entity}:status:${status}`,
} as const;

// Common cache configurations
export const cacheConfigs = {
  // No cache
  none: { revalidate: false },

  // Short-lived cache (1 minute)
  short: { revalidate: 60 },

  // Medium cache (5 minutes)
  medium: { revalidate: 300 },

  // Long cache (1 hour)
  long: { revalidate: 3600 },

  // Very long cache (24 hours)
  veryLong: { revalidate: 86_400 },

  // Static (until manually revalidated)
  static: { revalidate: false },
} as const;

// Entity-specific cache strategies
export const entityCacheStrategies = {
  product: {
    list: {
      revalidate: 300, // 5 minutes
      tags: (filters?: any) => [
        cacheTags.all('products'),
        ...(filters?.categoryId
          ? [cacheTags.byQuery('products', `category:${filters.categoryId}`)]
          : []),
        ...(filters?.status
          ? [cacheTags.byStatus('products', filters.status)]
          : []),
      ],
    },
    detail: {
      revalidate: 3600, // 1 hour
      tags: (id: string) => [
        cacheTags.byId('product', id),
        cacheTags.all('products'),
      ],
    },
    byUser: {
      revalidate: 300, // 5 minutes
      tags: (userId: string) => [
        cacheTags.byUser('products', userId),
        cacheTags.all('products'),
      ],
    },
  },

  user: {
    profile: {
      revalidate: 3600, // 1 hour
      tags: (id: string) => [cacheTags.byId('user', id)],
    },
    list: {
      revalidate: 300, // 5 minutes
      tags: () => [cacheTags.all('users')],
    },
  },

  order: {
    list: {
      revalidate: 60, // 1 minute
      tags: (userId: string) => [
        cacheTags.byUser('orders', userId),
        cacheTags.all('orders'),
      ],
    },
    detail: {
      revalidate: 300, // 5 minutes
      tags: (id: string, userId: string) => [
        cacheTags.byId('order', id),
        cacheTags.byUser('orders', userId),
      ],
    },
  },

  cart: {
    items: {
      revalidate: false, // No cache for cart
      tags: (userId: string) => [cacheTags.byUser('cart', userId)],
    },
  },

  categories: {
    all: {
      revalidate: 86_400, // 24 hours
      tags: () => [cacheTags.all('categories')],
    },
  },
};

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate specific entity
  invalidateEntity: async (entity: string, id: string) => {
    await Promise.all([
      revalidateTag(cacheTags.byId(entity, id)),
      revalidateTag(cacheTags.all(entity)),
    ]);
  },

  // Invalidate all of an entity type
  invalidateAll: async (entity: string) => {
    await revalidateTag(cacheTags.all(entity));
  },

  // Invalidate user-specific data
  invalidateUserData: async (entity: string, userId: string) => {
    await revalidateTag(cacheTags.byUser(entity, userId));
  },

  // Invalidate multiple related entities
  invalidateRelated: async (tags: string[]) => {
    await Promise.all(tags.map((tag) => revalidateTag(tag)));
  },

  // Invalidate paths
  invalidatePaths: async (paths: string[]) => {
    await Promise.all(paths.map((path) => revalidatePath(path)));
  },
};

// Create cached function with automatic tag generation
export function createCachedFunction<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: {
    key: string[];
    tags?: (...args: TArgs) => string[];
    revalidate?: number | false;
  }
) {
  return unstable_cache(fn, options.key, {
    revalidate: options.revalidate ?? 3600,
    tags: options.tags ? options.tags(...([] as any)) : undefined,
  });
}

// Cache wrapper for server actions
export function withCache<T extends (...args: any[]) => Promise<any>>(
  action: T,
  cacheKey: (...args: Parameters<T>) => string[],
  config?: CacheConfig
): T {
  return (async (...args: Parameters<T>) => {
    const key = cacheKey(...args);

    const cachedFn = unstable_cache(async () => action(...args), key, config);

    return cachedFn();
  }) as T;
}

// Stale-while-revalidate pattern
export async function staleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    staleTime?: number; // Time before data is considered stale
    cacheTime?: number; // Total cache time
  } = {}
): Promise<T> {
  const { staleTime = 60_000, cacheTime = 300_000 } = options; // 1 min stale, 5 min cache

  // This is a simplified version - in production, use Redis or similar
  // for proper SWR implementation
  const cached = await getCachedValue<T>(key);

  if (cached) {
    const age = Date.now() - cached.timestamp;

    if (age < staleTime) {
      // Fresh - return immediately
      return cached.data;
    }
    if (age < cacheTime) {
      // Stale - return cached but revalidate in background
      fetcher().then((data) => setCachedValue(key, data));
      return cached.data;
    }
  }

  // No cache or expired - fetch fresh
  const data = await fetcher();
  await setCachedValue(key, data);
  return data;
}

// Helper functions for cache storage (simplified - use Redis in production)
async function getCachedValue<T>(
  key: string
): Promise<{ data: T; timestamp: number } | null> {
  // Implementation would use Redis or similar
  return null;
}

async function setCachedValue<T>(key: string, data: T): Promise<void> {
  // Implementation would use Redis or similar
}

// Batch cache invalidation
export class CacheInvalidator {
  private queue: Set<string> = new Set();
  private timer: NodeJS.Timeout | null = null;

  constructor(private batchDelay = 100) {}

  invalidateTag(tag: string) {
    this.queue.add(tag);
    this.scheduleFlush();
  }

  invalidateTags(tags: string[]) {
    tags.forEach((tag) => this.queue.add(tag));
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.timer) return;

    this.timer = setTimeout(() => {
      this.flush();
    }, this.batchDelay);
  }

  private async flush() {
    const tags = Array.from(this.queue);
    this.queue.clear();
    this.timer = null;

    if (tags.length === 0) return;

    await Promise.all(tags.map((tag) => revalidateTag(tag)));
  }
}
