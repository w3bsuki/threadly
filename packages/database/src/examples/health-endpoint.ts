// Example: Health check endpoint for monitoring database connection pool
// This can be used in your Next.js API routes or Express endpoints

import { database, checkDatabaseHealth } from '@repo/database';
import type { NextApiRequest, NextApiResponse } from 'next';

// Example Next.js API route
export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const health = await checkDatabaseHealth(database);
    
    // Set appropriate HTTP status based on health
    const httpStatus = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    return res.status(httpStatus).json({
      service: 'database',
      status: health.status,
      timestamp: health.timestamp,
      checks: {
        connectivity: {
          status: health.details.connected ? 'pass' : 'fail',
          responseTime: `${health.details.responseTime}ms`,
        },
        connectionPool: {
          status: health.details.poolStatus.utilizationPercent < 80 ? 'pass' : 'warn',
          utilization: `${health.details.poolStatus.utilizationPercent}%`,
          activeConnections: health.details.poolStatus.activeConnections,
          maxConnections: health.details.poolStatus.maxConnections,
        },
        performance: {
          status: health.details.performance.p95QueryTime < 1000 ? 'pass' : 'warn',
          averageQueryTime: `${health.details.performance.avgQueryTime}ms`,
          p95QueryTime: `${health.details.performance.p95QueryTime}ms`,
        },
        errors: {
          status: Object.values(health.details.recentErrors).every(v => v === 0) ? 'pass' : 'warn',
          ...health.details.recentErrors,
        },
      },
      issues: health.issues,
    });
  } catch (error) {
    return res.status(503).json({
      service: 'database',
      status: 'unhealthy',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Example Express endpoint
export function createHealthEndpoint(app: any) {
  app.get('/health/database', async (req: any, res: any) => {
    try {
      const health = await checkDatabaseHealth(database);
      
      const httpStatus = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 200 : 503;

      res.status(httpStatus).json({
        service: 'database',
        status: health.status,
        details: health.details,
        issues: health.issues,
      });
    } catch (error) {
      res.status(503).json({
        service: 'database',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

// Example monitoring loop for logging/alerting
export async function startDatabaseMonitoring(intervalMs = 60000) {
  setInterval(async () => {
    try {
      const health = await checkDatabaseHealth(database);
      
      if (health.status !== 'healthy') {
        console.error(`Database health check failed: ${health.status}`);
        console.error('Issues:', health.issues);
        
        // Here you could send alerts to monitoring services
        // await sendAlert('database-unhealthy', health);
      }
      
      // Log metrics for observability
      console.log({
        timestamp: health.timestamp,
        status: health.status,
        poolUtilization: health.details.poolStatus.utilizationPercent,
        avgQueryTime: health.details.performance.avgQueryTime,
        errors: health.details.recentErrors,
      });
    } catch (error) {
      console.error('Failed to run database health check:', error);
    }
  }, intervalMs);
}