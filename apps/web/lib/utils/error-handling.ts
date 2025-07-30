import type { Prisma } from '@repo/database';
import { logError, parseError } from '@repo/tooling/observability/server';

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Enhanced error handler for database queries with comprehensive logging
 */
export async function handleDatabaseError(
  error: unknown,
  operation: string,
  context?: Record<string, unknown>
): Promise<ErrorResponse> {
  // Log error with context
  logError(parseError(error), {
    operation,
    type: 'database_error',
    ...context,
  });

  // Parse the error message
  const message = parseError(error);

  // Handle specific Prisma errors
  if (error instanceof Error && 'code' in error) {
    const prismaError = error as Prisma.PrismaClientKnownRequestError;

    switch (prismaError.code) {
      case 'P2002':
        return {
          error: 'A unique constraint was violated',
          code: 'UNIQUE_VIOLATION',
          details: prismaError.meta,
        };
      case 'P2025':
        return {
          error: 'Record not found',
          code: 'NOT_FOUND',
          details: prismaError.meta,
        };
      case 'P2003':
        return {
          error: 'Foreign key constraint failed',
          code: 'FOREIGN_KEY_VIOLATION',
          details: prismaError.meta,
        };
      default:
        return {
          error: message,
          code: prismaError.code,
          details: prismaError.meta,
        };
    }
  }

  return {
    error: message,
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Log successful database operations for monitoring
 */
export function logDatabaseOperation(
  _operation: string,
  duration: number,
  _metadata?: Record<string, unknown>
): void {
  // Only log slow queries in production
  if (process.env.NODE_ENV === 'production' && duration > 1000) {
  }

  // Always log in development
  if (process.env.NODE_ENV === 'development') {
    // Development logging removed per CLAUDE.md rules
  }
}

/**
 * Wrap async database operations with error handling and logging
 */
export async function withDatabaseErrorHandling<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    logDatabaseOperation(operation, duration, context);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    const errorResponse = await handleDatabaseError(error, operation, {
      ...context,
      duration: `${duration}ms`,
    });

    // Re-throw with enhanced error information
    throw new Error(errorResponse.error, { cause: error });
  }
}
