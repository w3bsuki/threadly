import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@repo/security';
import { createErrorResponse, createSuccessResponse } from './responses';
import { createApiError, ErrorCode } from './errors';
import { ValidationContext } from './validation';

export interface ApiHandlerOptions {
  rateLimitConfig?: Parameters<typeof checkRateLimit>[0];
  requireAuth?: boolean;
  allowedMethods?: string[];
  logRequests?: boolean;
}

export function withApiHandler(
  handler: (request: NextRequest, context: ValidationContext) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
) {
  return async (request: NextRequest, routeParams?: { params: Record<string, string> }) => {
    try {
      // Method validation
      if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
        return createErrorResponse(
          createApiError(
            ErrorCode.INVALID_INPUT,
            `Method ${request.method} not allowed`
          ),
          { status: 405 }
        );
      }

      // Rate limiting
      if (options.rateLimitConfig) {
        const rateLimitResult = await checkRateLimit(options.rateLimitConfig, request);
        if (!rateLimitResult.allowed) {
          return createErrorResponse(
            createApiError(
              ErrorCode.RATE_LIMIT_EXCEEDED,
              rateLimitResult.error?.message || 'Rate limit exceeded'
            ),
            { 
              status: 429,
              headers: rateLimitResult.headers 
            }
          );
        }
      }

      // Authentication check
      let context: ValidationContext = { request };
      
      if (options.requireAuth) {
        // Import auth here to avoid circular dependencies
        const { auth } = await import('@repo/auth/server');
        const authResult = await auth();
        
        if (!authResult?.userId) {
          return createErrorResponse(
            createApiError(ErrorCode.UNAUTHORIZED, 'Authentication required')
          );
        }
        
        context.userId = authResult.userId;
        // Add user role if available in auth result
        if ('role' in authResult) {
          context.userRole = (authResult as any).role;
        }
      }

      // Request logging
      if (options.logRequests) {
        try {
          const { log } = await import('@repo/observability/server');
          log.info('API Request', {
            method: request.method,
            url: request.url,
            userId: context.userId,
            timestamp: new Date().toISOString(),
          });
        } catch {
          // Fallback to console if observability is not available
          console.log('API Request:', {
            method: request.method,
            url: request.url,
            userId: context.userId,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Call the actual handler
      return await handler(request, context);

    } catch (error) {
      return createErrorResponse(error);
    }
  };
}

// Convenience wrapper for common API patterns
export function createGetHandler(
  handler: (request: NextRequest, context: ValidationContext) => Promise<NextResponse>,
  options: Omit<ApiHandlerOptions, 'allowedMethods'> = {}
) {
  return withApiHandler(handler, { ...options, allowedMethods: ['GET'] });
}

export function createPostHandler(
  handler: (request: NextRequest, context: ValidationContext) => Promise<NextResponse>,
  options: Omit<ApiHandlerOptions, 'allowedMethods'> = {}
) {
  return withApiHandler(handler, { ...options, allowedMethods: ['POST'] });
}

export function createPutHandler(
  handler: (request: NextRequest, context: ValidationContext) => Promise<NextResponse>,
  options: Omit<ApiHandlerOptions, 'allowedMethods'> = {}
) {
  return withApiHandler(handler, { ...options, allowedMethods: ['PUT'] });
}

export function createDeleteHandler(
  handler: (request: NextRequest, context: ValidationContext) => Promise<NextResponse>,
  options: Omit<ApiHandlerOptions, 'allowedMethods'> = {}
) {
  return withApiHandler(handler, { ...options, allowedMethods: ['DELETE'] });
}