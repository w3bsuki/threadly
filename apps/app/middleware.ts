import { clerkMiddleware, createRouteMatcher } from '@repo/auth/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/health(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  // SECURITY: Only log in development mode, avoid exposing sensitive URL parameters
  if (process.env.NODE_ENV === 'development') {
    const urlPath = request.nextUrl.pathname;
  }
  
  // Handle PostHog proxy routes
  if (request.nextUrl.pathname.startsWith('/ingest')) {
    return NextResponse.next();
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

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};