import { createRouteHandler } from "uploadthing/next";
import { uploadRateLimit, checkRateLimit } from '@repo/security';
import { NextRequest, NextResponse } from 'next/server';

import { ourFileRouter } from "./core";

const uploadthingHandler = createRouteHandler({
  router: ourFileRouter,
  config: {
    logLevel: 'Debug' as const,
    callbackUrl: process.env.UPLOADTHING_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api/uploadthing' : undefined),
    isDev: process.env.NODE_ENV === 'development',
  },
});

export async function GET(request: NextRequest) {
  return uploadthingHandler.GET(request);
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, uploadthing-version, uploadthing-callback',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
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

    const response = await uploadthingHandler.POST(request);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error during upload' },
      { status: 500 }
    );
  }
}