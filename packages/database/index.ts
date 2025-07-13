import 'server-only';

import { neonConfig } from '@neondatabase/serverless';
import { PrismaClient } from './generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Configure Neon for edge environments (Vercel)
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let database: PrismaClient;

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  // Use Neon serverless adapter in production  
  const connectionString = process.env.DATABASE_URL;
  
  // PrismaNeon adapter expects a connection object, not a Pool instance
  const adapter = new PrismaNeon({ connectionString });
  
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
