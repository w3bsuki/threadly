import { checkRateLimit, generalApiLimit } from '@repo/security';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check rate limit for public endpoint
  const rateLimitResult = await checkRateLimit(generalApiLimit, request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: rateLimitResult.error?.message || 'Rate limit exceeded',
      },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
  }

  return NextResponse.json({
    version: 'v1',
    status: 'active',
    message: 'Threadly API v1',
    documentation: '/api/v1/docs',
    endpoints: {
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      users: '/api/v1/users',
      categories: '/api/v1/categories',
      search: '/api/v1/search',
    },
    timestamp: new Date().toISOString(),
  });
}
