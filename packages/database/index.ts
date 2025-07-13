import 'server-only';

import { neon } from '@neondatabase/serverless';
import { PrismaClient } from './generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let database: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // Use Neon serverless adapter in production to avoid engine bundling issues
  const neonClient = neon(process.env.DATABASE_URL!);
  const adapter = new PrismaNeon(neonClient);
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
