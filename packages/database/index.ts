import 'server-only';

import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaClient } from './generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Setup for Node.js environment
if (typeof WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let database: PrismaClient;

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  // Use Neon serverless adapter in production
  const connectionString = process.env.DATABASE_URL;
  
  // Create pool using neon function
  const sql = neon(connectionString);
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool, sql);
  
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
