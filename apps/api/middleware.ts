import type { NextMiddleware, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { securityHeaders, isAllowedOrigin } from './lib/security-config';

// Enhanced middleware for API routes with security
export const middleware: NextMiddleware = async (req: NextRequest) => {
  const startTime = Date.now();

  try {
    const response = NextResponse.next();

    // Add all security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add CORS headers for API routes
    const origin = req.headers.get('origin');
    if (origin && isAllowedOrigin(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
      response.headers.set('Access-Control-Max-Age', '86400');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    // Add timing header
    const processingTime = Date.now() - startTime;
    response.headers.set('X-Response-Time', `${processingTime}ms`);

    return response;
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|webhooks|cron)(.*)',
  ],
};
