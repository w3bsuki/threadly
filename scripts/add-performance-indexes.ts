#!/usr/bin/env node
import 'dotenv/config';
import { PrismaClient } from '../packages/database/generated/client/index.js';

const database = new PrismaClient();

const log = (message: string) => console.log(message);
const logError = (message: string, error: any) => console.error(message, error);

async function addPerformanceIndexes() {
  try {
    log('Adding performance indexes to database...');

    // Products table indexes - Enhanced for selling listings performance
    await database.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_products_seller_status" ON "Product"("sellerId", "status")`;
    log('✓ Added idx_products_seller_status');

    await database.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_products_status_updated" ON "Product"("status", "updatedAt")`;
    log('✓ Added idx_products_status_updated');

    // Critical composite index for selling listings page (prevents crash with 1000+ products)
    await database.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_products_seller_status_created" ON "Product"("sellerId", "status", "createdAt")`;
    log('✓ Added idx_products_seller_status_created (listings optimization)');

    // Category browsing with price filtering
    await database.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_products_category_status_price" ON "Product"("categoryId", "status", "price")`;
    log('✓ Added idx_products_category_status_price (category browsing)');

    // Popular products and trending queries
    await database.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_products_status_views_created" ON "Product"("status", "views", "createdAt")`;
    log('✓ Added idx_products_status_views_created (trending products)');

    // Orders table indexes - Enhanced for dashboard performance
    await database.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_orders_buyer_status" ON "Order"("buyerId", "status")`;
    log('✓ Added idx_orders_buyer_status');

    await database.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_orders_seller_status" ON "Order"("sellerId", "status")`;
    log('✓ Added idx_orders_seller_status');

    await database.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_orders_buyer_created" ON "Order"("buyerId", "createdAt")`;
    log('✓ Added idx_orders_buyer_created');

    // Critical composite indexes for dashboard performance
    await database.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_orders_seller_status_created" ON "Order"("sellerId", "status", "createdAt")`;
    log('✓ Added idx_orders_seller_status_created (dashboard optimization)');

    await database.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_orders_buyer_status_created" ON "Order"("buyerId", "status", "createdAt")`;
    log('✓ Added idx_orders_buyer_status_created (dashboard optimization)');

    // Messages table indexes
    await database.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_messages_conversation_created" ON "Message"("conversationId", "createdAt")`;
    log('✓ Added idx_messages_conversation_created');

    // Payments table index (for idempotency checks)
    await database.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_payments_stripe_id" ON "Payment"("stripePaymentId")`;
    log('✓ Added idx_payments_stripe_id');

    // Full text search indexes for products
    await database.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_products_search" ON "Product" USING gin(to_tsvector('english', "title" || ' ' || "description" || ' ' || COALESCE("brand", '')))`;
    log('✓ Added idx_products_search for full-text search');

    log('✅ All performance indexes added successfully!');
  } catch (error) {
    logError('Failed to add indexes:', error);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

// Run if called directly
addPerformanceIndexes();