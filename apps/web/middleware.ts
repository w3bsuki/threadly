import { clerkMiddleware, createRouteMatcher } from '@repo/auth/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api|ingest|favicon.ico|.*\\..*|manifest.json).*)',
  ],
};

const locales = ['bg', 'en', 'uk'];
const defaultLocale = 'bg';

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/orders(.*)',
  '/selling/new(.*)',
  '/selling/onboarding(.*)',
]);

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/browse(.*)',
  '/product(.*)',
]);

function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameLocale) {
    return pathnameLocale;
  }

  // Default to defaultLocale
  return defaultLocale;
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const { userId } = await auth();

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/api/') || 
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next();
  }

  // Check if the pathname already includes a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If we have a locale, proceed without redirects
  if (pathnameHasLocale) {
    // Check if current route requires authentication
    if (isProtectedRoute(request)) {
      if (!userId) {
        const locale = getLocale(request);
        const returnUrl = pathname;
        const signInUrl = `/${locale}/sign-in?from=${encodeURIComponent(returnUrl)}`;
        return NextResponse.redirect(new URL(signInUrl, request.url));
      }
      // If user is authenticated, let them continue in web - DO NOT REDIRECT
    }
    return NextResponse.next();
  }

  // Only redirect if no locale in pathname and not already redirecting
  if (pathname === '/') {
    const locale = defaultLocale;
    const newUrl = new URL(`/${locale}`, request.url);
    return NextResponse.redirect(newUrl, 302);
  }

  // For other paths without locale, add default locale
  const locale = defaultLocale;
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl, 302);
});
