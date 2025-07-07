import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { internationalizationMiddleware } from '@repo/internationalization/middleware';
import {
  type NextRequest,
  NextResponse,
} from 'next/server';

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets, API routes, and Posthog ingest
  matcher: ['/((?!api|_next/static|_next/image|ingest|favicon.ico).*)'],
};

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/favorites(.*)', 
  '/cart(.*)',
  '/checkout(.*)',
  '/messages(.*)',
  '/orders(.*)'
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Handle internationalization first
  const i18nResponse = internationalizationMiddleware(request);
  if (i18nResponse) {
    return i18nResponse;
  }

  // Check if current route requires authentication
  if (isProtectedRoute(request)) {
    await auth.protect();
  }

  // For now, skip Arcjet bot protection and nosecone headers to stay under 1MB limit
  // These can be implemented as API route middleware instead
  return NextResponse.next();
});