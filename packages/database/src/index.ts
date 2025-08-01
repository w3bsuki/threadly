// Export Prisma client and types

export type {
  Address,
  CartItem,
  Category,
  Conversation,
  Favorite,
  Message,
  Notification,
  Order,
  Product,
  ProductImage,
  Review,
  SellerProfile,
  User,
} from '../generated/client';
export { Prisma, PrismaClient, ProductStatus } from '../generated/client';
export * from './lib/backup-strategy';
export * from './lib/monitoring';
// Export database utilities
export * from './lib/prisma';
// Re-export the main database instance
export { prisma as database } from './lib/prisma';
export * from './lib/query-utils';
// Export connection pool monitoring
export { poolMonitor } from './lib/pool-monitor';
export type { PoolStats, PoolMetrics } from './lib/pool-monitor';
// Export health check utilities
export { checkDatabaseHealth, formatHealthCheckForLogging } from './lib/health-check';
export type { DatabaseHealthCheck } from './lib/health-check';

// Export cache functionality
export * from './cache/cache-instance';
export { cache } from './cache/cache-instance';
export * from './cache/cache-middleware';
export * from './cache/cache-service';
// Explicit export for getCacheService
export { getCacheService, MarketplaceCacheService } from './cache/cache-service';
export * from './cache/memory-cache';
export * from './cache/redis-cache';
export * from './cache/types';
