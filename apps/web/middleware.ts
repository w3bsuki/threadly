import { env } from '@/env';
import { authMiddleware } from '@repo/auth/middleware';
import { internationalizationMiddleware } from '@repo/internationalization/middleware';
import { parseError } from '@repo/observability/server';
import { secure } from '@repo/security';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import {
  type NextRequest,
  NextResponse,
  type NextMiddleware,
} from 'next/server';

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets, API routes, and Posthog ingest
  matcher: ['/((?!api|_next/static|_next/image|ingest|favicon.ico).*)'],
};

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

// Protected routes that require authentication
const protectedRoutes = [
  '/profile',
  '/favorites', 
  '/cart',
  '/checkout',
  '/messages',
  '/orders'
];

const middleware = authMiddleware(async (auth, request: NextRequest) => {
  // Handle internationalization first
  const i18nResponse = internationalizationMiddleware(request);
  if (i18nResponse) {
    return i18nResponse;
  }

  // Check if current route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.includes(route)
  );

  if (isProtectedRoute) {
    await auth.protect();
  }

  // Continue with security middleware if no i18n redirect/rewrite needed
  if (!env.ARCJET_KEY) {
    const response = await securityHeaders();
    return NextResponse.next({ headers: response.headers });
  }

  try {
    await secure(
      [
        // See https://docs.arcjet.com/bot-protection/identifying-bots
        'CATEGORY:SEARCH_ENGINE', // Allow search engines
        'CATEGORY:PREVIEW', // Allow preview links to show OG images
        'CATEGORY:MONITOR', // Allow uptime monitoring services
      ],
      request
    );

    const response = await securityHeaders();
    return NextResponse.next({ headers: response.headers });
  } catch (error) {
    const message = parseError(error);

    return NextResponse.json({ error: message }, { status: 403 });
  }
});

export default middleware;
