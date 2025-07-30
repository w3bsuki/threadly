/**
 * Client-safe exports for validation schemas
 * These can be safely imported in client components
 */

export type { ZodError, ZodIssue } from 'zod';
export { z } from 'zod';

// Export only the schemas (no server-side utilities)
export * from './schemas/common-types';
export * from './schemas/message-types';
export * from './schemas/order-types';
export * from './schemas/product-types';
export * from './schemas/search-filters';
export * from './schemas/user-types';
export * from './schemas/common';
export * from './schemas/index';

// Export client-safe validators
export * from './validators';