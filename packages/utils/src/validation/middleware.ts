/**
 * Validation middleware for Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError, type ZodSchema, z } from 'zod';
import { sanitizeForDisplay } from './sanitize';

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

/**
 * Validation error format
 */
export interface ValidationError {
  path: string;
  message: string;
}

/**
 * Format Zod errors for API response
 */
export const formatZodErrors = (error: ZodError): ValidationError[] => {
  return error.issues.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }));
};

/**
 * Validate request body against a schema
 */
export const validateBody = async <T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> => {
  try {
    const body = await request.json();
    const data = await schema.parseAsync(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, errors: formatZodErrors(error) };
    }
    return {
      success: false,
      errors: [{ path: '', message: 'Invalid request body' }],
    };
  }
};

/**
 * Validate query parameters against a schema
 */
export const validateQuery = <T>(
  request: NextRequest,
  schema: ZodSchema<T>
): ValidationResult<T> => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query: Record<string, any> = {};

    searchParams.forEach((value: string, key: string) => {
      // Handle array parameters (e.g., ?tags=a&tags=b)
      if (query[key]) {
        if (Array.isArray(query[key])) {
          query[key].push(value);
        } else {
          query[key] = [query[key], value];
        }
      } else {
        query[key] = value;
      }
    });

    const data = schema.parse(query);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, errors: formatZodErrors(error) };
    }
    return {
      success: false,
      errors: [{ path: '', message: 'Invalid query parameters' }],
    };
  }
};

/**
 * Validate route parameters
 */
export const validateParams = <T>(
  params: any,
  schema: ZodSchema<T>
): ValidationResult<T> => {
  try {
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, errors: formatZodErrors(error) };
    }
    return {
      success: false,
      errors: [{ path: '', message: 'Invalid route parameters' }],
    };
  }
};

/**
 * Create validation middleware for API routes
 */
export const createValidationMiddleware = <T>(
  schema: ZodSchema<T>,
  type: 'body' | 'query' | 'params' = 'body'
) => {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    let result: ValidationResult<T>;

    switch (type) {
      case 'body':
        result = await validateBody(request, schema);
        break;
      case 'query':
        result = validateQuery(request, schema);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid validation type' },
          { status: 500 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: result.errors,
        },
        { status: 400 }
      );
    }

    return null; // Continue to handler
  };
};

/**
 * Request size limit middleware
 */
export const createSizeLimitMiddleware = (maxBytes: number = 1024 * 1024) => {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const contentLength = request.headers.get('content-length');

    if (contentLength && Number.parseInt(contentLength) > maxBytes) {
      return NextResponse.json(
        { error: `Request body too large. Maximum size: ${maxBytes} bytes` },
        { status: 413 }
      );
    }

    return null;
  };
};

/**
 * Rate limit tracking (simple in-memory implementation)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple rate limit middleware
 */
export const createRateLimitMiddleware = (
  limit = 60,
  windowMs: number = 60 * 1000
) => {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();

    const record = rateLimitStore.get(identifier);

    if (!record || record.resetAt < now) {
      rateLimitStore.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      });
      return null;
    }

    if (record.count >= limit) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(record.resetAt).toISOString(),
          },
        }
      );
    }

    record.count++;
    return null;
  };
};

/**
 * Sanitization middleware - automatically sanitize string fields
 */
export const createSanitizationMiddleware = (fields: string[] = []) => {
  return async (request: NextRequest): Promise<NextRequest> => {
    if (request.method === 'GET') return request;

    try {
      const body = await request.json();
      const sanitized = { ...body };

      // Sanitize specified fields
      fields.forEach((field) => {
        if (typeof sanitized[field] === 'string') {
          sanitized[field] = sanitizeForDisplay(sanitized[field]);
        }
      });

      // Create new request with sanitized body
      return new NextRequest(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(sanitized),
      });
    } catch {
      return request;
    }
  };
};

/**
 * Combine multiple middleware functions
 */
export const combineMiddleware = (
  ...middlewares: Array<(req: NextRequest) => Promise<NextResponse | null>>
) => {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    for (const middleware of middlewares) {
      const response = await middleware(request);
      if (response) return response;
    }
    return null;
  };
};

/**
 * Helper to wrap API route with validation
 */
export const withValidation = <T>(
  handler: (request: NextRequest, data: T) => Promise<NextResponse>,
  schema: ZodSchema<T>,
  type: 'body' | 'query' = 'body'
) => {
  return async (request: NextRequest): Promise<NextResponse> => {
    let result: ValidationResult<T>;

    switch (type) {
      case 'body':
        result = await validateBody(request, schema);
        break;
      case 'query':
        result = validateQuery(request, schema);
        break;
    }

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: result.errors,
        },
        { status: 400 }
      );
    }

    return handler(request, result.data);
  };
};

/**
 * Error response helper
 */
export const validationErrorResponse = (
  errors: ValidationError[]
): NextResponse => {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: errors,
    },
    { status: 400 }
  );
};
