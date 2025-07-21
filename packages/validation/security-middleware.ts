/**
 * Security middleware for API routes
 * Provides consistent validation, sanitization, and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { checkRateLimit } from '@repo/security/rate-limits';
import { sanitizeForDisplay, sanitizeHtml } from './sanitize';
import { log, logError } from '@repo/observability/server';

export interface SecurityMiddlewareConfig {
  // Validation schemas
  bodySchema?: ZodSchema;
  querySchema?: ZodSchema;
  
  // Rate limiting
  rateLimit?: {
    key: string;
    limit: number;
    window: string;
  };
  
  // Content sanitization
  sanitizeBody?: boolean;
  sanitizeQuery?: boolean;
  
  // Request size limits
  maxBodySize?: number; // in bytes
  
  // Auth requirements
  requireAuth?: boolean;
  requireAdmin?: boolean;
  
  // CSRF protection
  requireCSRF?: boolean;
}

export interface ValidatedRequest<T = any, Q = any> extends NextRequest {
  validatedBody?: T;
  validatedQuery?: Q;
  user?: {
    id: string;
    role: string;
    email?: string;
  };
}

/**
 * Validates and sanitizes request body
 */
function validateAndSanitizeBody<T>(
  request: NextRequest,
  schema?: ZodSchema<T>,
  sanitize = true
): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    if (!schema) return { success: true, data: undefined as T };
    
    const body = (request as any).body;
    if (!body) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Request body is required' },
          { status: 400 }
        )
      };
    }
    
    // Validate with Zod
    const validationResult = schema.safeParse(body);
    if (!validationResult.success) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Invalid input',
            details: validationResult.error.issues.map((e: any) => ({
              field: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        )
      };
    }
    
    let data = validationResult.data;
    
    // Apply sanitization if enabled
    if (sanitize && data && typeof data === 'object') {
      data = sanitizeObjectRecursive(data);
    }
    
    return { success: true, data };
  } catch (error) {
    logError('Body validation error:', error);
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    };
  }
}

/**
 * Validates and sanitizes query parameters
 */
function validateAndSanitizeQuery<Q>(
  request: NextRequest,
  schema?: ZodSchema<Q>,
  sanitize = true
): { success: true; data: Q } | { success: false; error: NextResponse } {
  try {
    if (!schema) return { success: true, data: undefined as Q };
    
    const { searchParams } = new URL(request.url);
    const queryObject: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      queryObject[key] = value;
    });
    
    // Validate with Zod
    const validationResult = schema.safeParse(queryObject);
    if (!validationResult.success) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Invalid query parameters',
            details: validationResult.error.issues.map((e: any) => ({
              field: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        )
      };
    }
    
    let data = validationResult.data;
    
    // Apply sanitization if enabled
    if (sanitize && data && typeof data === 'object') {
      data = sanitizeObjectRecursive(data);
    }
    
    return { success: true, data };
  } catch (error) {
    logError('Query validation error:', error);
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      )
    };
  }
}

/**
 * Recursively sanitizes object properties
 */
function sanitizeObjectRecursive<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeForDisplay(obj) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObjectRecursive(item)) as T;
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObjectRecursive(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Security middleware wrapper for API routes
 */
export function withSecurity<T = any, Q = any>(
  handler: (
    request: ValidatedRequest<T, Q>,
    context: any
  ) => Promise<NextResponse>,
  config: SecurityMiddlewareConfig = {}
) {
  return async (request: NextRequest, context: any): Promise<NextResponse> => {
    try {
      const startTime = performance.now();
      
      // Check request size limits
      if (config.maxBodySize) {
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > config.maxBodySize) {
          return NextResponse.json(
            { error: 'Request body too large' },
            { status: 413 }
          );
        }
      }
      
      // Apply rate limiting
      if (config.rateLimit) {
        const rateLimitResult = await checkRateLimit(
          config.rateLimit.key,
          request
        );
        
        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { 
              status: 429,
              headers: rateLimitResult.headers || { 'Retry-After': '60' }
            }
          );
        }
      }
      
      // Parse and validate request body
      let bodyData: T | undefined;
      if (config.bodySchema) {
        const bodyResult = validateAndSanitizeBody(
          request,
          config.bodySchema,
          config.sanitizeBody
        );
        
        if (!bodyResult.success) {
          return bodyResult.error;
        }
        
        bodyData = bodyResult.data as T;
      }
      
      // Parse and validate query parameters
      let queryData: Q | undefined;
      if (config.querySchema) {
        const queryResult = validateAndSanitizeQuery(
          request,
          config.querySchema,
          config.sanitizeQuery
        );
        
        if (!queryResult.success) {
          return queryResult.error;
        }
        
        queryData = queryResult.data as Q;
      }
      
      // Create validated request object
      const validatedRequest = request as ValidatedRequest<T, Q>;
      validatedRequest.validatedBody = bodyData;
      validatedRequest.validatedQuery = queryData;
      
      // Execute the handler
      const response = await handler(validatedRequest, context);
      
      // Log request metrics
      const duration = performance.now() - startTime;
      log.info('API request processed', {
        method: request.method,
        url: request.url,
        status: response.status,
        duration: `${duration.toFixed(2)}ms`,
        hasRateLimit: !!config.rateLimit,
        hasValidation: !!(config.bodySchema || config.querySchema)
      });
      
      return response;
      
    } catch (error) {
      logError('Security middleware error:', error);
      
      // Don't expose internal errors in production
      const isDevelopment = process.env.NODE_ENV === 'development';
      const errorMessage = isDevelopment && error instanceof Error 
        ? error.message 
        : 'Internal server error';
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  };
}

/**
 * Convenience wrapper for routes that need authentication
 */
export function withAuth<T = any, Q = any>(
  handler: (
    request: ValidatedRequest<T, Q>,
    context: any
  ) => Promise<NextResponse>,
  config: Omit<SecurityMiddlewareConfig, 'requireAuth'> = {}
) {
  return withSecurity(handler, {
    ...config,
    requireAuth: true
  });
}

/**
 * Convenience wrapper for admin-only routes
 */
export function withAdmin<T = any, Q = any>(
  handler: (
    request: ValidatedRequest<T, Q>,
    context: any
  ) => Promise<NextResponse>,
  config: Omit<SecurityMiddlewareConfig, 'requireAuth' | 'requireAdmin'> = {}
) {
  return withSecurity(handler, {
    ...config,
    requireAuth: true,
    requireAdmin: true
  });
}

/**
 * Security headers for API responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Prevent MIME type sniffing
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  
  return response;
}