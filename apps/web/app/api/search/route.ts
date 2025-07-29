import { auth } from '@clerk/nextjs/server';
import { getCacheService } from '@repo/database';
import type { Prisma } from '@repo/database';
import { database } from '@repo/database';
import { logError } from '@repo/observability/server';
import { checkRateLimit, generalApiLimit } from '@repo/security';
import { z } from '@repo/validation';
import { type NextRequest, NextResponse } from 'next/server';

const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(100)
    .refine((text) => !/<[^>]*>/.test(text), {
      message: 'HTML tags are not allowed',
    })
    .optional(),
  refresh: z.enum(['true', 'false']).optional(),
  category: z
    .string()
    .trim()
    .max(50)
    .refine((text) => !/<[^>]*>/.test(text), {
      message: 'HTML tags are not allowed',
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const validation = searchQuerySchema.safeParse({
      q: searchParams.get('q') || undefined,
      refresh: searchParams.get('refresh') || undefined,
      category: searchParams.get('category') || undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters' },
        { status: 400 }
      );
    }

    const { q: query, refresh, category } = validation.data;

    // Handle refresh requests (pull-to-refresh)
    if (refresh === 'true') {
      const whereClause: Prisma.ProductWhereInput = {
        status: 'AVAILABLE',
      };

      // Add category filter if specified
      if (category && category !== '' && category !== 'All') {
        const categoryFilter = await database.category.findFirst({
          where: {
            OR: [
              { name: { equals: category } },
              { slug: { equals: category } },
            ],
          },
        });

        if (categoryFilter) {
          whereClause.categoryId = categoryFilter.id;
        }
      }

      const refreshedProducts = await database.product.findMany({
        where: whereClause,
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          seller: { select: { id: true, firstName: true, lastName: true } },
          category: true,
          _count: { select: { favorites: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 24,
      });

      return NextResponse.json(refreshedProducts);
    }

    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    const searchTerm = query.toLowerCase().trim();
    const cache = getCacheService();

    // Create cache key for search results
    const cacheKey = `search:${searchTerm}`;

    // Use cache-aside pattern for search results
    const products = await cache.remember(
      cacheKey,
      async () => {
        // Search products by title, brand, description, and category
        return await database.product.findMany({
          where: {
            status: 'AVAILABLE',
            OR: [
              {
                title: {
                  contains: searchTerm,
                },
              },
              {
                brand: {
                  contains: searchTerm,
                },
              },
              {
                description: {
                  contains: searchTerm,
                },
              },
              {
                category: {
                  name: {
                    contains: searchTerm,
                  },
                },
              },
            ],
          },
          include: {
            images: {
              orderBy: { displayOrder: 'asc' },
              take: 1,
            },
            seller: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            category: {
              select: {
                name: true,
              },
            },
          },
          orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
          take: 50, // Limit results
        });
      },
      60, // 1 minute cache for search results
      ['products', 'search']
    );

    return NextResponse.json(products);
  } catch (error) {
    logError('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}
