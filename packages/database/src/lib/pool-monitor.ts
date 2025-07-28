import { PrismaClient } from '../../generated/client';

export interface PoolStats {
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  totalConnections: number;
  maxConnections: number;
}

export interface PoolMetrics {
  timestamp: Date;
  stats: PoolStats;
  queryDuration: {
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  };
  errors: {
    connectionErrors: number;
    timeoutErrors: number;
    queryErrors: number;
  };
}

class ConnectionPoolMonitor {
  private metrics: PoolMetrics[] = [];
  private queryDurations: number[] = [];
  private errors = {
    connectionErrors: 0,
    timeoutErrors: 0,
    queryErrors: 0,
  };
  private maxMetricsHistory = 1000;

  // Reset error counters periodically
  constructor() {
    setInterval(() => {
      this.errors = {
        connectionErrors: 0,
        timeoutErrors: 0,
        queryErrors: 0,
      };
    }, 300000); // Reset every 5 minutes
  }

  recordQueryDuration(duration: number) {
    this.queryDurations.push(duration);
    
    // Keep only last 1000 query durations
    if (this.queryDurations.length > this.maxMetricsHistory) {
      this.queryDurations = this.queryDurations.slice(-this.maxMetricsHistory);
    }
  }

  recordError(type: 'connection' | 'timeout' | 'query') {
    switch (type) {
      case 'connection':
        this.errors.connectionErrors++;
        break;
      case 'timeout':
        this.errors.timeoutErrors++;
        break;
      case 'query':
        this.errors.queryErrors++;
        break;
    }
  }

  private calculatePercentile(data: number[], percentile: number): number {
    if (data.length === 0) return 0;
    
    const sorted = [...data].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  async getPoolStats(prisma: PrismaClient): Promise<PoolStats> {
    // Query PostgreSQL for connection pool statistics
    const result = await prisma.$queryRaw<Array<{
      state: string;
      count: bigint;
    }>>`
      SELECT state, COUNT(*) as count
      FROM pg_stat_activity
      WHERE datname = current_database()
      GROUP BY state
    `;

    const stats: PoolStats = {
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      totalConnections: 0,
      maxConnections: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '50'),
    };

    result.forEach((row) => {
      const count = Number(row.count);
      stats.totalConnections += count;
      
      switch (row.state) {
        case 'active':
          stats.activeConnections += count;
          break;
        case 'idle':
        case 'idle in transaction':
          stats.idleConnections += count;
          break;
      }
    });

    return stats;
  }

  async collectMetrics(prisma: PrismaClient): Promise<PoolMetrics> {
    const stats = await this.getPoolStats(prisma);
    
    const queryDuration = this.queryDurations.length > 0 ? {
      avg: this.queryDurations.reduce((a, b) => a + b, 0) / this.queryDurations.length,
      min: Math.min(...this.queryDurations),
      max: Math.max(...this.queryDurations),
      p95: this.calculatePercentile(this.queryDurations, 95),
      p99: this.calculatePercentile(this.queryDurations, 99),
    } : {
      avg: 0,
      min: 0,
      max: 0,
      p95: 0,
      p99: 0,
    };

    const metrics: PoolMetrics = {
      timestamp: new Date(),
      stats,
      queryDuration,
      errors: { ...this.errors },
    };

    this.metrics.push(metrics);
    
    // Keep only last N metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    return metrics;
  }

  getRecentMetrics(count = 10): PoolMetrics[] {
    return this.metrics.slice(-count);
  }

  getHealthStatus(): {
    healthy: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const latestMetrics = this.metrics[this.metrics.length - 1];
    
    if (!latestMetrics) {
      return { healthy: true, issues: [] };
    }

    // Check connection utilization
    const utilizationRate = latestMetrics.stats.activeConnections / latestMetrics.stats.maxConnections;
    if (utilizationRate > 0.8) {
      issues.push(`High connection pool utilization: ${(utilizationRate * 100).toFixed(1)}%`);
    }

    // Check query performance
    if (latestMetrics.queryDuration.p95 > 1000) {
      issues.push(`Slow query performance: p95 = ${latestMetrics.queryDuration.p95.toFixed(0)}ms`);
    }

    // Check error rates
    const totalErrors = latestMetrics.errors.connectionErrors + 
                       latestMetrics.errors.timeoutErrors + 
                       latestMetrics.errors.queryErrors;
    
    if (totalErrors > 10) {
      issues.push(`High error rate: ${totalErrors} errors in the last period`);
    }

    return {
      healthy: issues.length === 0,
      issues,
    };
  }
}

// Export singleton instance
export const poolMonitor = new ConnectionPoolMonitor();

// Middleware for tracking query performance
export function createMonitoringMiddleware() {
  return async (params: any, next: (params: any) => Promise<any>) => {
    const start = Date.now();
    
    try {
      const result = await next(params);
      const duration = Date.now() - start;
      
      poolMonitor.recordQueryDuration(duration);
      
      // Log slow queries
      if (duration > 1000) {
        console.warn(`Slow query detected: ${params.model}.${params.action} took ${duration}ms`);
      }
      
      return result;
    } catch (error: any) {
      // Categorize errors
      if (error.message?.includes('timeout')) {
        poolMonitor.recordError('timeout');
      } else if (error.message?.includes('connection')) {
        poolMonitor.recordError('connection');
      } else {
        poolMonitor.recordError('query');
      }
      
      throw error;
    }
  };
}