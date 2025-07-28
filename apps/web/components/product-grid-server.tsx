import { getCacheService } from '@repo/cache';
import type { Prisma, Product, ProductImage } from '@repo/database';
import { database } from '@repo/database';
import { logError, parseError } from '@repo/observability/server';
import { ProductGridClient } from './product-grid-client';

// Define ProductStatus enum values
const ProductStatus = {
  AVAILABLE: 'AVAILABLE',
  SOLD: 'SOLD',
  RESERVED: 'RESERVED',
  REMOVED: 'REMOVED',
} as const;

// Type for our transformed product data
interface TransformedProduct {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  size: string;
  condition: string;
  category: string;
  gender: string;
  images: string[];
  seller: {
    id: string;
    name: string;
    location: string;
    rating: number;
  };
  isLiked: boolean;
  isDesigner: boolean;
  uploadedAgo: string;
  _count?: {
    favorites: number;
  };
}

// Get time ago string
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }
  if (diffDays === 1) {
    return '1 day ago';
  }
  return `${diffDays} days ago`;
}

// Transform database product to UI format
function transformProduct(
  product: Product & {
    images: ProductImage[];
    seller: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      location: string | null;
      averageRating: number | null;
    };
    category: {
      name: string;
      slug: string;
    } | null;
    _count?: {
      favorites: number;
    };
  }
): TransformedProduct {
  return {
    id: product.id,
    title: product.title,
    brand: product.brand || 'Unknown',
    price: Number(product.price),
    originalPrice: undefined, // Not in our schema yet
    size: product.size || 'One Size',
    condition: product.condition,
    category: product.category?.name || 'Other',
    gender: 'unisex', // We don't have gender in the schema, default to unisex
    images: product.images
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((img) => img.imageUrl),
    seller: {
      id: product.seller.id,
      name: `${product.seller.firstName} ${product.seller.lastName || ''}`.trim(),
      location: product.seller.location || 'Unknown',
      rating: product.seller.averageRating || 4.5,
    },
    isLiked: false, // This would come from user's favorites
    isDesigner: product.brand
      ? [
          'GUCCI',
          'PRADA',
          'CHANEL',
          'LOUIS VUITTON',
          'VERSACE',
          'DIOR',
          'BALENCIAGA',
          'HERMÈS',
          'SAINT LAURENT',
          'BOTTEGA VENETA',
          'OFF-WHITE',
          'BURBERRY',
          'FENDI',
          'GIVENCHY',
          'VALENTINO',
        ].some((brand) => product.brand?.toUpperCase().includes(brand))
      : false,
    uploadedAgo: getTimeAgo(new Date(product.createdAt)),
    _count: product._count || { favorites: 0 },
  };
}

interface ProductGridServerProps {
  category?: string;
  limit?: number;
  sort?: string;
  brand?: string;
  condition?: string;
}

export async function ProductGridServer({
  category,
  limit = 24,
  sort,
  brand,
  condition,
}: ProductGridServerProps) {
  // Fetching products with filters

  try {
    const cache = getCacheService({
      url:
        process.env.UPSTASH_REDIS_REST_URL ||
        process.env.REDIS_URL ||
        'redis://localhost:6379',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
    });

    // Build the where clause based on filters
    const whereClause: Prisma.ProductWhereInput = {
      status: ProductStatus.AVAILABLE,
      ...(category && { category: { slug: category } }),
      ...(brand && { brand: { contains: brand, mode: 'insensitive' } }),
      ...(condition && { condition }),
    };

    // Add sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = {
      createdAt: 'desc',
    }; // default newest
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'popular') {
      orderBy = { views: 'desc' };
    }

    // Create cache key based on filters
    const cacheKey = `products:${category || 'all'}:${brand || 'all'}:${condition || 'all'}:${sort || 'newest'}:${limit}`;

    // Try to get from cache first
    const cachedProducts = await cache.get(cacheKey);

    let products;
    if (cachedProducts && Array.isArray(cachedProducts)) {
      products = cachedProducts;
    } else {
      // Fetch from database if not in cache
      products = await database.product.findMany({
        where: whereClause,
        include: {
          images: { orderBy: { displayOrder: 'asc' }, take: 1 },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              location: true,
              averageRating: true,
            },
          },
          category: { select: { name: true, slug: true } },
          _count: { select: { favorites: true } },
        },
        orderBy,
        take: limit,
      });

      // Cache the results for 5 minutes
      await cache.set(cacheKey, products, 300);
    }

    // Query completed successfully

    // Transform products for the UI
    const transformedProducts = products.map(transformProduct);

    // Simplified filter options
    const filterOptions = {
      categories: [],
      brands: [],
      sizes: [],
      totalCount: products.length,
    };

    return (
      <ProductGridClient
        defaultCategory={category}
        filterOptions={filterOptions}
        initialProducts={transformedProducts}
      />
    );
  } catch (error) {
    const errorMessage = parseError(error);
    logError('Failed to fetch products', error);

    // Return empty state on error with more details in development
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <h2 className="mb-4 font-semibold text-2xl text-foreground">
          Unable to load products
        </h2>
        <p className="mb-8 text-muted-foreground">
          We're having trouble loading products right now. Please try again
          later.
        </p>
        <p className="mb-4 text-red-600 text-sm">Error: {errorMessage}</p>
        <a
          className="inline-flex items-center rounded-[var(--radius-md)] border border-transparent bg-foreground px-6 py-3 font-medium text-background text-base shadow-sm hover:bg-secondary-foreground"
          href="/"
        >
          Refresh page
        </a>
      </div>
    );
  }
}
