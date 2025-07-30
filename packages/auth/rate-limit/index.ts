// Re-export rate limiting utilities from security module
// This provides an alternative import path for backward compatibility
export {
  generalApiLimit,
  messageRateLimit,
  webhookRateLimit,
  paymentRateLimit,
  authRateLimit,
  checkRateLimit,
  withRateLimit,
} from '../security/rate-limits';

export type { RateLimitConfig, RateLimitStore } from '@repo/api/utils/api/middleware/rate-limiter';