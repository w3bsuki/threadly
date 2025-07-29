/**
 * Bulk operation schemas and types
 */

import { z } from 'zod';
import type { Price } from './common-types';

// Bulk operation types enum
export enum BulkOperationType {
  ACTIVATE = 'ACTIVATE',
  DEACTIVATE = 'DEACTIVATE',
  DELETE = 'DELETE',
  ARCHIVE = 'ARCHIVE',
  UNARCHIVE = 'UNARCHIVE',
  PUBLISH = 'PUBLISH',
  UNPUBLISH = 'UNPUBLISH',
  PRICE_UPDATE = 'PRICE_UPDATE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  CATEGORY_UPDATE = 'CATEGORY_UPDATE',
  CONDITION_UPDATE = 'CONDITION_UPDATE',
  BRAND_UPDATE = 'BRAND_UPDATE',
  SIZE_UPDATE = 'SIZE_UPDATE',
  COLOR_UPDATE = 'COLOR_UPDATE',
}

// Bulk update data interface
export interface BulkUpdateData {
  price?: Price;
  status?: string;
  categoryId?: string;
  condition?: string;
  brand?: string;
  size?: string;
  color?: string;
}

// Bulk operation status enum
export enum BulkOperationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
}

// Bulk operation result interface
export interface BulkOperationResult {
  operationId: string;
  status: BulkOperationStatus;
  totalItems: number;
  processedItems: number;
  successCount: number;
  errorCount: number;
  skippedCount?: number;
  errors?: BulkOperationError[];
  createdAt: Date;
  completedAt?: Date;
}

// Bulk operation error interface
export interface BulkOperationError {
  itemId: string;
  error: string;
  details?: unknown;
}

// Bulk operation request schema
export const bulkOperationRequestSchema = z.object({
  productIds: z
    .array(z.string())
    .min(1, 'At least one product ID is required')
    .max(100, 'Maximum 100 products can be updated at once'),
  operation: z.nativeEnum(BulkOperationType),
  data: z
    .object({
      price: z.number().positive().optional(),
      status: z.string().optional(),
      categoryId: z.string().optional(),
      condition: z.string().optional(),
      brand: z.string().optional(),
      size: z.string().optional(),
      color: z.string().optional(),
    })
    .optional(),
});

export type BulkOperationRequest = z.infer<typeof bulkOperationRequestSchema>;

// Bulk delete request schema
export const bulkDeleteRequestSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
  type: z.enum(['soft', 'hard']).default('soft'),
  reason: z.string().optional(),
});

export type BulkDeleteRequest = z.infer<typeof bulkDeleteRequestSchema>;

// Bulk status update schema
export const bulkStatusUpdateSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SOLD', 'RESERVED', 'PENDING']),
});

export type BulkStatusUpdate = z.infer<typeof bulkStatusUpdateSchema>;
