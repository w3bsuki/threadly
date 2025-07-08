import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiError, ErrorCode } from './errors';

export interface ValidationContext {
  request: NextRequest;
  userId?: string;
  userRole?: string;
}

export async function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
  context?: ValidationContext
): Promise<T> {
  try {
    return await schema.parseAsync(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createApiError(
        ErrorCode.VALIDATION_FAILED,
        'Input validation failed',
        error.errors,
        context ? { 
          userId: context.userId,
          userRole: context.userRole,
          url: context.request.url 
        } : undefined
      );
    }
    throw error;
  }
}

export async function validateSearchParams<T>(
  schema: z.ZodSchema<T>,
  request: NextRequest,
  context?: Omit<ValidationContext, 'request'>
): Promise<T> {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  
  return validateInput(schema, params, { request, ...context });
}

export async function validateBody<T>(
  schema: z.ZodSchema<T>,
  request: NextRequest,
  context?: Omit<ValidationContext, 'request'>
): Promise<T> {
  try {
    const body = await request.json();
    return validateInput(schema, body, { request, ...context });
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
    return validateInput(schema, data, { request, ...context });
  } catch (error) {
    throw createApiError(
      ErrorCode.INVALID_INPUT,
      'Invalid form data'
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