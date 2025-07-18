import { createAuditLog, auditMiddleware, type AuditEventType } from './audit-log';
import { currentUser } from '@repo/auth/server';

interface AuditConfig {
  eventType: AuditEventType;
  resourceType?: 'user' | 'product' | 'order' | 'payment' | 'seller' | 'admin' | 'security';
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export function withAuditLog(config: AuditConfig) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const request = args[0] as Request;
      const user = await currentUser();
      const auditInfo = auditMiddleware(request);

      try {
        const result = await originalMethod.apply(this, args);
        
        await createAuditLog({
          userId: user?.id,
          eventType: config.eventType,
          resourceType: config.resourceType,
          resourceId: typeof result === 'object' && result !== null && 'id' in result 
            ? String(result.id) 
            : undefined,
          ...auditInfo,
          metadata: {
            success: true,
            method: request.method,
            path: new URL(request.url).pathname,
          },
          severity: config.severity || 'low',
        });

        return result;
      } catch (error) {
        await createAuditLog({
          userId: user?.id,
          eventType: config.eventType,
          resourceType: config.resourceType,
          ...auditInfo,
          metadata: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            method: request.method,
            path: new URL(request.url).pathname,
          },
          severity: 'high',
        });

        throw error;
      }
    };

    return descriptor;
  };
}

export async function logSecurityEvent(
  eventType: Extract<AuditEventType, 'SECURITY_ALERT' | 'RATE_LIMIT_EXCEEDED' | 'CSRF_VIOLATION' | 'SUSPICIOUS_ACTIVITY'>,
  request: Request,
  metadata?: Record<string, unknown>
) {
  const user = await currentUser();
  const auditInfo = auditMiddleware(request);

  await createAuditLog({
    userId: user?.id,
    eventType,
    resourceType: 'security',
    ...auditInfo,
    metadata: {
      ...metadata,
      method: request.method,
      path: new URL(request.url).pathname,
      timestamp: new Date().toISOString(),
    },
    severity: 'critical',
  });
}