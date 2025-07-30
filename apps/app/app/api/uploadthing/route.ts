import { checkRateLimit, uploadRateLimit } from '@repo/auth/security';
import { type NextRequest, NextResponse } from 'next/server';
import { createRouteHandler } from 'uploadthing/next';

import { ourFileRouter } from './core';

// Create the uploadthing route handler with development configuration
const uploadthingHandler = createRouteHandler({
  router: ourFileRouter,
  config: {
    // Enable development mode features
    ...(process.env.NODE_ENV === 'development' && {
      logLevel: 'Info' as const,
      callbackUrl:
        process.env.UPLOADTHING_URL || 'http://localhost:3000/api/uploadthing',
    }),
  },
});

// Wrap the handlers with rate limiting
export async function GET(request: NextRequest) {
  // GET requests typically don't need rate limiting for uploadthing
  return uploadthingHandler.GET(request);
}

export async function POST(request: NextRequest) {
  // Check rate limit for uploads
  const rateLimitResult = await checkRateLimit(uploadRateLimit, request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: rateLimitResult.error?.message || 'Rate limit exceeded' },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
  }

  return uploadthingHandler.POST(request);
}
