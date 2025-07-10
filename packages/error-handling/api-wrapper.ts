import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError, ErrorCodes, handleApiError } from './error-handler';
import { createRateLimiter } from './rate-limiter';

interface ApiConfig {
  rateLimit?: {
    requests: number;
    window: string;
  };
  authentication?: boolean;
  validation?: {
    body?: z.ZodSchema;
    query?: z.ZodSchema;
    params?: z.ZodSchema;
  };
  timeout?: number;
}

type ApiHandler<T = any> = (
  request: NextRequest,
  context: {
    params?: any;
    body?: any;
    query?: any;
    user?: any;
  }
) => Promise<T> | T;

/**
 * Standardized API wrapper with error handling, validation, rate limiting, etc.
 */
export function createApiHandler<T = any>(
  handler: ApiHandler<T>,
  config: ApiConfig = {}
): (request: NextRequest, context?: any) => Promise<NextResponse> {
  return async (request: NextRequest, context?: any) => {
    const startTime = Date.now();
    
    try {
      // Rate limiting
      if (config.rateLimit) {
        const rateLimiter = createRateLimiter({
          requests: config.rateLimit.requests,
          window: config.rateLimit.window,
        });
        
        const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
        const allowed = await rateLimiter.check(identifier);
        
        if (!allowed) {
          throw new AppError(
            'Too many requests',
            429,
            ErrorCodes.RATE_LIMIT_EXCEEDED
          );
        }
      }
      
      // Authentication check
      if (config.authentication) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new AppError(
            'Authentication required',
            401,
            ErrorCodes.UNAUTHORIZED
          );
        }
        
        // TODO: Verify token and get user
        // const user = await verifyToken(authHeader.slice(7));
        // context.user = user;
      }
      
      // Parse request data
      const contentType = request.headers.get('content-type');
      let body = undefined;
      
      if (contentType?.includes('application/json')) {
        try {
          body = await request.json();
        } catch {
          throw new AppError(
            'Invalid JSON body',
            400,
            ErrorCodes.BAD_REQUEST
          );
        }
      }
      
      // Parse query parameters
      const { searchParams } = new URL(request.url);
      let query = Object.fromEntries(searchParams.entries());
      
      // Parse route params (if using new Next.js 15 pattern)
      let params = {};
      if (context?.params && typeof context.params === 'object' && 'then' in context.params) {
        params = await context.params;
      } else if (context?.params) {
        params = context.params;
      }
      
      // Validation
      if (config.validation) {
        try {
          if (config.validation.body && body !== undefined) {
            body = config.validation.body.parse(body);
          }
          if (config.validation.query) {
            query = config.validation.query.parse(query) as { [k: string]: string };
          }
          if (config.validation.params) {
            params = config.validation.params.parse(params) as {};
          }
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new AppError(
              `Validation error: ${error.issues.map(e => e.message).join(', ')}`,
              400,
              ErrorCodes.VALIDATION_ERROR,
              true,
              { errors: error.issues }
            );
          }
          throw error;
        }
      }
      
      // Execute handler with timeout
      const handlerPromise = handler(request, {
        params,
        body,
        query,
        user: context?.user,
      });
      
      let result: T;
      if (config.timeout) {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new AppError(
              'Request timeout',
              504,
              ErrorCodes.GATEWAY_TIMEOUT
            ));
          }, config.timeout);
        });
        
        result = await Promise.race([handlerPromise, timeoutPromise]) as T;
      } else {
        result = await handlerPromise;
      }
      
      // Handle different response types
      if (result instanceof NextResponse) {
        return result;
      }
      
      // Add standard headers
      const headers = new Headers();
      headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
      headers.set('X-Request-ID', crypto.randomUUID());
      
      // Return JSON response
      return NextResponse.json(result, { headers });
      
    } catch (error) {
      return handleApiError(error, request);
    }
  };
}

/**
 * Create typed API route handlers
 */
export const apiRoute = {
  GET: (handler: ApiHandler, config?: ApiConfig) => ({
    GET: createApiHandler(handler, config),
  }),
  
  POST: (handler: ApiHandler, config?: ApiConfig) => ({
    POST: createApiHandler(handler, config),
  }),
  
  PUT: (handler: ApiHandler, config?: ApiConfig) => ({
    PUT: createApiHandler(handler, config),
  }),
  
  PATCH: (handler: ApiHandler, config?: ApiConfig) => ({
    PATCH: createApiHandler(handler, config),
  }),
  
  DELETE: (handler: ApiHandler, config?: ApiConfig) => ({
    DELETE: createApiHandler(handler, config),
  }),
};

/**
 * Create a full CRUD API route
 */
export function createCrudApi<T>(
  handlers: {
    list?: ApiHandler<T[]>;
    get?: ApiHandler<T>;
    create?: ApiHandler<T>;
    update?: ApiHandler<T>;
    delete?: ApiHandler<void>;
  },
  config?: ApiConfig
) {
  const routes: any = {};
  
  if (handlers.list) {
    routes.GET = createApiHandler(handlers.list, config);
  }
  
  if (handlers.create) {
    routes.POST = createApiHandler(handlers.create, config);
  }
  
  if (handlers.get) {
    routes.GET = createApiHandler(handlers.get, config);
  }
  
  if (handlers.update) {
    routes.PUT = createApiHandler(handlers.update, config);
    routes.PATCH = createApiHandler(handlers.update, config);
  }
  
  if (handlers.delete) {
    routes.DELETE = createApiHandler(handlers.delete, config);
  }
  
  return routes;
}