import { NextResponse } from 'next/server';
import { database } from '@repo/database';
import { cache } from '@repo/cache';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Check database connectivity
    const dbCheck = await database.$queryRaw`SELECT 1 as status`;
    const dbLatency = Date.now() - startTime;
    
    // Check cache connectivity
    const cacheStartTime = Date.now();
    await cache.set('health-check', 'ok', { ttl: 10 });
    const cacheResult = await cache.get('health-check');
    const cacheLatency = Date.now() - cacheStartTime;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: {
          status: dbCheck ? 'healthy' : 'unhealthy',
          latency: dbLatency,
        },
        cache: {
          status: cacheResult === 'ok' ? 'healthy' : 'unhealthy',
          latency: cacheLatency,
        },
        memory: {
          usage: process.memoryUsage(),
        },
      },
    };
    
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}