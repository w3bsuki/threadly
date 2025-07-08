import { NextResponse } from 'next/server';
import { z } from 'zod';

export enum ErrorCode {
  // Validation errors (400-422)
  INVALID_INPUT = 'INVALID_INPUT',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Authentication/Authorization errors (401-403)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Resource errors (404-409)
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server errors (500+)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export const ERROR_STATUS_MAPPING: Record<ErrorCode, number> = {
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.VALIDATION_FAILED]: 422,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ALREADY_EXISTS]: 409,
  [ErrorCode.CONFLICT]: 409,
  
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
};

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: unknown;
  context?: Record<string, unknown>;
}

export class StandardApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'StandardApiError';
  }

  toJSON(): ApiError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      context: this.context,
    };
  }

  getStatusCode(): number {
    return ERROR_STATUS_MAPPING[this.code] || 500;
  }
}

export function createApiError(
  code: ErrorCode,
  message: string,
  details?: unknown,
  context?: Record<string, unknown>
): StandardApiError {
  return new StandardApiError(code, message, details, context);
}

export function parseError(error: unknown): StandardApiError {
  if (error instanceof StandardApiError) {
    return error;
  }

  if (error instanceof z.ZodError) {
    return createApiError(
      ErrorCode.VALIDATION_FAILED,
      'Input validation failed',
      error.errors
    );
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('not found') || error.message.includes('404')) {
      return createApiError(ErrorCode.NOT_FOUND, error.message);
    }
    
    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return createApiError(ErrorCode.UNAUTHORIZED, error.message);
    }
    
    if (error.message.includes('forbidden') || error.message.includes('403')) {
      return createApiError(ErrorCode.FORBIDDEN, error.message);
    }

    // Default to internal error
    return createApiError(
      ErrorCode.INTERNAL_ERROR,
      'An unexpected error occurred',
      error.message
    );
  }

  // Unknown error type
  return createApiError(
    ErrorCode.INTERNAL_ERROR,
    'An unknown error occurred',
    String(error)
  );
}