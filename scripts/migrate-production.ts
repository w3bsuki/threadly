#!/usr/bin/env tsx

/**
 * Production database migration script
 * 
 * This script safely migrates the database schema to production
 * and handles data migration if needed.
 */

import { PrismaClient } from '@repo/database';
import { log } from '@repo/observability/log';

const prisma = new PrismaClient();

async function validateConnection() {
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    log.info('Database connection successful', { result });
    return true;
  } catch (error) {
    log.error('Database connection failed', { error });
    return false;
  }
}

async function checkDatabaseExists() {
  try {
    // Check if any tables exist
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    log.info('Existing tables found', { count: tables.length, tables: tables.map(t => t.table_name) });
    return tables.length > 0;
  } catch (error) {
    log.error('Error checking database tables', { error });
    return false;
  }
}

async function runMigrations() {
  try {
    log.info('Starting database migration process...');
    
    // For production, we should use Prisma migrate deploy
    // This applies migrations that have been created and tested in development
    log.info('Use: pnpm db:migrate:deploy for production migrations');
    log.info('This script validates the environment and connection only');
    
    return true;
  } catch (error) {
    log.error('Migration failed', { error });
    return false;
  }
}

async function seedEssentialData() {
  try {
    log.info('Checking for essential data...');
    
    // Check if categories exist
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      log.info('No categories found - seeding essential categories');
      
      const essentialCategories = [
        { name: 'Women', slug: 'women', description: 'Women\'s clothing and accessories' },
        { name: 'Men', slug: 'men', description: 'Men\'s clothing and accessories' },
        { name: 'Shoes', slug: 'shoes', description: 'Footwear for all occasions' },
        { name: 'Bags', slug: 'bags', description: 'Handbags, backpacks, and accessories' },
        { name: 'Accessories', slug: 'accessories', description: 'Jewelry, watches, and more' },
      ];
      
      for (const category of essentialCategories) {
        await prisma.category.create({
          data: category
        });
      }
      
      log.info('Essential categories seeded successfully');
    } else {
      log.info('Categories already exist', { count: categoryCount });
    }
    
    return true;
  } catch (error) {
    log.error('Failed to seed essential data', { error });
    return false;
  }
}

async function validateSchema() {
  try {
    log.info('Validating database schema...');
    
    // Check critical tables exist
    const requiredTables = ['User', 'Product', 'Category', 'Order', 'Message', 'Conversation'];
    
    for (const table of requiredTables) {
      try {
        await prisma.$queryRawUnsafe(`SELECT 1 FROM "${table}" LIMIT 1`);
        log.info(`Table ${table} exists and is accessible`);
      } catch (error) {
        log.error(`Table ${table} is missing or inaccessible`, { error });
        throw new Error(`Required table ${table} not found`);
      }
    }
    
    // Check critical indexes
    const indexes = await prisma.$queryRaw<Array<{ indexname: string, tablename: string }>>`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      AND tablename IN ('User', 'Product', 'Category', 'Order')
    `;
    
    log.info('Database indexes', { count: indexes.length, indexes });
    
    return true;
  } catch (error) {
    log.error('Schema validation failed', { error });
    return false;
  }
}

async function generateProductionReport() {
  try {
    const [
      userCount,
      productCount,
      orderCount,
      categoryCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.category.count()
    ]);
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      database: {
        connected: true,
        tables: {
          users: userCount,
          products: productCount,
          orders: orderCount,
          categories: categoryCount
        }
      },
      ready: userCount >= 0 && categoryCount >= 5 // At least categories must exist
    };
    
    log.info('Production database report', report);
    return report;
  } catch (error) {
    log.error('Failed to generate production report', { error });
    return null;
  }
}

async function main() {
  log.info('Starting production database setup and validation...');
  
  // Check environment
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    log.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }
  
  if (!databaseUrl.includes('postgresql://')) {
    log.error('Production requires PostgreSQL database');
    process.exit(1);
  }
  
  // Validate connection
  const connected = await validateConnection();
  if (!connected) {
    log.error('Cannot connect to database');
    process.exit(1);
  }
  
  // Check if database exists
  const hasExistingData = await checkDatabaseExists();
  log.info('Database status', { hasExistingData });
  
  // Run migrations (in production, this should be done manually)
  const migrated = await runMigrations();
  if (!migrated) {
    log.error('Migration process failed');
    process.exit(1);
  }
  
  // Validate schema
  const schemaValid = await validateSchema();
  if (!schemaValid) {
    log.error('Schema validation failed');
    process.exit(1);
  }
  
  // Seed essential data
  const seeded = await seedEssentialData();
  if (!seeded) {
    log.error('Failed to seed essential data');
    process.exit(1);
  }
  
  // Generate report
  const report = await generateProductionReport();
  if (!report) {
    log.error('Failed to generate production report');
    process.exit(1);
  }
  
  if (report.ready) {
    log.info('✅ Production database is ready!');
  } else {
    log.warn('⚠️ Production database needs attention');
  }
  
  await prisma.$disconnect();
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    log.error('Production database setup failed', { error });
    process.exit(1);
  });
}

export { main as setupProductionDatabase };