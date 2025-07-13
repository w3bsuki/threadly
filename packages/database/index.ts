import 'server-only';

import { PrismaClient } from './generated/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Use standard Prisma client with proper connection pooling
export const database = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = database;
}

export * from './generated/client';
