import 'server-only';

import { PrismaClient } from './generated/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let database: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // Use standard Prisma client in production
  database = new PrismaClient({
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
