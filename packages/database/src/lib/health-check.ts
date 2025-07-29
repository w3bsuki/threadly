import { PrismaClient } from '../../generated/client';
import { poolMonitor } from './pool-monitor';

export interface DatabaseHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  details: {
    connected: boolean;
    responseTime: number;
    poolStatus: {
      activeConnections: number;
      idleConnections: number;
      totalConnections: number;
      maxConnections: number;
      utilizationPercent: number;
    };
    recentErrors: {
      connection: number;
      timeout: number;
      query: number;
    };
    performance: {
      avgQueryTime: number;
      p95QueryTime: number;
      p99QueryTime: number;
    };
  };
  issues: string[];
}

export async function checkDatabaseHealth(prisma: PrismaClient): Promise<DatabaseHealthCheck> {
  const startTime = Date.now();
  let connected = false;
  let responseTime = 0;

  try {
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1`;
    connected = true;
    responseTime = Date.now() - startTime;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  // Get pool metrics
  const metrics = await poolMonitor.collectMetrics(prisma);
  const healthStatus = poolMonitor.getHealthStatus();

  // Calculate utilization percentage
  const utilizationPercent = metrics.stats.maxConnections > 0
    ? (metrics.stats.activeConnections / metrics.stats.maxConnections) * 100
    : 0;

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  const issues: string[] = [...healthStatus.issues];

  if (!connected) {
    status = 'unhealthy';
    issues.unshift('Database connection failed');
  } else if (responseTime > 1000) {
    status = 'degraded';
    issues.push(`Slow database response time: ${responseTime}ms`);
  }

  if (utilizationPercent > 90) {
    status = 'unhealthy';
  } else if (utilizationPercent > 70 || issues.length > 0) {
    status = status === 'unhealthy' ? 'unhealthy' : 'degraded';
  }

  return {
    status,
    timestamp: new Date(),
    details: {
      connected,
      responseTime,
      poolStatus: {
        activeConnections: metrics.stats.activeConnections,
        idleConnections: metrics.stats.idleConnections,
        totalConnections: metrics.stats.totalConnections,
        maxConnections: metrics.stats.maxConnections,
        utilizationPercent: Math.round(utilizationPercent * 100) / 100,
      },
      recentErrors: {
        connection: metrics.errors.connectionErrors,
        timeout: metrics.errors.timeoutErrors,
        query: metrics.errors.queryErrors,
      },
      performance: {
        avgQueryTime: Math.round(metrics.queryDuration.avg),
        p95QueryTime: Math.round(metrics.queryDuration.p95),
        p99QueryTime: Math.round(metrics.queryDuration.p99),
      },
    },
    issues,
  };
}

// Helper function to format health check for logging
export function formatHealthCheckForLogging(health: DatabaseHealthCheck): string {
  const lines = [
    `Database Health Check - ${health.status.toUpperCase()}`,
    `Timestamp: ${health.timestamp.toISOString()}`,
    `Connected: ${health.details.connected}`,
    `Response Time: ${health.details.responseTime}ms`,
    '',
    'Connection Pool Status:',
    `  Active: ${health.details.poolStatus.activeConnections}/${health.details.poolStatus.maxConnections}`,
    `  Idle: ${health.details.poolStatus.idleConnections}`,
    `  Utilization: ${health.details.poolStatus.utilizationPercent}%`,
    '',
    'Recent Errors:',
    `  Connection: ${health.details.recentErrors.connection}`,
    `  Timeout: ${health.details.recentErrors.timeout}`,
    `  Query: ${health.details.recentErrors.query}`,
    '',
    'Query Performance:',
    `  Average: ${health.details.performance.avgQueryTime}ms`,
    `  P95: ${health.details.performance.p95QueryTime}ms`,
    `  P99: ${health.details.performance.p99QueryTime}ms`,
  ];

  if (health.issues.length > 0) {
    lines.push('', 'Issues:');
    health.issues.forEach(issue => lines.push(`  - ${issue}`));
  }

  return lines.join('\n');
}