import 'server-only';

import { PrismaClient } from './generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon for Node.js environments (Vercel)
neonConfig.webSocketConstructor = ws;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let database: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // Use Neon adapter in production for better serverless performance
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaNeon({ connectionString });
  
  database = new PrismaClient({
    adapter,
    log: ['error'],
  });
} else {
  // Development can use standard client or adapter
  database = globalForPrisma.prisma || new PrismaClient({
    log: ['error', 'warn'],
  });
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = database;
  }
}

export { database };

export * from './generated/client';
