import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { logError } from './error-logger';
import { isRetryableError } from './retry';

export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
    path?: string;
    requestId?: string;
  };
}

// Standard error codes
export const ErrorCodes = {
  // Client errors
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  BAD_GATEWAY: 'BAD_GATEWAY',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT: 'GATEWAY_TIMEOUT',
  
  // Business logic errors
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  PRODUCT_NOT_AVAILABLE: 'PRODUCT_NOT_AVAILABLE',
  ORDER_ALREADY_PROCESSED: 'ORDER_ALREADY_PROCESSED',
  SELLER_NOT_VERIFIED: 'SELLER_NOT_VERIFIED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// Custom application error class
export class AppError extends Error {
  public statusCode: number;
  public code: ErrorCode;
  public isOperational: boolean;
  public context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCodes.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.context = context;
    
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler for API routes
export async function handleApiError(
  error: unknown,
  request: NextRequest
): Promise<NextResponse<ErrorResponse>> {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const path = request.url;
  
  // Default error response
  let statusCode = 500;
  let message = 'An unexpected error occurred';
  let code: ErrorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
  let context: Record<string, any> = {};
  
  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
    context = error.context || {};
  } else if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('rate limit')) {
      statusCode = 429;
      code = ErrorCodes.RATE_LIMIT_EXCEEDED;
      message = 'Too many requests. Please try again later.';
    } else if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      statusCode = 401;
      code = ErrorCodes.UNAUTHORIZED;
      message = 'Authentication required';
    } else if (error.message.includes('forbidden') || error.message.includes('permission')) {
      statusCode = 403;
      code = ErrorCodes.FORBIDDEN;
      message = 'Access denied';
    } else if (error.message.includes('not found')) {
      statusCode = 404;
      code = ErrorCodes.NOT_FOUND;
      message = 'Resource not found';
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      statusCode = 400;
      code = ErrorCodes.VALIDATION_ERROR;
      message = error.message;
    }
  }
  
  // Log the error
  logError(error as Error, {
    level: statusCode >= 500 ? 'error' : 'warning',
    request: {
      url: path,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    },
    tags: {
      statusCode: statusCode.toString(),
      errorCode: code,
      requestId,
    },
    extra: context,
  });
  
  // Send to Sentry for server errors
  if (statusCode >= 500) {
    Sentry.withScope((scope) => {
      scope.setTag('requestId', requestId);
      scope.setContext('request', {
        url: path,
        method: request.method,
      });
      Sentry.captureException(error);
    });
  }
  
  // Prepare error response
  const errorResponse: ErrorResponse = {
    error: {
      message: process.env.NODE_ENV === 'production' && statusCode >= 500 
        ? 'An error occurred. Please try again later.' 
        : message,
      code,
      statusCode,
      timestamp,
      path,
      requestId,
    },
  };
  
  // Add retry header for retryable errors
  const headers = new Headers();
  if (isRetryableError({ status: statusCode })) {
    headers.set('Retry-After', '60');
  }
  
  return NextResponse.json(errorResponse, { 
    status: statusCode,
    headers,
  });
}

// Error handler wrapper for API routes
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      const request = args.find(arg => arg instanceof NextRequest) as NextRequest;
      return handleApiError(error, request);
    }
  }) as T;
}

// Graceful shutdown handler
export class GracefulShutdown {
  private shutdownHandlers: Array<() => Promise<void>> = [];
  private isShuttingDown = false;
  
  constructor() {
    // Register shutdown signals
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logError(error, {
        level: 'fatal',
        tags: { type: 'uncaughtException' },
      });
      this.shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      logError(new Error(`Unhandled Rejection: ${reason}`), {
        level: 'error',
        tags: { type: 'unhandledRejection' },
        extra: { promise },
      });
    });
  }
  
  register(handler: () => Promise<void>) {
    this.shutdownHandlers.push(handler);
  }
  
  async shutdown(signal: string) {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    
    // Give pending requests time to complete
    setTimeout(() => {
      process.exit(1);
    }, 30000); // 30 seconds timeout
    
    try {
      // Run all shutdown handlers
      await Promise.all(this.shutdownHandlers.map(handler => handler()));
      process.exit(0);
    } catch (error) {
      process.exit(1);
    }
  }
}

// Export singleton instance
export const gracefulShutdown = new GracefulShutdown();