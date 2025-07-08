import { NextRequest } from 'next/server';
import { env } from '@/env';
import { createSuccessResponse, createErrorResponse } from '@repo/api-utils';
import { generalApiLimit, checkRateLimit } from '@repo/security';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for debug endpoint
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        new Error('Rate limit exceeded'),
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return createErrorResponse(
        new Error('Debug endpoint not available in production'),
        { status: 403 }
      );
    }

    const data = {
      NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_WEB_URL: env.NEXT_PUBLIC_WEB_URL,
      NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV,
      actual_host: process.env.VERCEL_URL || 'not-vercel',
    };

    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(error);
  }
}