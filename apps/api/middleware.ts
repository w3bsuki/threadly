import { NextResponse } from 'next/server';
import type { NextMiddleware, NextRequest } from 'next/server';

// Minimal middleware for API routes
export const middleware: NextMiddleware = async (req: NextRequest) => {
  const startTime = Date.now();
  
  try {
    const response = NextResponse.next();
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    
    // Add timing header
    const processingTime = Date.now() - startTime;
    response.headers.set('X-Response-Time', `${processingTime}ms`);
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|webhooks|cron)(.*)',
  ],
};