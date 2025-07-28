/**
 * API monitoring middleware and utilities for Threadly marketplace
 */

import * as Sentry from '@sentry/nextjs';
import { type NextRequest, NextResponse } from 'next/server';
import { log } from './log';
import { trackApiPerformance } from './marketplace-context';

export interface APIMonitoringConfig {
  enablePerformanceTracking?: boolean;
  enableErrorTracking?: boolean;
  slowThresholdMs?: number;
  excludePaths?: string[];
}

const defaultConfig: Required<APIMonitoringConfig> = {
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  slowThresholdMs: 1000,
  excludePaths: ['/api/health', '/api/ping', '/_next'],
};

/**
 * Enhanced API monitoring wrapper for Next.js API routes
 */
export function withAPIMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  config: APIMonitoringConfig = {}
) {
  const finalConfig = { ...defaultConfig, ...config };

  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    const startTime = Date.now();
    const endpoint = request.nextUrl.pathname;
    const method = request.method;

    // Skip monitoring for excluded paths
    if (finalConfig.excludePaths.some((path) => endpoint.startsWith(path))) {
      return handler(...args);
    }

    let response: NextResponse;
    let error: Error | null = null;
    let hasDatabase = false;
    let hasStripe = false;
    let cacheHit: boolean | undefined;

    try {
      // Track the operation with enhanced context
      response = await Sentry.withScope(async (scope) => {
        scope.setTag('api.endpoint', endpoint);
        scope.setTag('api.method', method);
        scope.setTag('api.app', 'marketplace');

        // Extract user ID from auth if available
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
          scope.setTag('api.authenticated', 'true');
        }

        // Track the actual API call
        const result = await handler(...args);

        // Extract additional context from response headers
        hasDatabase = result.headers.get('x-database-used') === 'true';
        hasStripe = result.headers.get('x-stripe-used') === 'true';
        const cacheHeader = result.headers.get('x-cache-status');
        if (cacheHeader) {
          cacheHit = cacheHeader === 'hit';
        }

        return result;
      });
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));

      if (finalConfig.enableErrorTracking) {
        Sentry.withScope((scope) => {
          scope.setTag('api.endpoint', endpoint);
          scope.setTag('api.method', method);
          scope.setTag('api.error', 'true');
          scope.setLevel('error');

          Sentry.captureException(error);
        });
      }

      // Create error response
      response = NextResponse.json(
        {
          error: 'Internal server error',
          timestamp: new Date().toISOString(),
          path: endpoint,
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    const statusCode = response.status;

    // Track performance if enabled
    if (finalConfig.enablePerformanceTracking) {
      trackApiPerformance({
        endpoint,
        method,
        duration,
        statusCode,
        hasDatabase,
        hasStripe,
        cacheHit,
      });
    }

    // Log the operation
    const logLevel = error ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const logMessage = `${method} ${endpoint} - ${statusCode} - ${duration}ms`;

    log[logLevel](logMessage, {
      endpoint,
      method,
      statusCode,
      duration,
      error: error?.message,
      hasDatabase,
      hasStripe,
      cacheHit,
      slow: duration > finalConfig.slowThresholdMs,
    });

    // Add monitoring headers
    response.headers.set('x-response-time', duration.toString());
    if (hasDatabase) response.headers.set('x-database-used', 'true');
    if (hasStripe) response.headers.set('x-stripe-used', 'true');
    if (cacheHit !== undefined)
      response.headers.set('x-cache-status', cacheHit ? 'hit' : 'miss');

    return response;
  };
}

/**
 * Middleware for database operation monitoring
 */
