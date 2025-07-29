import { createTRPCRouter, publicProcedure } from '../config';
import { database } from '@repo/database';

/**
 * Health check router for system monitoring
 * 
 * Provides endpoints for monitoring the health and status of the API
 */
export const healthRouter = createTRPCRouter({
  /**
   * Basic health check
   * Returns system status and version information
   */
  status: publicProcedure
    .query(async () => {
      const now = new Date().toISOString();
      
      return {
        status: 'healthy',
        timestamp: now,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      };
    }),

  /**
   * Comprehensive health check including database
   * Used by monitoring systems and load balancers
   */
  detailed: publicProcedure
    .query(async () => {
      const startTime = Date.now();
      
      // Check database health
      let dbStatus = 'healthy';
      let dbResponseTime = 0;
      
      try {
        const dbStart = Date.now();
        await database.$queryRaw`SELECT 1`;
        dbResponseTime = Date.now() - dbStart;
      } catch (error) {
        dbStatus = 'unhealthy';
      }
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      return {
        status: dbStatus === 'healthy' ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        checks: {
          database: {
            status: dbStatus,
            responseTime: dbResponseTime,
          },
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          },
          uptime: Math.round(process.uptime()),
        },
      };
    }),
});