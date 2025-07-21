import { Redis } from '@upstash/redis';
import { withRetry } from '@repo/error-handling';
import type { CacheConfig, CacheOptions, CacheStats, CacheService } from './types';

export class RedisCache implements CacheService {
  private redis: Redis;
  private defaultTTL: number;
  private stats = {
    hits: 0,
    misses: 0,
  };

  constructor(config: CacheConfig) {
    this.redis = new Redis({
      url: config.url,
      token: config.token,
    });
    this.defaultTTL = config.defaultTTL || 3600; // 1 hour default
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await withRetry(
        () => this.redis.get(key),
        { retries: 3, minTimeout: 100 }
      );

      if (result === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return result as T;
    } catch (error) {
      this.stats.misses++;
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl || this.defaultTTL;
      
      await withRetry(
        () => this.redis.setex(key, ttl, JSON.stringify(value)),
        { retries: 3, minTimeout: 100 }
      );

      // Store tags for cache invalidation
      if (options?.tags) {
        for (const tag of options.tags) {
          await this.addToTag(tag, key);
        }
      }
    } catch (error) {
      // Don't throw, just log the error to avoid breaking the app
    }
  }

  async del(key: string): Promise<void> {
    try {
      await withRetry(
        () => this.redis.del(key),
        { retries: 3, minTimeout: 100 }
      );
    } catch (error) {
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await withRetry(
        () => this.redis.exists(key),
        { retries: 3, minTimeout: 100 }
      );
      return result === 1;
    } catch (error) {
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await withRetry(
        () => this.redis.expire(key, ttl),
        { retries: 3, minTimeout: 100 }
      );
    } catch (error) {
    }
  }

  async clear(): Promise<void> {
    try {
      await withRetry(
        () => this.redis.flushall(),
        { retries: 3, minTimeout: 100 }
      );
    } catch (error) {
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      const tagKey = `tag:${tag}`;
      const keys = await this.redis.smembers(tagKey);
      
      if (keys.length > 0) {
        // Delete all keys with this tag
        await this.redis.del(...keys);
        // Clear the tag set
        await this.redis.del(tagKey);
      }
    } catch (error) {
    }
  }

  async getStats(): Promise<CacheStats> {
    const totalOperations = this.stats.hits + this.stats.misses;
    const hitRate = totalOperations > 0 ? this.stats.hits / totalOperations : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      totalOperations,
    };
  }

  // Helper method to add key to tag set
  private async addToTag(tag: string, key: string): Promise<void> {
    try {
      const tagKey = `tag:${tag}`;
      await this.redis.sadd(tagKey, key);
      // Set TTL for tag keys to prevent memory leaks
      await this.redis.expire(tagKey, 7 * 24 * 60 * 60); // 1 week
    } catch (error) {
    }
  }

  // Helper method for cache-aside pattern
  async remember<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    options?: CacheOptions
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const value = await fetcher();
    
    // Store in cache
    await this.set(key, value, options);
    
    return value;
  }

  // Batch operations for better performance
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const results = await withRetry(
        () => this.redis.mget(...keys),
        { retries: 3, minTimeout: 100 }
      );

      return results.map((result, index) => {
        if (result === null) {
          this.stats.misses++;
          return null;
        }
        this.stats.hits++;
        return result as T;
      });
    } catch (error) {
      return keys.map(() => null);
    }
  }

  async mset<T>(entries: Array<{ key: string; value: T; options?: CacheOptions }>): Promise<void> {
    try {
      // Prepare pipeline commands
      const pipeline = this.redis.pipeline();
      
      for (const entry of entries) {
        const ttl = entry.options?.ttl || this.defaultTTL;
        pipeline.setex(entry.key, ttl, JSON.stringify(entry.value));
      }

      await pipeline.exec();

      // Handle tags
      for (const entry of entries) {
        if (entry.options?.tags) {
          for (const tag of entry.options.tags) {
            await this.addToTag(tag, entry.key);
          }
        }
      }
    } catch (error) {
    }
  }
}

// Singleton instance
let redisCache: RedisCache | null = null;

export function getRedisCache(config?: CacheConfig): RedisCache {
  if (!redisCache && config) {
    redisCache = new RedisCache(config);
  }
  
  if (!redisCache) {
    throw new Error('RedisCache not initialized. Call with config first.');
  }
  
  return redisCache;
}