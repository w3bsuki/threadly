import { database } from '@repo/database';
import type { Prisma } from '@repo/database';
import { generalApiLimit, checkRateLimit } from '@repo/security';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

// Input validation schema
const GetProductsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  category: z.string().optional(),
  sortBy: z.enum(['newest', 'price-low', 'price-high', 'popular']).default('newest'),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error?.message || 'Rate limit exceeded' },
        { 
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      category: searchParams.get('category') || undefined,
      sortBy: (searchParams.get('sortBy') || 'newest') as 'newest' | 'price-low' | 'price-high' | 'popular',
      search: searchParams.get('search') || undefined,
    };

    const validatedParams = GetProductsSchema.parse(queryParams);

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      status: 'AVAILABLE',
    };

    // Add category filter if specified
    if (validatedParams.category && validatedParams.category !== 'All') {
      where.OR = [
        {
          category: {
            name: { equals: validatedParams.category, mode: 'insensitive' }
          }
        },
        {
          category: {
            parent: {
              name: { equals: validatedParams.category, mode: 'insensitive' }
            }
          }
        }
      ];
    }

    // Add search filter if specified
    if (validatedParams.search) {
      const searchTerm = validatedParams.search.toLowerCase();
      const searchFilter: Prisma.ProductWhereInput = {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { brand: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { category: { name: { contains: searchTerm, mode: 'insensitive' } } }
        ]
      };
      
      if (where.AND) {
        where.AND = Array.isArray(where.AND) ? [...where.AND, searchFilter] : [where.AND, searchFilter];
      } else {
        where.AND = searchFilter;
      }
    }

    // Build orderBy clause
    let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[];
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
          { createdAt: 'desc' }
        ];
        break;
      case 'newest':
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
          category: {
            include: {
              parent: true,
            },
          },
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
      database.product.count({ where })
    ]);

    // Transform products to match the expected format
    const transformedProducts = products.map((product) => ({
      id: product.id,
      title: product.title,
      brand: product.brand || 'Unknown',
      price: product.price,
      originalPrice: null, // We don't have this in our schema
      size: product.size || 'One Size',
      condition: product.condition,
      categoryId: product.categoryId,
      categoryName: product.category?.name || 'Unknown',
      parentCategoryName: product.category?.parent?.name || 'Unisex',
      images: product.images.map(img => img.imageUrl),
      seller: product.seller ? {
        id: product.seller.id,
        name: `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() || 'Anonymous',
        location: product.seller.location || 'Unknown',
        rating: product.seller.averageRating || 0,
      } : {
        id: 'unknown',
        name: 'Anonymous',
        location: 'Unknown',
        rating: 0,
      },
      favoritesCount: product._count.favorites,
      createdAt: product.createdAt,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / validatedParams.limit);
    const hasNextPage = validatedParams.page < totalPages;
    const hasPreviousPage = validatedParams.page > 1;

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      }
    });

  } catch (error) {
    logError('Failed to fetch products:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}