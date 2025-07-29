// Error handling
export * from './errors/api-error';
export * from './errors/error-handler';
export * from './middleware/api-versioning';
export * from './middleware/auth';
// Middleware
export * from './middleware/rate-limiter';
export * from './middleware/security-headers';
// Response utilities
export * from './responses/api-response';
// Validation
export * from './validation/request-validator';
export * from './validation/sanitizer';

// Server Actions (merged from @repo/server-actions)
export * from './actions/client';
export * from './actions/server';
export * from './actions/types';
export * from './actions/errors/action-error';
export * from './actions/hooks/use-server-action';
export * from './actions/components/action-error-boundary';
export * from './actions/components/loading-states';
export * from './actions/utils/cache-strategies';
export * from './actions/utils/create-action';
export * from './actions/utils/data-fetching';
export * from './actions/validation/schemas';

// tRPC Client Integration
export * from './trpc';

// Composite middleware
import type { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from './errors/error-handler';
import {
  defaultVersionConfig,
  type VersionConfig,
  withApiVersion,
} from './middleware/api-versioning';
import { type AuthConfig, withAuth } from './middleware/auth';
import {
  type RateLimitConfig,
  rateLimitPresets,
  withRateLimit,
} from './middleware/rate-limiter';
import {
  apiSecurityHeaders,
  type SecurityHeadersConfig,
  withSecurityHeaders,
} from './middleware/security-headers';

export interface ApiHandlerConfig {
  rateLimit?: RateLimitConfig | false;
  version?: VersionConfig | false;
  security?: SecurityHeadersConfig | false;
  auth?: AuthConfig | false;
  errorHandling?: boolean;
}

export const createApiHandler = (
  handler: (req: NextRequest, params: any) => Promise<NextResponse>,
  config: ApiHandlerConfig = {}
) => {
  const {
    rateLimit = rateLimitPresets.standard,
    version = defaultVersionConfig,
    security = apiSecurityHeaders,
    auth = false,
    errorHandling = true,
  } = config;

  let wrappedHandler = handler;

  if (auth !== false) {
    wrappedHandler = withAuth(wrappedHandler, auth);
  }

  if (security !== false) {
    wrappedHandler = withSecurityHeaders(wrappedHandler, security);
  }

  if (version !== false) {
    wrappedHandler = withApiVersion(wrappedHandler, version);
  }

  if (rateLimit !== false) {
    wrappedHandler = withRateLimit(wrappedHandler, rateLimit);
  }

  if (errorHandling) {
    wrappedHandler = withErrorHandler(wrappedHandler);
  }

  return wrappedHandler;
};
