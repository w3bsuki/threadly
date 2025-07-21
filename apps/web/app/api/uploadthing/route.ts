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
    console.log('Uploadthing POST request received');
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    console.log('URL:', request.url);
    console.log('Method:', request.method);
    
    // Temporarily skip rate limiting to debug
    // const rateLimitResult = await checkRateLimit(uploadRateLimit, request);
    // if (!rateLimitResult.allowed) {
    //   console.error('Rate limit exceeded');
    //   return NextResponse.json(
    //     { error: rateLimitResult.error?.message || 'Rate limit exceeded' },
    //     { 
    //       status: 429,
    //       headers: rateLimitResult.headers,
    //     }
    //   );
    // }

    console.log('Forwarding to uploadthing handler (rate limit skipped for debug)');
    const response = await uploadthingHandler.POST(request);
    console.log('Uploadthing handler response status:', response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Uploadthing handler error response:', responseText);
    }
    
    return response;
  } catch (error) {
    console.error('Uploadthing POST error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return NextResponse.json(
      { error: 'Internal server error during upload' },
      { status: 500 }
    );
  }
}