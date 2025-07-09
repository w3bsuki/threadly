import { NextRequest, NextResponse } from 'next/server';
import { getCacheService } from '@repo/cache';
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
        { status: 401 }
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
      case 'all':
      default:
        // Clear all product-related caches
        await Promise.all([
          cache.invalidateAllProducts(),
          cache.invalidateSearchResults(),
        ]);
        break;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${type} cache`,
      type 
    });
  } catch (error) {
    console.error('Error in clear-cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

// Also support GET for easy testing
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: 'Cache clear endpoint ready',
    usage: 'POST /api/admin/clear-cache with { type: "all" | "products" | "search" }'
  });
}