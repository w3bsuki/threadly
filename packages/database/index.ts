import 'server-only';

import { PrismaClient } from './generated/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let database: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // Use standard Prisma client in production with binary engine
  database = new PrismaClient({
    log: ['error'],
  });
} else {
  // Development uses standard client
  database =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: ['error', 'warn'],
    });

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = database;
  }
}

export { database };

export * from './generated/client';
