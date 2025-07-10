import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|ingest|favicon.ico).*)'],
};

const locales = ['bg', 'en', 'uk'];
const defaultLocale = 'bg';

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/favorites(.*)', 
  '/cart(.*)',
  '/checkout(.*)',
  '/messages(.*)',
  '/orders(.*)'
]);

function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (pathnameLocale) return pathnameLocale;
  
  // Default to defaultLocale
  return defaultLocale;
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  
  // Check if the pathname already includes a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect if no locale in pathname
    const locale = getLocale(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    
    // For the root path, we can use rewrite instead of redirect for better UX
    if (pathname === '/' && locale === defaultLocale) {
      return NextResponse.rewrite(newUrl);
    }
    
    return NextResponse.redirect(newUrl);
  }

  // Check if current route requires authentication
  if (isProtectedRoute(request)) {
    await auth.protect();
  }

  return NextResponse.next();
});