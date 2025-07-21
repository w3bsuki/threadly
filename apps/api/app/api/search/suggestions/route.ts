import { checkRateLimit, generalApiLimit } from '@repo/security';
import { type NextRequest, NextResponse } from 'next/server';

// Simple stub implementation - search functionality will be implemented later
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
    suggestions: [],
    source: 'stub',
    message: 'Search suggestions endpoint not yet implemented',
    timestamp: new Date().toISOString(),
  });
}
