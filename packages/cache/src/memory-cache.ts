// Simple in-memory cache for development/fallback
export class MemoryCache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: any, ttlOrOptions?: number | { ttl?: number; tags?: string[] }): Promise<void> {
    const ttl = typeof ttlOrOptions === 'number' ? ttlOrOptions : (ttlOrOptions?.ttl || 3600);
    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiry });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  async remember<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { ttl?: number; tags?: string[] }
  ): Promise<T> {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }
    
    const value = await fetcher();
    await this.set(key, value, options?.ttl);
    return value;
  }

  async del(key: string): Promise<void> {
    return this.delete(key);
  }

  async invalidateByTag(tag: string): Promise<void> {
    // Memory cache doesn't support tags, so we'll just skip this
  }

  async mset(operations: Array<{ key: string; value: any; options?: any }>): Promise<void> {
    for (const op of operations) {
      await this.set(op.key, op.value, op.options?.ttl);
    }
  }

  async getStats(): Promise<{ size: number }> {
    return { size: this.cache.size };
  }
}

// Singleton instance
let memoryCache: MemoryCache | null = null;

export function getMemoryCache(): MemoryCache {
  if (!memoryCache) {
    memoryCache = new MemoryCache();
  }
  return memoryCache;
}