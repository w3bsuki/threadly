import { database } from '@repo/database';
import { generalApiLimit, checkRateLimit } from '@repo/security';
import { NextRequest, NextResponse } from 'next/server';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

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
    const query = searchParams.get('q');
    const refresh = searchParams.get('refresh');
    const category = searchParams.get('category');

    // Handle refresh requests (pull-to-refresh)
    if (refresh === 'true') {
      const whereClause: any = {
        status: 'AVAILABLE',
      };

      // Add category filter if specified
      if (category && category !== '' && category !== 'All') {
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

      const refreshedProducts = await database.product.findMany({
        where: whereClause,
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          seller: { select: { id: true, firstName: true, lastName: true } },
          category: true,
          _count: { select: { favorites: true } }
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
    
    // Search products by title, brand, description, and category
    const products = await database.product.findMany({
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
      orderBy: [
        { views: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 50, // Limit results
    });

    return NextResponse.json(products);
  } catch (error) {
    logError('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}