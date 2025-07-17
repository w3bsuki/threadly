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
  
  // Handle internationalization for non-API routes
  const i18nResponse = internationalizationMiddleware(request);
  if (i18nResponse) {
    return i18nResponse;
  }

  
  // Redirect authenticated route to dashboard
  const urlPath = request.nextUrl.pathname;
  const localeMatch = urlPath.match(/^\/([a-z]{2})$/);
  if (localeMatch) {
    const locale = localeMatch[1];
    // Check if user is authenticated before redirecting
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    } else {
      return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
    }
  }
  
  // Protect authenticated routes
  if (!isPublicRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }
  
  return NextResponse.next();
});

export default middleware;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|otf|css|js)).*)',
    '/(api|trpc)(.*)',
  ],
};