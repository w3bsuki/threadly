import { generalApiLimit, checkRateLimit } from '@repo/security';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Apply rate limiting to an API route
 * Returns null if allowed, or a NextResponse with 429 status if rate limited
 */
export async function applyRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const rateLimitResult = await checkRateLimit(generalApiLimit, request);
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: rateLimitResult.error?.message || 'Rate limit exceeded',
        retryAfter: rateLimitResult.headers?.get?.('Retry-After')
      },
      { 
        status: 429,
        headers: rateLimitResult.headers
      }
    );
  }
  
  return null;
}

/**
 * Rate limit middleware wrapper for API routes
 */
export function withRateLimit<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const request = args[0] as NextRequest;
    
    const rateLimitResponse = await applyRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    return handler(...args);
  }) as T;
}