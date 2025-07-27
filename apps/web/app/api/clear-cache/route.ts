import { auth } from '@clerk/nextjs/server';
import { getCacheService } from '@repo/cache';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const cache = getCacheService({
      url:
        process.env.UPSTASH_REDIS_REST_URL ||
        process.env.REDIS_URL ||
        'redis://localhost:6379',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
    });

    // Invalidate all product-related caches
    await cache.invalidateAllProducts();

    return NextResponse.json({
      success: true,
      message: 'Product cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear cache',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
