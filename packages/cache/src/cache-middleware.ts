import { type NextRequest, NextResponse } from 'next/server';
import { getCacheService } from './cache-service';

/**
 * Next.js middleware helper for cache headers
 * Adds appropriate cache headers based on route patterns
 */

interface CacheConfig {
  public?: boolean;
  maxAge?: number;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
  mustRevalidate?: boolean;
}

// Default cache configurations for different route types
export const CACHE_CONFIGS = {
  // Static assets - long cache
  STATIC: {
    public: true,
    maxAge: 31_536_000, // 1 year
    sMaxAge: 31_536_000,
  },

  // API routes - short cache with stale-while-revalidate
  API: {
    public: true,
    sMaxAge: 60, // 1 minute
    staleWhileRevalidate: 300, // 5 minutes
  },

  // Product pages - medium cache
  PRODUCT: {
    public: true,
    sMaxAge: 300, // 5 minutes
    staleWhileRevalidate: 3600, // 1 hour
  },

  // Category pages - longer cache
  CATEGORY: {
    public: true,
    sMaxAge: 3600, // 1 hour
    staleWhileRevalidate: 86_400, // 1 day
  },

  // User-specific content - no cache
  PRIVATE: {
    public: false,
    maxAge: 0,
    mustRevalidate: true,
  },

  // Search results - very short cache
  SEARCH: {
    public: true,
    sMaxAge: 30, // 30 seconds
    staleWhileRevalidate: 60, // 1 minute
  },
} as const;

/**
 * Build cache control header from config
 */
export function buildCacheHeader(config: CacheConfig): string {
  const parts: string[] = [];

  if (config.public) {
    parts.push('public');
  } else {
    parts.push('private');
  }

  if (config.maxAge !== undefined) {
    parts.push(`max-age=${config.maxAge}`);
  }

  if (config.sMaxAge !== undefined) {
    parts.push(`s-maxage=${config.sMaxAge}`);
  }

  if (config.staleWhileRevalidate !== undefined) {
    parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }

  if (config.mustRevalidate) {
    parts.push('must-revalidate');
  }

  return parts.join(', ');
}

/**
 * Apply cache headers to response
 */
export function setCacheHeaders(
  response: NextResponse,
  config: CacheConfig
): NextResponse {
  response.headers.set('Cache-Control', buildCacheHeader(config));
  return response;
}

/**
 * Get cache config based on request path
 */
export function getCacheConfigForPath(pathname: string): CacheConfig {
  // Static assets
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    return CACHE_CONFIGS.STATIC;
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    // Private API routes
    if (pathname.match(/\/(user|profile|orders|messages|favorites)/)) {
      return CACHE_CONFIGS.PRIVATE;
    }

    // Search API
    if (pathname.includes('/search')) {
      return CACHE_CONFIGS.SEARCH;
    }

    // Categories API
    if (pathname.includes('/categories')) {
      return CACHE_CONFIGS.CATEGORY;
    }

    // Default API cache
    return CACHE_CONFIGS.API;
  }

  // Product pages
  if (pathname.match(/^\/product\/[a-zA-Z0-9]+$/)) {
    return CACHE_CONFIGS.PRODUCT;
  }

  // Category pages
  if (pathname.match(/^\/(men|women|kids|unisex|products)/)) {
    return CACHE_CONFIGS.CATEGORY;
  }

  // Search pages
  if (pathname.startsWith('/search')) {
    return CACHE_CONFIGS.SEARCH;
  }

  // User-specific pages
  if (pathname.match(/^\/(profile|orders|messages|favorites|cart|checkout)/)) {
    return CACHE_CONFIGS.PRIVATE;
  }

  // Default - no cache
  return CACHE_CONFIGS.PRIVATE;
}

/**
 * Cache middleware for Next.js
 * Automatically adds appropriate cache headers based on route
 */
export function cacheMiddleware(request: NextRequest): NextResponse | void {
  const pathname = request.nextUrl.pathname;

  // Skip cache headers for Next.js internals
  if (pathname.startsWith('/_next/')) {
    return;
  }

  // Get cache config for this path
  const cacheConfig = getCacheConfigForPath(pathname);

  // Create response and add headers
  const response = NextResponse.next();
  setCacheHeaders(response, cacheConfig);

  // Add additional performance headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

/**
 * Edge cache utility for Vercel/Cloudflare
 * Implements cache tags for granular invalidation
 */
export class EdgeCache {
  private cache: any;

  constructor() {
    // Initialize based on environment
    if (typeof globalThis !== 'undefined' && 'caches' in globalThis) {
      this.cache = (globalThis as any).caches;
    }
  }

  async get(key: string): Promise<Response | null> {
    if (!this.cache) return null;

    try {
      const cache = await this.cache.open('edge-cache');
      const response = await cache.match(key);
      return response || null;
    } catch {
      return null;
    }
  }

  async set(key: string, response: Response, ttl?: number): Promise<void> {
    if (!this.cache) return;

    try {
      const cache = await this.cache.open('edge-cache');

      // Clone response to add cache headers
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);

      if (ttl) {
        headers.set('Cache-Control', `max-age=${ttl}`);
      }

      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers,
      });

      await cache.put(key, cachedResponse);
    } catch (error) {}
  }

  async delete(key: string): Promise<void> {
    if (!this.cache) return;

    try {
      const cache = await this.cache.open('edge-cache');
      await cache.delete(key);
    } catch (error) {}
  }
}

// Export singleton instance
export const edgeCache = new EdgeCache();
