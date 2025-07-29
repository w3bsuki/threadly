import { auth } from '@clerk/nextjs/server';
import {
  createErrorResponse,
  createPaginationMeta,
  createSuccessResponse,
} from '@repo/utils';
import { getCacheService } from '@repo/database';
import type { Prisma } from '@repo/database';
import { database } from '@repo/database';
import { checkRateLimit, generalApiLimit } from '@repo/security';
import { z } from '@repo/validation';
import type { NextRequest } from 'next/server';

// Input validation schema
const GetProductsSchema = z.object({
  page: z
    .string()
    .transform((val) => Number.parseInt(val, 10) || 1)
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .transform((val) => Number.parseInt(val, 10) || 20)
    .pipe(z.number().min(1).max(50)),
  category: z.string().optional(),
  sortBy: z
    .enum(['newest', 'price-low', 'price-high', 'popular'])
    .default('newest'),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), { status: 401 });
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        new Error(rateLimitResult.error?.message || 'Rate limit exceeded'),
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Parse and validate search parameters
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const validatedParams = GetProductsSchema.parse(params);

    // Create cache key from parameters
    const cacheKey = `products:${JSON.stringify(validatedParams)}`;
    const cache = getCacheService();

    // Try to get from cache first
    const cachedResult = await cache.remember(
      cacheKey,
      async () => {
        // Build where clause
        const where: Prisma.ProductWhereInput = {
          status: 'AVAILABLE',
        };

        // Add category filter if specified
        if (validatedParams.category && validatedParams.category !== 'All') {
          where.category = {
            name: { equals: validatedParams.category, mode: 'insensitive' },
          };
        }

        // Add search filter if specified
        if (validatedParams.search) {
          const searchTerm = validatedParams.search.toLowerCase();
          const searchFilter: Prisma.ProductWhereInput = {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { brand: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
              {
                category: {
                  name: { contains: searchTerm, mode: 'insensitive' },
                },
              },
            ],
          };

          if (where.AND) {
            where.AND = Array.isArray(where.AND)
              ? [...where.AND, searchFilter]
              : [where.AND, searchFilter];
          } else {
            where.AND = searchFilter;
          }
        }

        // Build orderBy clause
        let orderBy:
          | Prisma.ProductOrderByWithRelationInput
          | Prisma.ProductOrderByWithRelationInput[];
        switch (validatedParams.sortBy) {
          case 'price-low':
            orderBy = { price: 'asc' };
            break;
          case 'price-high':
            orderBy = { price: 'desc' };
            break;
          case 'popular':
            orderBy = [
              { favorites: { _count: 'desc' } },
              { views: 'desc' },
              { createdAt: 'desc' },
            ];
            break;
          default:
            orderBy = { createdAt: 'desc' };
            break;
        }

        // Calculate pagination
        const skip = (validatedParams.page - 1) * validatedParams.limit;

        // Fetch products and total count in parallel
        const [products, totalCount] = await Promise.all([
          database.product.findMany({
            where,
            include: {
              images: {
                orderBy: { displayOrder: 'asc' },
                take: 1,
              },
              category: true,
              seller: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                  location: true,
                  averageRating: true,
                },
              },
              _count: {
                select: {
                  favorites: true,
                },
              },
            },
            orderBy,
            skip,
            take: validatedParams.limit,
          }),
          database.product.count({ where }),
        ]);

        // Transform products to match the expected format
        const transformedProducts = products.map((product) => ({
          id: product.id,
          title: product.title,
          brand: product.brand || 'Unknown',
          price: product.price.toNumber(),
          originalPrice: null, // We don't have this in our schema
          size: product.size || 'One Size',
          condition: product.condition,
          categoryId: product.categoryId,
          categoryName: product.category?.name || 'Unknown',
          parentCategoryName: 'Unisex',
          images: product.images.map((img) => img.imageUrl),
          seller: product.seller
            ? {
                id: product.seller.id,
                name:
                  `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() ||
                  'Anonymous',
                location: product.seller.location || 'Unknown',
                rating: Number(product.seller.averageRating) || 0,
              }
            : {
                id: 'unknown',
                name: 'Anonymous',
                location: 'Unknown',
                rating: 0,
              },
          favoritesCount: product._count.favorites,
          createdAt: product.createdAt.toISOString(),
        }));

        return {
          products: transformedProducts,
          totalCount,
          pagination: createPaginationMeta(
            validatedParams.page,
            validatedParams.limit,
            totalCount
          ),
        };
      },
      300, // 5 minutes cache
      ['products', 'categories']
    );

    // Return standardized success response
    return createSuccessResponse(cachedResult.products, {
      pagination: cachedResult.pagination,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
