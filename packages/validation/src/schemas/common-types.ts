import { z } from 'zod';

// Price and Currency
export const PriceSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  formatted: z.string().optional(), // e.g., "$99.99"
});

export type Price = z.infer<typeof PriceSchema>;

// Pagination
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  total: z.number().int().min(0).optional(),
  totalPages: z.number().int().min(0).optional(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// API Response
export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  details: z.unknown().optional(),
  timestamp: z.string().datetime().optional(),
});

export type APIResponse<T = unknown> = Omit<
  z.infer<typeof APIResponseSchema>,
  'data'
> & {
  data?: T;
};

// Paginated Response
export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: PaginationSchema,
  });

export type PaginatedResponse<T> = {
  items: T[];
  pagination: Pagination;
};

// Dictionary (for translations)
export const DictionarySchema = z.record(z.string(), z.unknown());
export type Dictionary = z.infer<typeof DictionarySchema>;

// File Upload
export const FileUploadSchema = z.object({
  url: z.string().url(),
  fileName: z.string(),
  fileSize: z.number().int().positive(),
  mimeType: z.string(),
  uploadedAt: z.date().optional(),
});

export type FileUpload = z.infer<typeof FileUploadSchema>;

// Sort Options
export const SortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof SortOrderSchema>;

export const SortBySchema = z.object({
  field: z.string(),
  order: SortOrderSchema,
});

export type SortBy = z.infer<typeof SortBySchema>;

// Date Range
export const DateRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
});

export type DateRange = z.infer<typeof DateRangeSchema>;

// Metadata
export const MetadataSchema = z.record(z.string(), z.unknown());
export type Metadata = z.infer<typeof MetadataSchema>;

// Error Details
export const ErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
  details: z.unknown().optional(),
});

export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;

// Validation Error
export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string().optional(),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;

// Form Data Types
export const FormErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
});

export type FormError = z.infer<typeof FormErrorSchema>;

// Location
export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export type Location = z.infer<typeof LocationSchema>;

// Analytics Event
export const AnalyticsEventSchema = z.object({
  name: z.string(),
  category: z.string(),
  action: z.string(),
  label: z.string().optional(),
  value: z.number().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  metadata: MetadataSchema.optional(),
  timestamp: z.date(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

// Notification Type
export const NotificationTypeSchema = z.enum([
  'ORDER',
  'MESSAGE',
  'SYSTEM',
  'MARKETING',
  'PRICE_DROP',
  'NEW_FOLLOWER',
  'REVIEW',
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

// Action Result
export const ActionResultSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  validationErrors: z.array(ValidationErrorSchema).optional(),
});

export type ActionResult<T = unknown> = Omit<
  z.infer<typeof ActionResultSchema>,
  'data'
> & {
  data?: T;
};
