import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiError, ErrorCode } from './errors';

export interface ValidationContext {
  request: NextRequest;
  userId?: string;
  userRole?: string;
}

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: z.ZodError };

export function validateInput<T>(
  input: unknown,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export async function validateSearchParams<T>(
  schema: z.ZodSchema<T>,
  request: NextRequest,
  context?: Omit<ValidationContext, 'request'>
): Promise<T> {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  
  const result = validateInput(params, schema);
  if (!result.success) {
    throw createApiError(
      ErrorCode.VALIDATION_FAILED,
      'Search params validation failed',
      result.error.errors,
      context ? { 
        userId: context.userId,
        userRole: context.userRole,
        url: request.url 
      } : undefined
    );
  }
  return result.data;
}

export async function validateBody<T>(
  schema: z.ZodSchema<T>,
  request: NextRequest,
  context?: Omit<ValidationContext, 'request'>
): Promise<T> {
  try {
    const body = await request.json();
    const result = validateInput(body, schema);
    if (!result.success) {
      throw createApiError(
        ErrorCode.VALIDATION_FAILED,
        'Body validation failed',
        result.error.errors,
        context ? { 
          userId: context.userId,
          userRole: context.userRole,
          url: request.url 
        } : undefined
      );
    }
    return result.data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw createApiError(
        ErrorCode.INVALID_INPUT,
        'Invalid JSON in request body'
      );
    }
    throw error;
  }
}

export async function validateFormData<T>(
  schema: z.ZodSchema<T>,
  request: NextRequest,
  context?: Omit<ValidationContext, 'request'>
): Promise<T> {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });
    const result = validateInput(data, schema);
    if (!result.success) {
      throw createApiError(
        ErrorCode.VALIDATION_FAILED,
        'Form data validation failed',
        result.error.errors,
        context ? { 
          userId: context.userId,
          userRole: context.userRole,
          url: request.url 
        } : undefined
      );
    }
    return result.data;
  } catch (error) {
    if (error instanceof createApiError) {
      throw error;
    }
    throw createApiError(
      ErrorCode.INVALID_INPUT,
      'Failed to parse form data'
    );
  }
}

// Common validation schemas
export const PaginationSchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).pipe(z.number().min(1)),
  limit: z.string().transform(val => parseInt(val) || 20).pipe(z.number().min(1).max(100)),
});

export const IdSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const SearchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'price-low', 'price-high', 'popular']).optional(),
});

export type PaginationParams = z.infer<typeof PaginationSchema>;
export type IdParams = z.infer<typeof IdSchema>;
export type SearchParams = z.infer<typeof SearchSchema>;