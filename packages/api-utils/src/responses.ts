import { NextResponse } from 'next/server';
import { type ErrorCode, parseError, StandardApiError } from './errors';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    context?: Record<string, unknown>;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export function createSuccessResponse<T>(
  data: T,
  options?: {
    pagination?: ApiSuccessResponse<T>['pagination'];
    meta?: Record<string, unknown>;
    status?: number;
    headers?: HeadersInit;
  }
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(options?.pagination && { pagination: options.pagination }),
    ...(options?.meta && { meta: options.meta }),
  };

  return NextResponse.json(response, {
    status: options?.status || 200,
    headers: options?.headers,
  });
}

export function createErrorResponse(
  error: unknown,
  options?: {
    status?: number;
    headers?: HeadersInit;
    logError?: boolean;
    errorCode?: ErrorCode;
    details?: unknown;
  }
): NextResponse<ApiErrorResponse> {
  const standardError = parseError(error);

  // Log error if requested (default: true for 5xx errors)
  const shouldLog = options?.logError ?? standardError.getStatusCode() >= 500;
  if (shouldLog) {
    // Import logging asynchronously to avoid circular dependencies
    import('@repo/observability/server')
      .then(({ logError }) => {
        logError('API Error:', standardError.toJSON());
      })
      .catch(() => {
        // Fallback to console if observability is not available
        console.error('API Error:', standardError.toJSON());
      });
  }

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: options?.errorCode || standardError.code,
      message: standardError.message,
      ...(options?.details
        ? { details: options.details }
        : standardError.details
          ? { details: standardError.details }
          : {}),
      ...(standardError.context ? { context: standardError.context } : {}),
    },
  };

  return NextResponse.json(response, {
    status: options?.status || standardError.getStatusCode(),
    headers: options?.headers,
  });
}

export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): ApiSuccessResponse<unknown>['pagination'] {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}

// Type guards for response checking
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isErrorResponse(
  response: ApiResponse
): response is ApiErrorResponse {
  return response.success === false;
}
