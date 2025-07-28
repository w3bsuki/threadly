'use server';

import { auth } from '@clerk/nextjs/server';
import { createAuditLog } from '@repo/database';
import { revalidatePath, revalidateTag } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { type ZodSchema, z } from 'zod';
import { ActionError } from '../errors/action-error';
import type {
  ActionContext,
  ActionOptions,
  CreateActionOptions,
  ServerActionResult,
} from '../types';

export function createServerAction<TInput, TOutput>(
  inputSchema: ZodSchema<TInput>,
  handler: (input: TInput, context: ActionContext) => Promise<TOutput>,
  options?: CreateActionOptions
) {
  return async (rawInput: unknown): Promise<ServerActionResult<TOutput>> => {
    try {
      // Create context
      const context = await createContext();

      // Check authentication if required
      if (options?.auth?.required) {
        if (!context.userId) {
          return {
            success: false,
            error: {
              message: 'Authentication required',
              code: 'UNAUTHORIZED',
            },
          };
        }

        // Check roles/permissions if specified
        if (options.auth.roles || options.auth.permissions) {
          const hasAccess = await checkAccess(
            context.userId,
            options.auth.roles,
            options.auth.permissions
          );

          if (!hasAccess) {
            return {
              success: false,
              error: {
                message: 'Insufficient permissions',
                code: 'FORBIDDEN',
              },
            };
          }
        }
      }

      // Rate limiting
      if (options?.rateLimit) {
        const isAllowed = await checkRateLimit(
          context.userId || context.ipAddress || 'anonymous',
          options.rateLimit.limit,
          options.rateLimit.window
        );

        if (!isAllowed) {
          return {
            success: false,
            error: {
              message: 'Rate limit exceeded',
              code: 'RATE_LIMIT_EXCEEDED',
            },
          };
        }
      }

      // Validate input
      const validationResult = inputSchema.safeParse(rawInput);

      if (!validationResult.success) {
        return {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: validationResult.error.flatten().fieldErrors,
          },
        };
      }

      // Check cache if enabled
      if (options?.cache?.enabled && options.cache.key) {
        const cacheKey = options.cache.key(validationResult.data);
        const cached = await getCached<TOutput>(cacheKey);

        if (cached !== null) {
          return {
            success: true,
            data: cached,
          };
        }
      }

      // Run middleware
      if (options?.middleware) {
        for (const middleware of options.middleware) {
          await middleware(context, async () => {});
        }
      }

      // Execute handler
      const result = await handler(validationResult.data, context);

      // Cache result if enabled
      if (options?.cache?.enabled && options.cache.key) {
        const cacheKey = options.cache.key(validationResult.data);
        await setCached(cacheKey, result, options.cache.ttl);
      }

      // Log action
      await logAction(context, 'success', {
        action: handler.name,
        input: validationResult.data,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      // Log error
      await logAction(await createContext(), 'error', {
        action: handler.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof ActionError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            field: error.field,
            details: error.details,
          },
        };
      }

      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
      };
    }
  };
}

async function createContext(): Promise<ActionContext> {
  const { userId } = await auth();
  const headersList = await headers();

  return {
    userId: userId || undefined,
    ipAddress:
      headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      undefined,
    userAgent: headersList.get('user-agent') || undefined,
    requestId: crypto.randomUUID(),
  };
}

async function checkAccess(
  userId: string,
  roles?: string[],
  permissions?: string[]
): Promise<boolean> {
  // Implementation would check user roles/permissions in database
  // For now, return true as placeholder
  return true;
}

async function checkRateLimit(
  key: string,
  limit: number,
  window: number
): Promise<boolean> {
  // Implementation would use Redis or similar for rate limiting
  // For now, return true as placeholder
  return true;
}

async function getCached<T>(key: string): Promise<T | null> {
  // Implementation would use Redis or similar for caching
  // For now, return null as placeholder
  return null;
}

async function setCached<T>(
  key: string,
  value: T,
  ttl?: number
): Promise<void> {
  // Implementation would use Redis or similar for caching
  // For now, do nothing as placeholder
}

async function logAction(
  context: ActionContext,
  status: 'success' | 'error',
  metadata: Record<string, any>
): Promise<void> {
  // Implementation would log to database or monitoring service
  // For now, do nothing as placeholder
}

export function withOptions<TInput, TOutput>(
  action: (input: TInput) => Promise<ServerActionResult<TOutput>>,
  options: ActionOptions
) {
  return async (input: TInput): Promise<ServerActionResult<TOutput>> => {
    const result = await action(input);

    if (result.success && options) {
      // Handle revalidation
      if (options.revalidatePaths) {
        for (const path of options.revalidatePaths) {
          revalidatePath(path);
        }
      }

      if (options.revalidateTags) {
        for (const tag of options.revalidateTags) {
          revalidateTag(tag);
        }
      }

      // Handle cookies
      if (options.cookies) {
        const cookieStore = await cookies();
        for (const cookie of options.cookies) {
          cookieStore.set(cookie.name, cookie.value, cookie.options);
        }
      }
    }

    return result;
  };
}
