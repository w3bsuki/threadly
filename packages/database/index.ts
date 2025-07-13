import 'server-only';

import { Pool } from '@neondatabase/serverless';
import { PrismaClient } from './generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let database: PrismaClient;

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  // Use Neon serverless adapter in production to avoid engine bundling issues
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  database = new PrismaClient({ 
    adapter,
    log: ['error'],
  });
} else {
  // Use standard Prisma client in development
  database = globalForPrisma.prisma || new PrismaClient({
    log: ['error', 'warn'],
  });
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = database;
  }
}

export { database };

export * from './generated/client';
