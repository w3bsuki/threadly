export * from './api-path';
export * from './currency';
export * from './decimal';
export * from './error-boundary';
export * from './hooks';
export * from './price';

// Validation functionality (merged from @repo/validation)
export * from './validation/index';
export * from './validation/middleware';
export * from './validation/sanitize';
export * from './validation/security-middleware';
export * from './validation/validators';
export * from './validation/schemas';

// API utilities (merged from @repo/api-utils)
export * from './api/errors';
export * from './api/responses';
export * from './api/trpc';

// Export specific middleware to avoid conflicts
export { 
  withAuth,
  type AuthConfig 
} from './api/middleware/auth';

export {
  RateLimiter,
  createRateLimiter,
  withRateLimit,
  rateLimitPresets,
  type RateLimitConfig
} from './api/middleware/rate-limiter';

export {
  withSecurityHeaders,
  apiSecurityHeaders,
  type SecurityHeadersConfig
} from './api/middleware/security-headers';

export {
  withApiVersion,
  defaultVersionConfig,
  type VersionConfig
} from './api/middleware/api-versioning';

// Export API validation with specific names to avoid conflicts
export {
  RequestValidator,
  createValidator,
  type ValidationResult,
  type ValidationError,
} from './api/validation/request-validator';

// Export API index without conflicts
export {
  createApiHandler,
  type ApiHandlerConfig,
} from './api/index';

// Export server actions without schema conflicts
export * from './api/actions/client';
export * from './api/actions/server';
export * from './api/actions/types';
export * from './api/actions/errors/action-error';
export * from './api/actions/hooks/use-server-action';
export * from './api/actions/components/action-error-boundary';
export * from './api/actions/components/loading-states';
export * from './api/actions/utils/cache-strategies';
export * from './api/actions/utils/create-action';
export * from './api/actions/utils/data-fetching';

// Export action schemas with namespace prefix to avoid conflicts
export {
  idSchema as actionIdSchema,
  imageSchema as actionImageSchema,
  fileSchema as actionFileSchema,
  searchSchema as actionSearchSchema,
  sanitizeString,
  transformPagination,
  transformSort,
} from './api/actions/validation/schemas';
