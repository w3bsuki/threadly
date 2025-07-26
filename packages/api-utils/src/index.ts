// Error handling
export * from './errors/api-error'
export * from './errors/error-handler'

// Response utilities
export * from './responses/api-response'

// Validation
export * from './validation/request-validator'
export * from './validation/sanitizer'

// Middleware
export * from './middleware/rate-limiter'
export * from './middleware/api-versioning'
export * from './middleware/security-headers'
export * from './middleware/auth'

// Composite middleware
import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from './errors/error-handler'
import { withRateLimit, RateLimitConfig, rateLimitPresets } from './middleware/rate-limiter'
import { withApiVersion, VersionConfig, defaultVersionConfig } from './middleware/api-versioning'
import { withSecurityHeaders, SecurityHeadersConfig, apiSecurityHeaders } from './middleware/security-headers'
import { withAuth, AuthConfig } from './middleware/auth'

export interface ApiHandlerConfig {
  rateLimit?: RateLimitConfig | false
  version?: VersionConfig | false
  security?: SecurityHeadersConfig | false
  auth?: AuthConfig | false
  errorHandling?: boolean
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
  } = config

  let wrappedHandler = handler

  if (auth !== false) {
    wrappedHandler = withAuth(wrappedHandler, auth)
  }

  if (security !== false) {
    wrappedHandler = withSecurityHeaders(wrappedHandler, security)
  }

  if (version !== false) {
    wrappedHandler = withApiVersion(wrappedHandler, version)
  }

  if (rateLimit !== false) {
    wrappedHandler = withRateLimit(wrappedHandler, rateLimit)
  }

  if (errorHandling) {
    wrappedHandler = withErrorHandler(wrappedHandler)
  }

  return wrappedHandler
}