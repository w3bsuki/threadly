import { PrismaClient } from '../../generated/client';
import { createMonitoringMiddleware } from './pool-monitor';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  // Configure database URL with pooling parameters
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  // Parse and enhance the database URL with pooling parameters
  const url = new URL(databaseUrl);
  
  // Production pooling configuration
  if (process.env.NODE_ENV === 'production') {
    // Connection pool settings
    url.searchParams.set('connection_limit', process.env.DATABASE_CONNECTION_LIMIT || '50');
    url.searchParams.set('pool_timeout', process.env.DATABASE_POOL_TIMEOUT || '30');
    url.searchParams.set('statement_cache_size', process.env.DATABASE_STATEMENT_CACHE_SIZE || '1000');
    url.searchParams.set('idle_in_transaction_session_timeout', process.env.DATABASE_IDLE_TIMEOUT || '60000');
    
    // PostgreSQL specific optimizations
    url.searchParams.set('pgbouncer', 'true');
    url.searchParams.set('connect_timeout', '10');
  }

  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    datasources: {
      db: {
        url: url.toString(),
      },
    },
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const createPrismaClient = () => {
  // Configure database URL with pooling parameters
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  // Parse and enhance the database URL with pooling parameters
  const url = new URL(databaseUrl);
  
  // Production pooling configuration
  if (process.env.NODE_ENV === 'production') {
    // Connection pool settings
    url.searchParams.set('connection_limit', process.env.DATABASE_CONNECTION_LIMIT || '50');
    url.searchParams.set('pool_timeout', process.env.DATABASE_POOL_TIMEOUT || '30');
    url.searchParams.set('statement_cache_size', process.env.DATABASE_STATEMENT_CACHE_SIZE || '1000');
    url.searchParams.set('idle_in_transaction_session_timeout', process.env.DATABASE_IDLE_TIMEOUT || '60000');
    
    // PostgreSQL specific optimizations
    url.searchParams.set('pgbouncer', 'true');
    url.searchParams.set('connect_timeout', '10');
  }

  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    datasources: {
      db: {
        url: url.toString(),
      },
    },
  });

  // Add monitoring middleware for connection pool metrics
  client.$use(createMonitoringMiddleware());

  // Add custom query logging middleware
  client.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();

    if (process.env.DATABASE_QUERY_LOGGING === 'true') {
      const duration = after - before;
      if (duration > 100) {
        console.warn(
          `Slow query detected: ${params.model}.${params.action} took ${duration}ms`
        );
      }
    }

    return result;
  });

  return client;
};

export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;
