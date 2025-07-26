import { getCacheService } from '@repo/cache';
import { database } from '@repo/database';
import { checkRateLimit, generalApiLimit } from '@repo/security';
import { type NextRequest, NextResponse } from 'next/server';

// Initialize cache service
const cache = getCacheService({
  url:
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.REDIS_URL ||
    'redis://localhost:6379',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
});

// GET /api/categories - List all categories with hierarchy
export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Use cache for categories as they change infrequently
    const categoriesData = await cache.remember(
      'categories:all',
      async () => {
        // Fetch categories with hierarchy
        const categories = await database.category.findMany({
          orderBy: [
            { parentId: 'asc' }, // Parent categories first
            { name: 'asc' },
          ],
          include: {
            children: {
              orderBy: { name: 'asc' },
              include: {
                _count: {
                  select: {
                    Product: {
                      where: {
                        status: 'AVAILABLE',
                      },
                    },
                  },
                },
              },
            },
            _count: {
              select: {
                Product: {
                  where: {
                    status: 'AVAILABLE',
                  },
                },
              },
            },
          },
        });

        // Organize into parent/child structure
        const rootCategories = categories.filter((cat) => !cat.parentId);

        return {
          categories: rootCategories,
          allCategories: categories, // Flat list for easy lookup
        };
      },
      3600 // Cache for 1 hour
    );

    // Add cache headers for browser caching
    const headers = new Headers();
    headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=3600'
    );

    return NextResponse.json(
      {
        success: true,
        data: categoriesData,
      },
      { headers }
    );
  } catch (_error) {
    // Log error without exposing sensitive details
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
