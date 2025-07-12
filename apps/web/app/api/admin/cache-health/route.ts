import { NextRequest, NextResponse } from 'next/server';
import { getCacheService } from '@repo/cache';
import { env } from '@/env';

const ADMIN_SECRET = env.ADMIN_SECRET || 'default-admin-secret';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cache = getCacheService();
    
    // Test cache operations
    const testKey = 'health-check-test';
    const testValue = { timestamp: Date.now(), status: 'healthy' };
    
    // Test write
    await cache.set(testKey, testValue, { ttl: 60 }); // 1 minute TTL
    
    // Test read
    const retrieved = await cache.get(testKey);
    
    // Test delete
    await cache.delete(testKey);
    
    // Check if operations succeeded
    const isHealthy = retrieved && retrieved.timestamp === testValue.timestamp;
    
    // Get cache type and additional info
    const cacheType = cache.getCacheType();
    const cacheHealthy = await cache.isHealthy();
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      cache: {
        type: cacheType,
        connected: isHealthy,
        healthy: cacheHealthy,
        operations: {
          write: true,
          read: isHealthy,
          delete: true
        }
      },
      timestamp: new Date().toISOString(),
      environment: {
        hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL || !!process.env.REDIS_URL,
        hasAdminSecret: !!process.env.ADMIN_SECRET,
        redisUrl: process.env.UPSTASH_REDIS_REST_URL ? 'configured' : 'missing',
        redisToken: process.env.UPSTASH_REDIS_REST_TOKEN ? 'configured' : 'missing'
      },
      warning: cacheType === 'memory' ? 
        'Using memory cache! Products will NOT sync between deployments. Configure Redis.' : 
        null
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('Cache health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Cache health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 503,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}