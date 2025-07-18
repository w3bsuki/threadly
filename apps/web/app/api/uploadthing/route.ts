import { createRouteHandler } from "uploadthing/next";
import { uploadRateLimit, checkRateLimit } from '@repo/security';
import { NextRequest, NextResponse } from 'next/server';

import { ourFileRouter } from "./core";

const uploadthingHandler = createRouteHandler({
  router: ourFileRouter,
  config: {
    ...(process.env.NODE_ENV === 'development' && {
      logLevel: 'Info' as const,
      callbackUrl: process.env.UPLOADTHING_URL || 'http://localhost:3001/api/uploadthing',
    }),
  },
});

export async function GET(request: NextRequest) {
  return uploadthingHandler.GET(request);
}

export async function POST(request: NextRequest) {
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