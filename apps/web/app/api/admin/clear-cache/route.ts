import { getCacheService } from '@repo/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

// Simple admin authentication - in production, use proper auth
const ADMIN_SECRET = env.ADMIN_SECRET || 'default-admin-secret';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    const body = await request.json();
    const { type = 'all' } = body;

    const cache = getCacheService();

    // Clear cache based on type
    switch (type) {
      case 'products':
        await cache.invalidateAllProducts();
        break;
      case 'search':
        await cache.invalidateSearchResults();
        break;
      default:
        // Clear all product-related caches
        await Promise.all([
          cache.invalidateAllProducts(),
          cache.invalidateSearchResults(),
        ]);
        break;
    }

    return NextResponse.json(
      {
        success: true,
        message: `Cleared ${type} cache`,
        type,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Also support GET for easy testing
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    message: 'Cache clear endpoint ready',
    usage:
      'POST /api/admin/clear-cache with { type: "all" | "products" | "search" }',
  });
}
