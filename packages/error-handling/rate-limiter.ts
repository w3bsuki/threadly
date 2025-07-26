interface RateLimiterConfig {
  requests: number;
  window: string; // e.g., '1m', '1h', '1d'
}

interface RateLimiterStore {
  increment(key: string, window: number): Promise<number>;
  reset(key: string): Promise<void>;
}

// In-memory store for development
class MemoryRateLimiterStore implements RateLimiterStore {
  private store = new Map<string, { count: number; resetAt: number }>();
  
  async increment(key: string, window: number): Promise<number> {
    const now = Date.now();
    const existing = this.store.get(key);
    
    if (!existing || existing.resetAt <= now) {
      this.store.set(key, { count: 1, resetAt: now + window });
      return 1;
    }
    
    existing.count++;
    return existing.count;
  }
  
  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
  
  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.resetAt <= now) {
        this.store.delete(key);
      }
    }
  }
}

// Parse window string to milliseconds
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid window format: ${window}`);
  }
  
  const [, value, unit] = match;
  const num = parseInt(value!, 10);
  
  switch (unit) {
    case 's': return num * 1000;
    case 'm': return num * 60 * 1000;
    case 'h': return num * 60 * 60 * 1000;
    case 'd': return num * 24 * 60 * 60 * 1000;
    default: throw new Error(`Invalid time unit: ${unit}`);
  }
}

export class RateLimiter {
  private store: RateLimiterStore;
  private requests: number;
  private window: number;
  
  constructor(config: RateLimiterConfig, store?: RateLimiterStore) {
    this.requests = config.requests;
    this.window = parseWindow(config.window);
    this.store = store || new MemoryRateLimiterStore();
  }
  
  async check(identifier: string): Promise<boolean> {
    const key = `rate_limit:${identifier}`;
    const count = await this.store.increment(key, this.window);
    return count <= this.requests;
  }
  
  async reset(identifier: string): Promise<void> {
    const key = `rate_limit:${identifier}`;
    await this.store.reset(key);
  }
  
  async remaining(identifier: string): Promise<number> {
    const key = `rate_limit:${identifier}`;
    const count = await this.store.increment(key, this.window);
    return Math.max(0, this.requests - count);
  }
}

// Factory function
export function createRateLimiter(config: RateLimiterConfig): RateLimiter {
  return new RateLimiter(config);
}

// Middleware for rate limiting
export function withRateLimit(
  config: RateLimiterConfig
): (handler: Function) => Function {
  const limiter = createRateLimiter(config);
  
  return (handler: Function) => {
    return async (request: Request, ...args: any[]) => {
      const identifier = 
        request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'anonymous';
      
      const allowed = await limiter.check(identifier);
      if (!allowed) {
        return new Response('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': config.requests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + parseWindow(config.window)).toISOString(),
          },
        });
      }
      
      const remaining = await limiter.remaining(identifier);
      const response = await handler(request, ...args);
      
      // Add rate limit headers
      if (response instanceof Response) {
        response.headers.set('X-RateLimit-Limit', config.requests.toString());
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        response.headers.set('X-RateLimit-Reset', new Date(Date.now() + parseWindow(config.window)).toISOString());
      }
      
      return response;
    };
  };
}