# Performance Optimization

## ⚡ Next-Forge Performance Philosophy

Next-Forge applications prioritize performance as a core feature, not an afterthought. The optimization strategy focuses on Core Web Vitals, user-perceived performance, and scalable architecture patterns that maintain speed as applications grow.

## 📊 Performance Targets

### Core Web Vitals Thresholds

```typescript
interface PerformanceTargets {
  LCP: number; // Largest Contentful Paint < 2.5s
  FID: number; // First Input Delay < 100ms  
  CLS: number; // Cumulative Layout Shift < 0.1
  FCP: number; // First Contentful Paint < 1.8s
  TTI: number; // Time to Interactive < 3.8s
  TTFB: number; // Time to First Byte < 600ms
}

const PERFORMANCE_TARGETS: PerformanceTargets = {
  LCP: 2500,  // milliseconds
  FID: 100,   // milliseconds
  CLS: 0.1,   // score
  FCP: 1800,  // milliseconds
  TTI: 3800,  // milliseconds  
  TTFB: 600,  // milliseconds
};
```

### Performance Budget

```json
{
  "performance_budget": {
    "javascript": {
      "initial": "200KB",
      "route_based": "50KB"
    },
    "css": {
      "critical": "30KB",
      "total": "100KB"
    },
    "images": {
      "hero": "200KB",
      "product": "100KB",
      "thumbnail": "20KB"
    },
    "fonts": {
      "total": "100KB",
      "critical": "30KB"
    },
    "requests": {
      "initial_load": 20,
      "route_change": 5
    }
  }
}
```

## 🏗️ Next.js 15 Performance Optimizations

### App Router Performance Patterns

```typescript
// app/products/page.tsx - Optimized server component
import { Suspense } from 'react';
import { ProductGrid } from './components/product-grid';
import { ProductFilters } from './components/product-filters';
import { ProductGridSkeleton } from './components/product-grid-skeleton';

// Server component with streaming
export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filters render immediately */}
      <aside className="lg:col-span-1">
        <ProductFilters />
      </aside>
      
      {/* Products stream in with loading UI */}
      <main className="lg:col-span-3">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

// Separate component for data fetching
async function ProductGrid({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await searchParams;
  
  // Optimized database query with caching
  const products = await getProducts({
    page: Number(params.page) || 1,
    category: params.category as string,
    sort: params.sort as string,
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Streaming and Partial Prerendering

```typescript
// app/product/[id]/page.tsx - Streaming with partial prerendering
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ProductImages } from './components/product-images';
import { ProductDetails } from './components/product-details';
import { ProductReviews } from './components/product-reviews';
import { RelatedProducts } from './components/related-products';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  // Critical data fetched immediately
  const product = await getProduct(id);
  
  if (!product) {
    notFound();
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images - critical, load immediately */}
        <ProductImages product={product} />
        
        {/* Details - critical, load immediately */}
        <ProductDetails product={product} />
      </div>
      
      {/* Non-critical content streams in */}
      <div className="mt-12 space-y-8">
        <Suspense fallback={<ReviewsSkeleton />}>
          <ProductReviews productId={id} />
        </Suspense>
        
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProducts productId={id} />
        </Suspense>
      </div>
    </div>
  );
}

// Optimized metadata generation
export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) return {};
  
  return {
    title: `${product.title} - Threadly`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.title,
      description: product.description,
      images: [
        {
          url: product.images[0]?.imageUrl || '/default-product.jpg',
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
  };
}
```

## 🎯 Database Performance Optimization

### Query Optimization Patterns

```typescript
// lib/queries/products.ts - Optimized database queries
import { database } from '@repo/database';
import { getCacheService } from '@repo/cache';
import type { Prisma } from '@prisma/client';

const cache = getCacheService();

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

export async function getProducts(filters: ProductFilters = {}) {
  const cacheKey = `products:${JSON.stringify(filters)}`;
  
  return await cache.remember(
    cacheKey,
    async () => {
      const {
        category,
        minPrice,
        maxPrice,
        sort = 'newest',
        page = 1,
        limit = 20,
      } = filters;
      
      // Build optimized where clause
      const where: Prisma.ProductWhereInput = {
        status: 'AVAILABLE',
        ...(category && { categoryId: category }),
        ...(minPrice && { price: { gte: minPrice } }),
        ...(maxPrice && { price: { lte: maxPrice } }),
      };
      
      // Optimize orderBy for database indexes
      const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
        switch (sort) {
          case 'price-asc':
            return { price: 'asc' };
          case 'price-desc':
            return { price: 'desc' };
          case 'popular':
            return { views: 'desc' };
          default:
            return { createdAt: 'desc' };
        }
      })();
      
      const skip = (page - 1) * limit;
      
      // Use parallel queries for better performance
      const [products, totalCount] = await Promise.all([
        database.product.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          // Optimize relations - only fetch what's needed
          include: {
            images: {
              select: {
                imageUrl: true,
                altText: true,
              },
              orderBy: { displayOrder: 'asc' },
              take: 1, // Only first image for listing
            },
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                favorites: true,
              },
            },
          },
        }),
        database.product.count({ where }),
      ]);
      
      return {
        products,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1,
        },
      };
    },
    300 // Cache for 5 minutes
  );
}

