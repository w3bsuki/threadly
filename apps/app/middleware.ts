import { clerkMiddleware, createRouteMatcher } from '@repo/auth/server';
import { internationalizationMiddleware } from '@repo/internationalization/middleware';
import { NextResponse, type NextRequest } from 'next/server';

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
  
  // Skip i18n for API routes and static assets
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/ingest')) {
    return NextResponse.next();
  }
  
  // Handle internationalization for non-API routes
  const i18nResponse = internationalizationMiddleware(request);
  if (i18nResponse) {
    return i18nResponse;
  }

  // SECURITY: Only log in development mode, avoid exposing sensitive URL parameters
  if (process.env.NODE_ENV === 'development') {
    const urlPath = request.nextUrl.pathname;
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

export default middleware as any;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};