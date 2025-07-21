import { database } from '@repo/database';
import { log } from '@repo/observability/server';

export type AuditEventType = 
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTER'
  | 'USER_UPDATE_PROFILE'
  | 'USER_DELETE_ACCOUNT'
  | 'PRODUCT_CREATE'
  | 'PRODUCT_UPDATE'
  | 'PRODUCT_DELETE'
  | 'PRODUCT_PUBLISH'
  | 'PRODUCT_UNPUBLISH'
  | 'ORDER_CREATE'
  | 'ORDER_UPDATE'
  | 'ORDER_CANCEL'
  | 'ORDER_COMPLETE'
  | 'PAYMENT_PROCESS'
  | 'PAYMENT_REFUND'
  | 'SELLER_ONBOARD'
  | 'SELLER_UPDATE_BANK'
  | 'ADMIN_ACCESS'
  | 'ADMIN_ACTION'
  | 'SECURITY_ALERT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'CSRF_VIOLATION'
  | 'SUSPICIOUS_ACTIVITY';

export interface AuditLogEntry {
  userId?: string;
  eventType: AuditEventType;
  resourceType?: 'user' | 'product' | 'order' | 'payment' | 'seller' | 'admin' | 'security';
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await database.auditLog.create({
      data: {
        userId: entry.userId,
        eventType: entry.eventType,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : {},
        severity: entry.severity || 'low',
      },
    });

    if (entry.severity === 'critical' || entry.severity === 'high') {
      log.error('High severity audit event', entry);
    }
  } catch (error) {
    log.error('Failed to create audit log', { error, entry });
  }
}

export async function getAuditLogs(filters: {
  userId?: string;
  eventType?: AuditEventType;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  severity?: string;
  limit?: number;
}) {
  const where: Record<string, unknown> = {};
  
  if (filters.userId) where.userId = filters.userId;
  if (filters.eventType) where.eventType = filters.eventType;
  if (filters.resourceType) where.resourceType = filters.resourceType;
  if (filters.severity) where.severity = filters.severity;
  
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) (where.createdAt as Record<string, Date>).gte = filters.startDate;
    if (filters.endDate) (where.createdAt as Record<string, Date>).lte = filters.endDate;
  }

  return database.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: filters.limit || 100,
  });
}

export function auditMiddleware(req: Request): Partial<AuditLogEntry> {
  const headers = req.headers;
  
  return {
    ipAddress: headers.get('x-forwarded-for')?.split(',')[0] || 
               headers.get('x-real-ip') || 
               'unknown',
    userAgent: headers.get('user-agent') || undefined,
  };
}