import arcjet, {
  type ArcjetBotCategory,
  type ArcjetWellKnownBot,
  detectBot,
  request,
  shield,
} from '@arcjet/next';
import { keys } from './keys';

const arcjetKey = keys().ARCJET_KEY;

// Export rate limiting functions and utilities
export {
  generalApiLimit,
  authRateLimit,
  paymentRateLimit,
  uploadRateLimit,
  messageRateLimit,
  webhookRateLimit,
  checkRateLimit,
  type RateLimitResult,
} from './rate-limits';

// Export CSRF protection functions
export {
  generateCSRFToken,
  setCSRFCookie,
  getCSRFToken,
  validateCSRFToken,
  csrfMiddleware,
  initializeCSRFProtection,
  refreshCSRFToken,
  getCSRFTokenFromCookie,
  addCSRFHeader,
  type CSRFConfig,
} from './csrf';

// Export audit logging functions
export {
  createAuditLog,
  getAuditLogs,
  auditMiddleware,
  type AuditEventType,
  type AuditLogEntry,
} from './audit-log';

export {
  withAuditLog,
  logSecurityEvent,
} from './audit-middleware';

export const secure = async (
  allow: (ArcjetWellKnownBot | ArcjetBotCategory)[],
  sourceRequest?: Request
) => {
  if (!arcjetKey) {
    return;
  }

  const base = arcjet({
    // Get your site key from https://app.arcjet.com
    key: arcjetKey,
    // Identify the user by their IP address
    characteristics: ['ip.src'],
    rules: [
      // Protect against common attacks with Arcjet Shield
      shield({
        // Will block requests. Use "DRY_RUN" to log only
        mode: 'LIVE',
      }),
      // Other rules are added in different routes
    ],
  });

  const req = sourceRequest ?? (await request());
  const aj = base.withRule(detectBot({ mode: 'LIVE', allow }));
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      throw new Error('No bots allowed');
    }

    if (decision.reason.isRateLimit()) {
      throw new Error('Rate limit exceeded');
    }

    throw new Error('Access denied');
  }
};
