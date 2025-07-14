import { database, ProductStatus } from '@repo/database';
import type { Prisma } from '@repo/database';
import { ProductGridClient } from './product-grid-client';
import type { 
  Product, 
  ProductImage, 
  User,
  Category,
  Condition
} from '@repo/database';
import { parseError, logError } from '@repo/observability/server';
import { getCacheService } from '@repo/cache';

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
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

// Transform database product to UI format
function transformProduct(
  product: Product & {
    images: ProductImage[];
    seller: User;
    category: Category | null;
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
      .map(img => img.imageUrl),
    seller: {
      id: product.seller.id,
      name: `${product.seller.firstName} ${product.seller.lastName || ''}`.trim(),
      location: product.seller.location || 'Unknown',
      rating: product.seller.averageRating || 4.5,
    },
    isLiked: false, // This would come from user's favorites
    isDesigner: product.brand ? [
      'GUCCI', 'PRADA', 'CHANEL', 'LOUIS VUITTON', 'VERSACE', 
      'DIOR', 'BALENCIAGA', 'HERMÈS', 'SAINT LAURENT', 'BOTTEGA VENETA',
      'OFF-WHITE', 'BURBERRY', 'FENDI', 'GIVENCHY', 'VALENTINO'
    ].some(brand => product.brand!.toUpperCase().includes(brand)) : false,
    uploadedAgo: getTimeAgo(product.createdAt),
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
  condition
}: ProductGridServerProps) {
  // Fetching products with filters
  
  try {
    const cache = getCacheService({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || 'redis://localhost:6379',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
    });
    // Build the where clause based on category
    const whereClause: Prisma.ProductWhereInput = {
      status: ProductStatus.AVAILABLE,
    };

    // Handle special categories
    if (category === 'designer') {
      // Find products from luxury brands
      whereClause.OR = [
        { brand: { contains: 'Gucci' } },
        { brand: { contains: 'Prada' } },
        { brand: { contains: 'Chanel' } },
        { brand: { contains: 'Louis Vuitton' } },
        { brand: { contains: 'Versace' } },
        { brand: { contains: 'Dior' } },
        { brand: { contains: 'Balenciaga' } },
        { brand: { contains: 'Hermès' } },
        { brand: { contains: 'Saint Laurent' } },
        { brand: { contains: 'Bottega Veneta' } },
      ];
    } else if (category && ['men', 'women', 'kids', 'unisex'].includes(category)) {
      // Handle gender-based categories by category name
      const genderCategory = await database.category.findFirst({
        where: {
          OR: [
            { slug: { contains: category } },
            { name: { contains: category } }
          ]
        }
      });
      if (genderCategory) {
        whereClause.categoryId = genderCategory.id;
      }
    } else if (category && category !== 'all') {
      // Map category names to enum values
      // Find category by name or slug
      const categoryFilter = await database.category.findFirst({
        where: {
          OR: [
            { name: { equals: category } },
            { slug: { equals: category } }
          ]
        }
      });
      
      if (categoryFilter) {
        whereClause.categoryId = categoryFilter.id;
      }
    }

    // Add brand filter
    if (brand && brand !== 'other') {
      whereClause.brand = {
        contains: brand,
        mode: 'insensitive'
      };
    } else if (brand === 'other') {
      // Show products without popular brands
      const notFilter: Prisma.ProductWhereInput = {
        NOT: {
          OR: [
            { brand: { contains: 'nike', mode: 'insensitive' as any } },
            { brand: { contains: 'adidas', mode: 'insensitive' as any } },
            { brand: { contains: 'zara', mode: 'insensitive' as any } },
            { brand: { contains: 'h&m', mode: 'insensitive' as any } },
            { brand: { contains: 'uniqlo', mode: 'insensitive' as any } },
            { brand: { contains: 'gucci', mode: 'insensitive' as any } },
            { brand: { contains: 'prada', mode: 'insensitive' as any } },
          ]
        }
      };
      
      if (whereClause.AND) {
        whereClause.AND = Array.isArray(whereClause.AND) ? [...whereClause.AND, notFilter] : [whereClause.AND, notFilter];
      } else {
        whereClause.AND = notFilter;
      }
    }

    // Add condition filter
    if (condition) {
      whereClause.condition = condition as any; // Type assertion for condition enum
    }

    // Add sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }; // default newest
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'popular') {
      orderBy = { views: 'desc' };
    }

    // Create cache key based on filters
    const cacheKey = `products:${category || 'all'}:${brand || 'all'}:${condition || 'all'}:${sort || 'newest'}:${limit}`;
    
    // Fetch real products from database with caching
    // Executing product query
    
    const products = await cache.remember(
      cacheKey,
      async () => {
        return database.product.findMany({
          where: whereClause,
          include: {
            images: {
              orderBy: { displayOrder: 'asc' }
            },
            seller: true,
            category: true,
            _count: {
              select: { favorites: true }
            }
          },
          orderBy,
          take: limit,
        });
      },
      600, // Cache for 10 minutes
      ['products'] // Cache tags
    );
    
    // Query completed successfully

    // If no products found, fetch some general products
    let finalProducts = products;
    if (products.length === 0) {
      // No products found with filters, fetching general products
      
      finalProducts = await cache.remember(
        'products:fallback:general',
        async () => {
          return database.product.findMany({
            where: {
              status: ProductStatus.AVAILABLE,
            },
            include: {
              images: {
                orderBy: { displayOrder: 'asc' }
              },
              seller: true,
              category: true,
              _count: {
                select: { favorites: true }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 12, // Show fewer if no category matches
          });
        },
        600, // Cache for 10 minutes
        ['products'] // Cache tags
      );
      
      // Fallback query completed
    }

    // Transform products for the UI
    const transformedProducts = finalProducts.map(transformProduct);

    // Get filter options with caching
    const [categories, brands, sizes] = await Promise.all([
      cache.remember(
        'filter-options:categories',
        async () => {
          return database.category.findMany({
            select: { name: true },
            where: {
              Product: {
                some: { status: ProductStatus.AVAILABLE }
              }
            },
          });
        },
        1800, // Cache for 30 minutes
        ['categories'] // Cache tags
      ),
      cache.remember(
        'filter-options:brands',
        async () => {
          return database.product.groupBy({
            by: ['brand'],
            where: { 
              status: ProductStatus.AVAILABLE,
              brand: { not: null }
            },
            _count: true,
            orderBy: { _count: { brand: 'desc' } },
            take: 10,
          });
        },
        1800, // Cache for 30 minutes
        ['products'] // Cache tags
      ),
      cache.remember(
        'filter-options:sizes',
        async () => {
          return database.product.groupBy({
            by: ['size'],
            where: { status: ProductStatus.AVAILABLE },
            _count: true,
            orderBy: { _count: { size: 'desc' } },
            take: 10,
          });
        },
        1800, // Cache for 30 minutes
        ['products'] // Cache tags
      )
    ]);

    const filterOptions = {
      categories: categories.map((c: any) => c.name),
      brands: brands.map((b: any) => b.brand).filter(Boolean) as string[],
      sizes: sizes.map((s: any) => s.size).filter(Boolean) as string[],
      totalCount: finalProducts.length // Use the actual count from products we fetched
    };

    return (
      <ProductGridClient 
        initialProducts={transformedProducts}
        filterOptions={filterOptions}
        defaultCategory={category}
      />
    );

  } catch (error) {
    const errorMessage = parseError(error);
    logError('Failed to fetch products', error);
    
    // Return empty state on error with more details in development
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Unable to load products
        </h2>
        <p className="text-gray-600 mb-8">
          We're having trouble loading products right now. Please try again later.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-sm text-red-600 mb-4">
            Error: {errorMessage}
          </p>
        )}
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
        >
          Refresh page
        </a>
      </div>
    );
  }
}