// Optimized single product query
export async function getProduct(id: string) {
  const cacheKey = `product:${id}`;
  
  return await cache.remember(
    cacheKey,
    async () => {
      const product = await database.product.findUnique({
        where: { id },
        include: {
          images: {
            orderBy: { displayOrder: 'asc' },
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              createdAt: true,
              _count: {
                select: {
                  products: true,
                  reviews: true,
                },
              },
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              favorites: true,
              views: true,
            },
          },
        },
      });
      
      // Increment view count asynchronously (don't block response)
      if (product) {
        setImmediate(async () => {
          await database.product.update({
            where: { id },
            data: { views: { increment: 1 } },
          });
          
          // Invalidate cache after view increment
          await cache.invalidate(cacheKey);
        });
      }
      
      return product;
    },
    600 // Cache for 10 minutes
  );
}
```

### Database Index Optimization

```sql
-- Database indexes for optimal query performance
-- Apply these in your database migration

-- Compound index for product filtering and sorting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_status_category_created 
ON products(status, category_id, created_at DESC)
WHERE status = 'AVAILABLE';

-- Price range queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price_range 
ON products(price, status) 
WHERE status = 'AVAILABLE';

-- Full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search 
ON products USING GIN(to_tsvector('english', title || ' ' || description))
WHERE status = 'AVAILABLE';

-- User orders for dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status_date 
ON orders(user_id, status, created_at DESC);

-- Seller products for dashboard
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_seller_status 
ON products(seller_id, status, created_at DESC);

-- Favorites for personalization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_created 
ON favorites(user_id, created_at DESC);

-- Messages for real-time chat
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

-- Update table statistics for query planner
ANALYZE products;
ANALYZE orders;
ANALYZE users;
ANALYZE favorites;
ANALYZE messages;
```

## 🖼️ Image Optimization

### Next.js Image Component Optimization

```typescript
// components/optimized-product-image.tsx
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@repo/design-system/lib/utils';

interface OptimizedProductImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export function OptimizedProductImage({
  src,
  alt,
  priority = false,
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: OptimizedProductImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  return (
    <div className="relative overflow-hidden bg-gray-100 rounded-lg">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          'object-cover transition-all duration-300',
          isLoading ? 'scale-110 blur-sm' : 'scale-100 blur-0',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        // Optimization attributes
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
      
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-400 text-sm">Failed to load image</div>
        </div>
      )}
    </div>
  );
}
```

### Image Processing Pipeline

```typescript
// lib/image-optimization.ts
export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
}

export function generateOptimizedImageUrl(
  originalUrl: string,
  options: ImageProcessingOptions = {}
): string {
  const {
    width,
    height,
    quality = 85,
    format = 'webp',
    fit = 'cover',
  } = options;
  
  // Use Vercel's image optimization
  const params = new URLSearchParams();
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  params.set('fm', format);
  params.set('fit', fit);
  
  return `/_next/image?url=${encodeURIComponent(originalUrl)}&${params.toString()}`;
}

// Responsive image sizes for different components
export const IMAGE_SIZES = {
  product: {
    thumbnail: { width: 200, height: 200 },
    card: { width: 400, height: 400 },
    hero: { width: 800, height: 800 },
    gallery: { width: 1200, height: 1200 },
  },
  avatar: {
    small: { width: 32, height: 32 },
    medium: { width: 64, height: 64 },
    large: { width: 128, height: 128 },
  },
  banner: {
    mobile: { width: 768, height: 300 },
    desktop: { width: 1920, height: 600 },
  },
} as const;
```

## 🚀 Code Splitting and Bundle Optimization

### Route-Based Code Splitting

```typescript
// lib/dynamic-imports.ts
import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

// Heavy components loaded on demand
export const ProductImageGallery = dynamic(
  () => import('../components/product/product-image-gallery').then(
    mod => ({ default: mod.ProductImageGallery })
  ),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />,
    ssr: false, // Client-side only for interactive gallery
  }
);

