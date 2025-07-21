import { clerkMiddleware, createRouteMatcher } from '@repo/auth/server';
import { internationalizationMiddleware } from '@repo/internationalization/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { createRateLimiter, slidingWindow } from '@repo/rate-limit';

const isPublicRoute = createRouteMatcher([
  '/:locale/sign-in(.*)',
  '/:locale/sign-up(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/health(.*)',
]);

const middleware = clerkMiddleware(async (auth, request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  
  // Early return for static assets and API routes - performance optimization
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/ingest') ||
    pathname.includes('.') // Any file with extension
  ) {
    return NextResponse.next();
  }
  
  // Apply rate limiting for all pages
  const rateLimiter = createRateLimiter({
    limiter: slidingWindow(100, '1 m'),
    prefix: 'page-requests',
  });
  
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
  const rateLimitResult = await rateLimiter.limit(ip);
  
  if (!rateLimitResult.success) {
    return new NextResponse('Rate limit exceeded', { status: 429 });
  }
  
  // Add performance headers
  const headers = new Headers(request.headers);
  headers.set('X-DNS-Prefetch-Control', 'on');
  headers.set('Connection', 'keep-alive');
  
  // Handle internationalization for non-API routes
  const i18nResponse = internationalizationMiddleware(request);
  if (i18nResponse) {
    return i18nResponse;
  }

  
  // Handle returnTo parameter for cross-app redirects after authentication
  const returnTo = request.nextUrl.searchParams.get('returnTo');
  const { userId } = await auth();
  
  // Check if we're on a sign-in or sign-up page and user is already authenticated
  if (userId && (pathname.includes('/sign-in') || pathname.includes('/sign-up'))) {
    // If there's a returnTo parameter, redirect there immediately
    if (returnTo) {
      try {
        const returnUrl = new URL(returnTo);
        const allowedOrigins = [
          request.nextUrl.origin,
          process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001',
          process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3000'
        ].filter(Boolean);
        
        if (allowedOrigins.includes(returnUrl.origin)) {
          // Use a client-side redirect to ensure cookies are set properly
          const html = `
            <html>
              <head>
                <meta http-equiv="refresh" content="0; url=${returnTo}">
                <script>window.location.href = "${returnTo}";</script>
              </head>
              <body>Redirecting to ${returnTo}...</body>
            </html>
          `;
          return new NextResponse(html, {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          });
        }
      } catch (e) {
        // Invalid returnTo URL
      }
    }
    // Otherwise redirect to dashboard
    const localeMatch = pathname.match(/^\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : 'en';
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }
  
  // Redirect authenticated route to dashboard
  const urlPath = request.nextUrl.pathname;
  const localeMatch = urlPath.match(/^\/([a-z]{2})$/);
  if (localeMatch) {
    const locale = localeMatch[1];
    if (userId) {
      // Check for returnTo parameter in the URL
      if (returnTo) {
        try {
          // Validate and redirect to the returnTo URL
          const returnUrl = new URL(returnTo);
          // Only allow redirects to trusted domains
          const allowedOrigins = [
            request.nextUrl.origin,
            process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001',
            process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3000'
          ].filter(Boolean);
          
          if (allowedOrigins.includes(returnUrl.origin)) {
            return NextResponse.redirect(returnUrl);
          }
        } catch (e) {
          // Invalid URL, fall through to default redirect
        }
      }
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    } else {
      // Preserve returnTo when redirecting to sign-in
      const signInUrl = new URL(`/${locale}/sign-in`, request.url);
      if (returnTo) {
        signInUrl.searchParams.set('returnTo', returnTo);
      }
      return NextResponse.redirect(signInUrl);
    }
  }
  
  // Protect authenticated routes
  if (!isPublicRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }
  
  const response = NextResponse.next({
    request: {
      headers,
    },
  });
  
  // Add cache headers for static assets
  if (pathname.match(/\.(js|css|woff|woff2|ttf|otf)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  return response;
});

export default middleware;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|otf|css|js)).*)',
    '/(api|trpc)(.*)',
  ],
};