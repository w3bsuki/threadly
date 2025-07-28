import { logError } from '@repo/observability/server';
import { NextResponse } from 'next/server';
import { getSecureResponseHeaders } from './security-utils';

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  meta?: {
    version: string;
    timestamp: string;
    requestId?: string;
    processingTime?: string;
  };
}

export interface APIErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
  meta: {
    version: string;
    timestamp: string;
    requestId?: string;
  };
}

export class APIResponseBuilder {
  private static version = 'v1';

  static success<T>(
    data: T,
    message?: string,
    statusCode = 200,
    pagination?: APIResponse<T>['pagination'],
    processingTime?: string
  ): NextResponse<APIResponse<T>> {
    const response: APIResponse<T> = {
      success: true,
      data,
      message,
      pagination,
      meta: {
        version: APIResponseBuilder.version,
        timestamp: new Date().toISOString(),
        processingTime,
      },
    };

    const headers = {
      ...getSecureResponseHeaders(),
      'Content-Type': 'application/json',
    };

    return NextResponse.json(response, { status: statusCode, headers });
  }

  static error(
    error: string,
    statusCode = 400,
    code?: string,
    details?: unknown,
    logToConsole = true
  ): NextResponse<APIErrorResponse> {
    const response: APIErrorResponse = {
      success: false,
      error,
      code,
      details: process.env.NODE_ENV === 'development' ? details : undefined, // Hide details in production
      meta: {
        version: APIResponseBuilder.version,
        timestamp: new Date().toISOString(),
      },
    };

    // Log security-relevant errors
    if (logToConsole && statusCode >= 400) {
      logError(`API Error (${statusCode})`, {
        error,
        code,
        statusCode,
        details: process.env.NODE_ENV === 'development' ? details : '[HIDDEN]',
      });
    }

    const headers = {
      ...getSecureResponseHeaders(),
      'Content-Type': 'application/json',
    };

    return NextResponse.json(response, { status: statusCode, headers });
  }

  static notFound(resource = 'Resource'): NextResponse<APIErrorResponse> {
    return APIResponseBuilder.error(`${resource} not found`, 404, 'NOT_FOUND');
  }

  static unauthorized(
    message = 'Authentication required'
  ): NextResponse<APIErrorResponse> {
    return APIResponseBuilder.error(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Access denied'): NextResponse<APIErrorResponse> {
    return APIResponseBuilder.error(message, 403, 'FORBIDDEN');
  }

  static badRequest(
    message = 'Invalid request',
    details?: unknown
  ): NextResponse<APIErrorResponse> {
    return APIResponseBuilder.error(message, 400, 'BAD_REQUEST', details);
  }

  static tooManyRequests(
    message = 'Rate limit exceeded'
  ): NextResponse<APIErrorResponse> {
    return APIResponseBuilder.error(message, 429, 'RATE_LIMIT_EXCEEDED');
  }

  static internalError(
    message = 'Internal server error'
  ): NextResponse<APIErrorResponse> {
    return APIResponseBuilder.error(message, 500, 'INTERNAL_ERROR');
  }

  static validationError(details: unknown): NextResponse<APIErrorResponse> {
    return APIResponseBuilder.error(
      'Validation failed',
      422,
      'VALIDATION_ERROR',
      details
    );
  }
}