export const CheckoutForm = dynamic(
  () => import('../components/checkout/checkout-form').then(
    mod => ({ default: mod.CheckoutForm })
  ),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />,
  }
);

export const AdminDashboard = dynamic(
  () => import('../components/admin/admin-dashboard'),
  {
    loading: () => <div>Loading admin dashboard...</div>,
    ssr: false,
  }
);

// Analytics components (non-critical)
export const AnalyticsProvider = dynamic(
  () => import('../providers/analytics-provider'),
  {
    ssr: false,
  }
);

// Chart components (heavy libraries)
export const SalesChart = dynamic(
  () => import('../components/charts/sales-chart'),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />,
    ssr: false,
  }
);
```

### Webpack Bundle Analysis

```javascript
// next.config.ts - Bundle analyzer configuration
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    // Bundle analyzer in production
    if (!dev && !isServer && process.env.ANALYZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: '../bundle-analysis.html',
        })
      );
    }
    
    // Optimize bundle splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: 10,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
        // Separate chunk for large libraries
        stripe: {
          name: 'stripe',
          test: /[\\/]node_modules[\\/]@stripe[\\/]/,
          chunks: 'all',
          priority: 20,
        },
        clerk: {
          name: 'clerk',
          test: /[\\/]node_modules[\\/]@clerk[\\/]/,
          chunks: 'all',
          priority: 20,
        },
      },
    };
    
    return config;
  },
};
```

## 🧠 Caching Strategies

### Multi-Layer Caching

```typescript
// lib/cache/multi-layer-cache.ts
import { getCacheService } from '@repo/cache';
import { LRUCache } from 'lru-cache';

interface CacheLayer {
  name: string;
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
}

class MemoryCache implements CacheLayer {
  name = 'memory';
  private cache = new LRUCache<string, any>({ 
    max: 1000,
    maxAge: 1000 * 60 * 5, // 5 minutes
  });
  
  async get<T>(key: string): Promise<T | null> {
    return this.cache.get(key) || null;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.cache.set(key, value, ttl ? { ttl: ttl * 1000 } : undefined);
  }
  
  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

class RedisCache implements CacheLayer {
  name = 'redis';
  private redis = getCacheService();
  
  async get<T>(key: string): Promise<T | null> {
    return await this.redis.get(key);
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.redis.set(key, value, ttl);
  }
  
  async invalidate(key: string): Promise<void> {
    await this.redis.delete(key);
  }
}

export class MultiLayerCache {
  private layers: CacheLayer[] = [
    new MemoryCache(),
    new RedisCache(),
  ];
  
  async get<T>(key: string): Promise<T | null> {
    for (const layer of this.layers) {
      const value = await layer.get<T>(key);
      if (value !== null) {
        // Backfill previous layers
        await this.backfill(key, value, layer);
        return value;
      }
    }
    return null;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await Promise.all(
      this.layers.map(layer => layer.set(key, value, ttl))
    );
  }
  
  async invalidate(key: string): Promise<void> {
    await Promise.all(
      this.layers.map(layer => layer.invalidate(key))
    );
  }
  
  private async backfill<T>(key: string, value: T, fromLayer: CacheLayer): Promise<void> {
    const fromIndex = this.layers.indexOf(fromLayer);
    const layersToBackfill = this.layers.slice(0, fromIndex);
    
    await Promise.all(
      layersToBackfill.map(layer => layer.set(key, value))
    );
  }
}

// Usage in queries
const cache = new MultiLayerCache();

export async function getCachedProducts(filters: ProductFilters) {
  const cacheKey = `products:${JSON.stringify(filters)}`;
  
  let products = await cache.get<ProductsResponse>(cacheKey);
  
  if (!products) {
    products = await fetchProductsFromDatabase(filters);
    await cache.set(cacheKey, products, 300); // 5 minutes
  }
  
  return products;
}
```

### Cache Invalidation Patterns

```typescript
// lib/cache/invalidation.ts
import { getCacheService } from '@repo/cache';

interface CacheInvalidationEvent {
  type: 'create' | 'update' | 'delete';
  entity: 'product' | 'user' | 'order' | 'category';
  id: string;
  relatedIds?: string[];
}

export class CacheInvalidationManager {
  private cache = getCacheService();
  
