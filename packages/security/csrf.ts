import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

// CSRF configuration
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = '__Host-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Exempt paths that don't require CSRF protection
const CSRF_EXEMPT_PATHS = [
  '/api/webhooks',
  '/api/health',
  '/api/uploadthing',
  '/api/collaboration/auth',
  '/api/stripe',
  '/api/real-time',
  '/api/seed-categories',
];

export interface CSRFConfig {
  cookieName?: string;
  headerName?: string;
  tokenExpiry?: number;
  exemptPaths?: string[];
}

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Set CSRF token cookie
 */
export async function setCSRFCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CSRF_TOKEN_EXPIRY / 1000, // Convert to seconds
  });
}

/**
 * Get CSRF token from cookie
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(CSRF_COOKIE_NAME);
  return cookie?.value || null;
}

/**
 * Validate CSRF token from request
 */
export async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  // Skip CSRF check for GET and HEAD requests
  if (['GET', 'HEAD'].includes(request.method)) {
    return true;
  }

  // Check if path is exempt
  const pathname = new URL(request.url).pathname;
  if (CSRF_EXEMPT_PATHS.some(path => pathname.startsWith(path))) {
    return true;
  }

  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!cookieToken) {
    return false;
  }

  // Get token from header or body
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  
  // For form submissions, check body as well
  let bodyToken: string | null = null;
  if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
    try {
      const formData = await request.formData();
      bodyToken = formData.get('csrf_token') as string | null;
    } catch {
      // Ignore parsing errors
    }
  }

  const requestToken = headerToken || bodyToken;
  if (!requestToken) {
    return false;
  }

  // Compare tokens (timing-safe comparison)
  return cookieToken === requestToken;
}

/**
 * CSRF middleware for Next.js API routes
 */
export async function csrfMiddleware(
  request: NextRequest,
  config?: CSRFConfig
): Promise<Response | null> {
  const isValid = await validateCSRFToken(request);
  
  if (!isValid) {
    return new Response(
      JSON.stringify({
        error: 'CSRF validation failed',
        message: 'Invalid or missing CSRF token',
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
  return null; // Continue to next middleware
}

/**
 * Initialize CSRF protection for a user session
 */
export async function initializeCSRFProtection(): Promise<string> {
  const token = generateCSRFToken();
  await setCSRFCookie(token);
  return token;
}

/**
 * Refresh CSRF token
 */
export async function refreshCSRFToken(): Promise<string> {
  const currentToken = await getCSRFToken();
  if (currentToken) {
    // Extend the expiry of existing token
    await setCSRFCookie(currentToken);
    return currentToken;
  }
  
  // Generate new token if none exists
  return initializeCSRFProtection();
}

/**
 * Client-side helper to get CSRF token from cookie
 */
export function getCSRFTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const match = document.cookie.match(new RegExp(`(^| )${CSRF_COOKIE_NAME}=([^;]+)`));
  return match?.[2] ?? null;
}

/**
 * Add CSRF token to fetch headers
 */
export function addCSRFHeader(headers: HeadersInit = {}): HeadersInit {
  const token = getCSRFTokenFromCookie();
  if (!token) {
    return headers;
  }
  
  return {
    ...headers,
    [CSRF_HEADER_NAME]: token,
  };
}