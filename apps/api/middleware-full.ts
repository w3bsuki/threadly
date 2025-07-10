import { csrfMiddleware } from '@repo/security';
import { NextResponse } from 'next/server';
import type { NextMiddleware, NextRequest } from 'next/server';

// Security validation helpers
const isWebhookPath = (pathname: string) => 
  pathname.startsWith('/webhooks/') || pathname.includes('/webhook');

const isHealthCheckPath = (pathname: string) => 
  pathname === '/health' || pathname === '/api/health';

const isSuspiciousRequest = (req: NextRequest): boolean => {
  const userAgent = req.headers.get('user-agent') || '';
  const origin = req.headers.get('origin');
  
  // Block requests with no user agent
  if (!userAgent) return true;
  
  // Block common attack patterns
  const suspiciousPatterns = [
    /sqlmap/i,
    /nmap/i,
    /nikto/i,
    /masscan/i,
    /burpsuite/i,
    /\\.php/,
    /\\.asp/,
    /\\.jsp/,
    /admin/i,
    /wp-admin/i,
    /phpmyadmin/i,
  ];
  
  return suspiciousPatterns.some(pattern => 
    pattern.test(req.nextUrl.pathname) || pattern.test(userAgent)
  );
};

const addSecurityHeaders = (response: Response | NextResponse): NextResponse => {
  // If it's a plain Response, convert to NextResponse
  const nextResponse = response instanceof NextResponse ? response : new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  
  // Core security headers
  nextResponse.headers.set('X-Content-Type-Options', 'nosniff');
  nextResponse.headers.set('X-Frame-Options', 'DENY');
  nextResponse.headers.set('X-XSS-Protection', '1; mode=block');
  nextResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  nextResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS for HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    nextResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  
  // API-specific headers
  nextResponse.headers.set('X-API-Version', 'v1');
  nextResponse.headers.set('X-Powered-By', 'Threadly');
  
  return nextResponse;
};

export const middleware: NextMiddleware = async (req: NextRequest) => {
  const startTime = Date.now();
  
  try {
    // Block suspicious requests early
    if (isSuspiciousRequest(req)) {
      logError('Suspicious request blocked', {
        path: req.nextUrl.pathname,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        method: req.method,
      });
      
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    // Start with a fresh response
    let response: NextResponse = NextResponse.next();
    
    // Skip CSRF for webhooks and health checks
    const isWebhook = isWebhookPath(req.nextUrl.pathname);
    const isHealthCheck = isHealthCheckPath(req.nextUrl.pathname);
    
    if (!isWebhook && !isHealthCheck) {
      // Apply CSRF protection for non-webhook API routes
      if (req.nextUrl.pathname.startsWith('/api/') && req.method !== 'GET') {
        const csrfResponse = await csrfMiddleware(req);
        if (csrfResponse) {
          return addSecurityHeaders(csrfResponse);
        }
      }
    }
    
    // Add additional security headers
    response = addSecurityHeaders(response as Response | NextResponse);
    
    // Add request timing header for monitoring
    const processingTime = Date.now() - startTime;
    response.headers.set('X-Response-Time', `${processingTime}ms`);
    
    return response;
  } catch (error) {
    // Simple console logging for edge runtime
    console.error('Middleware error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.nextUrl.pathname,
      method: req.method,
      processingTime: Date.now() - startTime,
    });
    
    // Return a safe error response
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|webhooks|cron)(.*)',
  ],
};