  async invalidateEntity(event: CacheInvalidationEvent): Promise<void> {
    const { type, entity, id, relatedIds = [] } = event;
    
    const keysToInvalidate: string[] = [];
    
    switch (entity) {
      case 'product':
        keysToInvalidate.push(
          `product:${id}`,
          'products:*', // All product listings
          `seller:${relatedIds[0]}:products`, // Seller's products
          `category:${relatedIds[1]}:products`, // Category products
        );
        break;
        
      case 'user':
        keysToInvalidate.push(
          `user:${id}`,
          `user:${id}:orders`,
          `user:${id}:favorites`,
        );
        break;
        
      case 'order':
        keysToInvalidate.push(
          `order:${id}`,
          `user:${relatedIds[0]}:orders`,
          `seller:${relatedIds[1]}:orders`,
          'analytics:*', // Analytics data
        );
        break;
        
      case 'category':
        keysToInvalidate.push(
          `category:${id}`,
          `category:${id}:products`,
          'categories:all',
        );
        break;
    }
    
    // Invalidate all matching keys
    await Promise.all(
      keysToInvalidate.map(pattern => 
        pattern.includes('*') 
          ? this.invalidateByPattern(pattern)
          : this.cache.delete(pattern)
      )
    );
  }
  
  private async invalidateByPattern(pattern: string): Promise<void> {
    const prefix = pattern.replace('*', '');
    const keys = await this.cache.keys(`${prefix}*`);
    
    if (keys.length > 0) {
      await Promise.all(keys.map(key => this.cache.delete(key)));
    }
  }
}

// Usage in API routes
const invalidationManager = new CacheInvalidationManager();

export async function updateProduct(id: string, data: ProductUpdateData) {
  const product = await database.product.update({
    where: { id },
    data,
  });
  
  // Invalidate related caches
  await invalidationManager.invalidateEntity({
    type: 'update',
    entity: 'product',
    id,
    relatedIds: [product.sellerId, product.categoryId],
  });
  
  return product;
}
```

## 📱 Client-Side Performance

### React Performance Optimization

```typescript
// components/optimized-product-list.tsx
import { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ProductCard } from './product-card';

interface OptimizedProductListProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

export const OptimizedProductList = memo<OptimizedProductListProps>(({
  products,
  onProductClick,
}) => {
  // Memoize expensive calculations
  const processedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      formattedPrice: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(product.price.toNumber()),
    }));
  }, [products]);
  
  // Memoize callbacks to prevent unnecessary re-renders
  const handleProductClick = useCallback((productId: string) => {
    onProductClick(productId);
  }, [onProductClick]);
  
  // Virtual scrolling for large lists
  const renderItem = useCallback(({ index, style }: any) => {
    const product = processedProducts[index];
    
    return (
      <div style={style}>
        <ProductCard
          product={product}
          onClick={() => handleProductClick(product.id)}
        />
      </div>
    );
  }, [processedProducts, handleProductClick]);
  
  return (
    <List
      height={600}
      itemCount={processedProducts.length}
      itemSize={300}
      overscanCount={5} // Render extra items for smooth scrolling
    >
      {renderItem}
    </List>
  );
});

OptimizedProductList.displayName = 'OptimizedProductList';
```

### Intersection Observer for Lazy Loading

```typescript
// hooks/use-intersection-observer.ts
import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = '0px',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // Don't observe if already visible and frozen
    if (freezeOnceVisible && hasBeenVisible) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementVisible = entry.isIntersecting;
        setIsVisible(isElementVisible);
        
        if (isElementVisible) {
          setHasBeenVisible(true);
        }
      },
      { threshold, rootMargin }
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [threshold, rootMargin, freezeOnceVisible, hasBeenVisible]);
  
  return { isVisible, hasBeenVisible, elementRef };
}

// Usage in components
export function LazyProductCard({ product }: { product: Product }) {
  const { isVisible, elementRef } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px', // Start loading 100px before visible
    freezeOnceVisible: true,
  });
  
  return (
    <div ref={elementRef} className="product-card">
      {isVisible ? (
        <ProductCard product={product} />
      ) : (
        <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
      )}
    </div>
  );
}
```

## ⚡ Performance Monitoring

### Web Vitals Tracking

```typescript
// lib/performance/web-vitals.ts
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';
import { sendToAnalytics } from './analytics';

interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  entries: PerformanceEntry[];
}

export function trackWebVitals() {
  function sendMetric(metric: WebVitalMetric) {
    // Send to PostHog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('web_vital', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_id: metric.id,
        metric_delta: metric.delta,
      });
    }
    
    // Send to Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }
    
    // Send to custom analytics
    sendToAnalytics('web_vital', {
      name: metric.name,
      value: metric.value,
      rating: getVitalRating(metric.name, metric.value),
      url: window.location.pathname,
      connection: getConnectionInfo(),
    });
  }
  
  getCLS(sendMetric);
  getFCP(sendMetric);
  getFID(sendMetric);
  getLCP(sendMetric);
  getTTFB(sendMetric);
}

function getVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    FID: [100, 300],
    LCP: [2500, 4000],
    TTFB: [800, 1800],
  };
  
  const [good, poor] = thresholds[name as keyof typeof thresholds] || [0, 0];
  
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

function getConnectionInfo() {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
    };
  }
  return null;
}
```

### Performance Budget Monitoring

```typescript
// scripts/performance-budget.ts
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

interface BundleSize {
  name: string;
  size: number;
  gzipped: number;
}

interface PerformanceBudget {
  javascript: { initial: number; route: number };
  css: { total: number; critical: number };
  images: { hero: number; product: number };
  requests: { initial: number; route: number };
}

const BUDGET: PerformanceBudget = {
  javascript: { initial: 200000, route: 50000 }, // bytes
  css: { total: 100000, critical: 30000 },
  images: { hero: 200000, product: 100000 },
  requests: { initial: 20, route: 5 },
};

export async function checkPerformanceBudget(): Promise<void> {
  console.log('Checking performance budget...');
  
  // Build the application
  execSync('pnpm build', { stdio: 'inherit' });
  
  // Analyze bundle sizes
  const bundleSizes = await analyzeBundleSizes();
  const violations: string[] = [];
  
  // Check JavaScript budget
  const initialJS = bundleSizes
    .filter(bundle => bundle.name.includes('main') || bundle.name.includes('vendor'))
    .reduce((total, bundle) => total + bundle.gzipped, 0);
  
  if (initialJS > BUDGET.javascript.initial) {
    violations.push(
      `Initial JavaScript: ${formatBytes(initialJS)} exceeds budget of ${formatBytes(BUDGET.javascript.initial)}`
    );
  }
  
  // Check route-level JavaScript
  const routeJS = bundleSizes
    .filter(bundle => bundle.name.includes('pages/') || bundle.name.includes('chunks/'))
    .find(bundle => bundle.gzipped > BUDGET.javascript.route);
  
  if (routeJS) {
    violations.push(
      `Route JavaScript: ${routeJS.name} (${formatBytes(routeJS.gzipped)}) exceeds budget of ${formatBytes(BUDGET.javascript.route)}`
    );
  }
  
  // Check CSS budget
  const totalCSS = bundleSizes
    .filter(bundle => bundle.name.endsWith('.css'))
    .reduce((total, bundle) => total + bundle.gzipped, 0);
  
  if (totalCSS > BUDGET.css.total) {
    violations.push(
      `Total CSS: ${formatBytes(totalCSS)} exceeds budget of ${formatBytes(BUDGET.css.total)}`
    );
  }
  
  // Report violations
  if (violations.length > 0) {
    console.error('Performance budget violations:');
    violations.forEach(violation => console.error(`- ${violation}`));
    process.exit(1);
  }
  
  console.log('✅ Performance budget check passed!');
}

async function analyzeBundleSizes(): Promise<BundleSize[]> {
  // Parse Next.js build output
  const buildStatsPath = '.next/analyze/bundle-stats.json';
  const buildStats = JSON.parse(readFileSync(buildStatsPath, 'utf8'));
  
  return buildStats.chunks.map((chunk: any) => ({
    name: chunk.name,
    size: chunk.size,
    gzipped: chunk.gzippedSize || chunk.size * 0.3, // Estimate if not available
  }));
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run budget check
if (require.main === module) {
  checkPerformanceBudget().catch(console.error);
}
```

## 🎯 Performance Best Practices Summary

### Critical Optimizations ✅

1. **Core Web Vitals**
   - LCP < 2.5s through image optimization and critical path
   - FID < 100ms with minimal JavaScript blocking
   - CLS < 0.1 with proper layout reservations

2. **Database Performance**
   - Optimized queries with proper indexes
   - Connection pooling and query batching
   - Multi-layer caching strategy

3. **Bundle Optimization**
   - Route-based code splitting
   - Tree shaking and dead code elimination
   - Performance budgets and monitoring

4. **Caching Strategy**
   - Memory + Redis multi-layer caching
   - Intelligent cache invalidation
   - CDN optimization

5. **Image Optimization**
   - Next.js Image component with proper sizing
   - Modern formats (WebP, AVIF)
   - Lazy loading and intersection observer

### Performance Checklist

- [ ] **Core Web Vitals targets met**
- [ ] **Bundle sizes within budget**
- [ ] **Database queries optimized**
- [ ] **Images properly optimized**
- [ ] **Caching strategy implemented**
- [ ] **Performance monitoring active**
- [ ] **Progressive loading implemented**
- [ ] **Critical path optimized**

This comprehensive performance optimization strategy ensures your Next-Forge application delivers exceptional user experience while maintaining scalability.