export function trackDatabaseOperation<T>(
  operation: string,
  table: string,
  fn: () => Promise<T>
): Promise<T> {
  return Sentry.withScope(async (scope) => {
    const startTime = Date.now();

    scope.setTag('db.operation', operation);
    scope.setTag('db.table', table);

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      scope.setTag('db.success', 'true');
      scope.setTag('db.duration', duration.toString());

      if (duration > 500) {
        scope.setTag('db.slow', 'true');
      }

      log.info(`Database operation: ${operation} on ${table}`, {
        operation,
        table,
        duration,
        slow: duration > 500,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      scope.setTag('db.success', 'false');
      scope.setTag('db.duration', duration.toString());
      scope.setLevel('error');

      log.error(`Database operation failed: ${operation} on ${table}`, {
        operation,
        table,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });

      Sentry.captureException(error);
      throw error;
    }
  });
}

/**
 * Track Stripe operations with enhanced context
 */
export function trackStripeOperation<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  return Sentry.withScope(async (scope) => {
    const startTime = Date.now();

    scope.setTag('stripe.operation', operation);
    scope.setTag('external.service', 'stripe');

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      scope.setTag('stripe.success', 'true');
      scope.setTag('stripe.duration', duration.toString());

      log.info(`Stripe operation: ${operation}`, {
        operation,
        duration,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      scope.setTag('stripe.success', 'false');
      scope.setTag('stripe.duration', duration.toString());
      scope.setLevel('error');

      log.error(`Stripe operation failed: ${operation}`, {
        operation,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });

      Sentry.captureException(error);
      throw error;
    }
  });
}

/**
 * Cache operation tracking
 */
export function trackCacheOperation<T>(
  operation: 'get' | 'set' | 'delete' | 'clear',
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  return Sentry.withScope(async (scope) => {
    const startTime = Date.now();

    scope.setTag('cache.operation', operation);
    scope.setTag('cache.key', key);

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      scope.setTag('cache.success', 'true');
      scope.setTag('cache.duration', duration.toString());

      log.info(`Cache operation: ${operation}`, {
        operation,
        key,
        duration,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      scope.setTag('cache.success', 'false');
      scope.setTag('cache.duration', duration.toString());

      log.error(`Cache operation failed: ${operation}`, {
        operation,
        key,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });

      Sentry.captureException(error);
      throw error;
    }
  });
}

/**
 * Upload operation tracking for product images
 */
export function trackUploadOperation<T>(
  fileName: string,
  fileSize: number,
  fileType: string,
  fn: () => Promise<T>
): Promise<T> {
  return Sentry.withScope(async (scope) => {
    const startTime = Date.now();

    scope.setTag('upload.file_name', fileName);
    scope.setTag('upload.file_size', fileSize.toString());
    scope.setTag('upload.file_type', fileType);

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      scope.setTag('upload.success', 'true');
      scope.setTag('upload.duration', duration.toString());

      log.info('Upload operation completed', {
        fileName,
        fileSize,
        fileType,
        duration,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      scope.setTag('upload.success', 'false');
      scope.setTag('upload.duration', duration.toString());
      scope.setLevel('error');

      log.error('Upload operation failed', {
        fileName,
        fileSize,
        fileType,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });

      Sentry.captureException(error);
      throw error;
    }
  });
}

/**
 * Business logic operation tracking
 */
export function trackBusinessOperation<T>(
  operation: string,
  context: Record<string, any>,
  fn: () => Promise<T>
): Promise<T> {
  return Sentry.withScope(async (scope) => {
    const startTime = Date.now();

    scope.setTag('business.operation', operation);

    // Add context as tags (limited to simple values)
    Object.entries(context).forEach(([key, value]) => {
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        scope.setTag(`business.${key}`, String(value));
      }
    });

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      scope.setTag('business.success', 'true');
      scope.setTag('business.duration', duration.toString());

      log.info(`Business operation: ${operation}`, {
        operation,
        duration,
        context,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      scope.setTag('business.success', 'false');
      scope.setTag('business.duration', duration.toString());
      scope.setLevel('error');

      log.error(`Business operation failed: ${operation}`, {
        operation,
        duration,
        context,
        error: error instanceof Error ? error.message : String(error),
      });

      Sentry.captureException(error);
      throw error;
    }
  });
}
