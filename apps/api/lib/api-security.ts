import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { logError } from '@repo/observability/server';
import { checkRateLimit, generalApiLimit } from '@repo/security';
import { type NextRequest, NextResponse } from 'next/server';
import { type ZodSchema } from 'zod';

// Standard error responses
export const ErrorResponses = {
  unauthorized: () => 
    NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  
  forbidden: (message = 'Forbidden') => 
    NextResponse.json({ error: message }, { status: 403 }),
  
  notFound: (resource = 'Resource') => 
    NextResponse.json({ error: `${resource} not found` }, { status: 404 }),
  
  badRequest: (message: string, details?: any) => 
    NextResponse.json({ error: message, details }, { status: 400 }),
  
  rateLimit: (message: string, headers?: Record<string, string>) => 
    NextResponse.json({ error: message }, { status: 429, headers }),
  
  serverError: (error?: unknown) => {
    if (error) {
      logError('API Error:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  },
};

// Authentication helper with user lookup
export async function authenticateUser(_request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return { authenticated: false as const, response: ErrorResponses.unauthorized() };
  }

  const user = await database.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!user) {
    return { authenticated: false as const, response: ErrorResponses.notFound('User') };
  }

  return { authenticated: true as const, user };
}

// Rate limiting helper
export async function checkApiRateLimit(request: NextRequest) {
  const rateLimitResult = await checkRateLimit(generalApiLimit, request);
  
  if (!rateLimitResult.allowed) {
    return {
      allowed: false as const,
      response: ErrorResponses.rateLimit(
        rateLimitResult.error?.message || 'Rate limit exceeded'
      ),
    };
  }

  return { allowed: true as const };
}

// Request validation helper
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ valid: true; data: T } | { valid: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const validationResult = schema.safeParse(body);
    
    if (!validationResult.success) {
      return {
        valid: false,
        response: ErrorResponses.badRequest(
          'Invalid request data',
          validationResult.error.flatten()
        ),
      };
    }

    return { valid: true, data: validationResult.data };
  } catch (error) {
    return {
      valid: false,
      response: ErrorResponses.badRequest('Invalid JSON in request body'),
    };
  }
}

// Combined security wrapper for API routes
export function withApiSecurity<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: (
    request: NextRequest,
    context: {
      user: {
        id: string;
        email: string;
        role: string;
        firstName: string | null;
        lastName: string | null;
      };
    }
  ) => Promise<NextResponse>
): T {
  return (async (request: NextRequest, ..._args: any[]) => {
    try {
      // Check rate limit
      const rateLimitCheck = await checkApiRateLimit(request);
      if (!rateLimitCheck.allowed) {
        return rateLimitCheck.response;
      }

      // Authenticate user
      const authResult = await authenticateUser(request);
      if (!authResult.authenticated) {
        return authResult.response;
      }

      // Call the handler with authenticated context
      return await handler(request, { user: authResult.user });
    } catch (error) {
      return ErrorResponses.serverError(error);
    }
  }) as T;
}

// Helper for public endpoints (no auth required)
export function withPublicApiSecurity<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (request: NextRequest, ..._args: any[]) => {
    try {
      // Check rate limit
      const rateLimitCheck = await checkApiRateLimit(request);
      if (!rateLimitCheck.allowed) {
        return rateLimitCheck.response;
      }

      // Call the handler
      return await handler(request, ..._args);
    } catch (error) {
      return ErrorResponses.serverError(error);
    }
  }) as T;
}

// Helper to check resource ownership
export async function checkResourceOwnership(
  userId: string,
  resourceId: string,
  resourceType: 'product' | 'order' | 'address'
): Promise<boolean> {
  switch (resourceType) {
    case 'product': {
      const product = await database.product.findFirst({
        where: { id: resourceId, sellerId: userId },
      });
      return !!product;
    }
    case 'order': {
      const order = await database.order.findFirst({
        where: { 
          id: resourceId,
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
      });
      return !!order;
    }
    case 'address': {
      const address = await database.address.findFirst({
        where: { id: resourceId, userId },
      });
      return !!address;
    }
    default:
      return false;
  }
}

// Helper for request size validation
export function validateRequestSize(
  request: NextRequest,
  maxSizeMB: number = 5
): NextResponse | null {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > maxSizeMB * 1024 * 1024) {
    return ErrorResponses.badRequest(`Request too large. Maximum size: ${maxSizeMB}MB`);
  }
  return null;
}