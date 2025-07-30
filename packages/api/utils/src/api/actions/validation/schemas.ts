import { z } from 'zod';

// Common validation schemas
export const idSchema = z.string().cuid('Invalid ID format');

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()
  .trim();

export const urlSchema = z
  .string()
  .url('Invalid URL')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'URL must start with http:// or https://'
  );

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

export const currencySchema = z
  .number()
  .positive('Amount must be positive')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places')
  .max(999_999.99, 'Amount too large');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: 'Start date must be before end date',
      path: ['endDate'],
    }
  );

// File upload schemas
export const imageSchema = z.object({
  url: urlSchema,
  alt: z.string().max(255).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const fileSchema = z.object({
  name: z.string().max(255),
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024), // 10MB max
  type: z.string(),
  url: urlSchema,
});

// Common entity schemas
export const addressSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  company: z.string().max(100).optional(),
  streetLine1: z.string().min(1).max(255),
  streetLine2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  zipCode: z.string().min(1).max(20),
  country: z.string().length(2).default('US'),
  phone: phoneSchema.optional(),
});

// Search schemas
export const searchSchema = z.object({
  query: z.string().min(1).max(100).trim(),
  filters: z.record(z.any()).optional(),
});

// Sanitization helpers
export const sanitizeString = (value: string, maxLength = 255): string => {
  return value
    .trim()
    .replace(/[<>'"]/g, '')
    .substring(0, maxLength);
};

export const sanitizeHtml = (html: string): string => {
  // Simple HTML sanitization - in production use DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Transform helpers
export const transformPagination = (
  input: z.infer<typeof paginationSchema>
) => ({
  skip: (input.page - 1) * input.limit,
  take: input.limit,
});

export const transformSort = (
  input: z.infer<typeof sortSchema>,
  allowedFields: string[]
) => {
  if (!(input.sortBy && allowedFields.includes(input.sortBy))) {
    return;
  }

  return {
    [input.sortBy]: input.sortOrder,
  };
};
