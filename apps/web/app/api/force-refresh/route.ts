import { NextRequest, NextResponse } from 'next/server';
import { getCacheService } from '@repo/cache';
import { revalidatePath } from 'next/cache';

// This endpoint forces a cache refresh - useful for debugging
export async function GET(request: NextRequest) {
  try {
    const cache = getCacheService({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    
    // Clear all product caches
    await cache.invalidateAllProducts();
    
    // Also revalidate Next.js cache
    revalidatePath('/', 'layout');
    
    const cacheType = cache.getCacheType();
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared and pages revalidated',
      cacheType,
      timestamp: new Date().toISOString(),
      note: cacheType === 'memory' ? 
        'WARNING: Using memory cache. This only clears THIS instance!' : 
        'Redis cache cleared successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clear cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support POST
export async function POST(request: NextRequest) {
  return GET(request);
}