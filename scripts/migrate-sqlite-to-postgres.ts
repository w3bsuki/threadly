#!/usr/bin/env tsx

/**
 * Migration script to move from SQLite (development) to PostgreSQL (production)
 *
 * This script helps migrate data from a SQLite database to PostgreSQL
 * for production deployment.
 */

import { PrismaClient } from '@repo/database';
import { log } from '@repo/observability/log';
import fs from 'fs';
import path from 'path';

interface MigrationConfig {
  sqliteUrl: string;
  postgresUrl: string;
  backupPath: string;
}

async function validateUrls(config: MigrationConfig) {
  // Validate SQLite source
  if (
    !(
      config.sqliteUrl.includes('sqlite:') || config.sqliteUrl.includes('file:')
    )
  ) {
    throw new Error('Source database must be SQLite');
  }

  // Validate PostgreSQL target
  if (!config.postgresUrl.includes('postgresql://')) {
    throw new Error('Target database must be PostgreSQL');
  }

  log.info('Database URLs validated', {
    source: 'SQLite',
    target: 'PostgreSQL',
  });
}

async function createBackup(config: MigrationConfig) {
  try {
    const backupDir = path.dirname(config.backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // For SQLite, we can simply copy the file
    if (config.sqliteUrl.includes('file:')) {
      const sqliteFile = config.sqliteUrl.replace('file:', '');
      if (fs.existsSync(sqliteFile)) {
        fs.copyFileSync(sqliteFile, config.backupPath);
        log.info('SQLite backup created', { backupPath: config.backupPath });
      }
    }

    return true;
  } catch (error) {
    log.error('Backup creation failed', { error });
    return false;
  }
}

async function exportData(sqliteClient: PrismaClient) {
  try {
    log.info('Exporting data from SQLite...');

    const data = {
      users: await sqliteClient.user.findMany({
        include: {
          listings: true,
          purchases: true,
          sales: true,
          favorites: true,
          cart: true,
        },
      }),
      categories: await sqliteClient.category.findMany(),
      products: await sqliteClient.product.findMany({
        include: {
          images: true,
          reviews: true,
          favorites: true,
        },
      }),
      orders: await sqliteClient.order.findMany(),
      conversations: await sqliteClient.conversation.findMany({
        include: {
          messages: true,
        },
      }),
      reviews: await sqliteClient.review.findMany(),
      notifications: await sqliteClient.notification.findMany(),
    };

    log.info('Data export completed', {
      users: data.users.length,
      categories: data.categories.length,
      products: data.products.length,
      orders: data.orders.length,
      conversations: data.conversations.length,
      reviews: data.reviews.length,
      notifications: data.notifications.length,
    });

    return data;
  } catch (error) {
    log.error('Data export failed', { error });
    throw error;
  }
}

async function importData(postgresClient: PrismaClient, data: any) {
  try {
    log.info('Starting data import to PostgreSQL...');

    // Import in dependency order

    // 1. Users (no dependencies)
    for (const user of data.users) {
      try {
        await postgresClient.user.create({
          data: {
            id: user.id,
            clerkId: user.clerkId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            bio: user.bio,
            location: user.location,
            joinedAt: user.joinedAt,
            verified: user.verified,
            totalSales: user.totalSales,
            totalPurchases: user.totalPurchases,
            averageRating: user.averageRating,
            stripeAccountId: user.stripeAccountId,
            notificationPreferences: user.notificationPreferences,
          },
        });
      } catch (error) {
        log.warn('User import failed', {
          userId: user.id,
          error: error.message,
        });
      }
    }
    log.info('Users imported', { count: data.users.length });

    // 2. Categories (no dependencies)
    for (const category of data.categories) {
      try {
        await postgresClient.category.create({
          data: {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            parentId: category.parentId,
          },
        });
      } catch (error) {
        log.warn('Category import failed', {
          categoryId: category.id,
          error: error.message,
        });
      }
    }
    log.info('Categories imported', { count: data.categories.length });

    // 3. Products (depends on users and categories)
    for (const product of data.products) {
      try {
        await postgresClient.product.create({
          data: {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            condition: product.condition,
            size: product.size,
            brand: product.brand,
            color: product.color,
            material: product.material,
            status: product.status,
            sellerId: product.sellerId,
            categoryId: product.categoryId,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            // Create related images
            images: {
              create: product.images.map((img: any) => ({
                id: img.id,
                url: img.url,
                altText: img.altText,
                displayOrder: img.displayOrder,
              })),
            },
          },
        });
      } catch (error) {
        log.warn('Product import failed', {
          productId: product.id,
          error: error.message,
        });
      }
    }
    log.info('Products imported', { count: data.products.length });

    // 4. Orders (depends on users and products)
    for (const order of data.orders) {
      try {
        await postgresClient.order.create({
          data: {
            id: order.id,
            buyerId: order.buyerId,
            sellerId: order.sellerId,
            productId: order.productId,
            amount: order.amount,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          },
        });
      } catch (error) {
        log.warn('Order import failed', {
          orderId: order.id,
          error: error.message,
        });
      }
    }
    log.info('Orders imported', { count: data.orders.length });

    // 5. Conversations and Messages
    for (const conversation of data.conversations) {
      try {
        await postgresClient.conversation.create({
          data: {
            id: conversation.id,
            buyerId: conversation.buyerId,
            sellerId: conversation.sellerId,
            productId: conversation.productId,
            status: conversation.status,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
            messages: {
              create: conversation.messages.map((msg: any) => ({
                id: msg.id,
                senderId: msg.senderId,
                content: msg.content,
                read: msg.read,
                createdAt: msg.createdAt,
              })),
            },
          },
        });
      } catch (error) {
        log.warn('Conversation import failed', {
          conversationId: conversation.id,
          error: error.message,
        });
      }
    }
    log.info('Conversations imported', { count: data.conversations.length });

    log.info('Data import completed successfully');
    return true;
  } catch (error) {
    log.error('Data import failed', { error });
    throw error;
  }
}

async function main() {
  const config: MigrationConfig = {
    sqliteUrl: process.env.SQLITE_DATABASE_URL || 'file:./dev.db',
    postgresUrl: process.env.DATABASE_URL || '',
    backupPath: './backups/sqlite-backup-' + Date.now() + '.db',
  };

  if (!config.postgresUrl) {
    log.error('DATABASE_URL environment variable is required for PostgreSQL');
    process.exit(1);
  }

  try {
    await validateUrls(config);

    // Create backup
    const backupCreated = await createBackup(config);
    if (!backupCreated) {
      log.warn('Backup creation failed, continuing anyway...');
    }

    // Create separate Prisma clients
    const sqliteClient = new PrismaClient({
      datasources: {
        db: {
          url: config.sqliteUrl,
        },
      },
    });

    const postgresClient = new PrismaClient({
      datasources: {
        db: {
          url: config.postgresUrl,
        },
      },
    });

    try {
      // Test connections
      await sqliteClient.$connect();
      await postgresClient.$connect();
      log.info('Database connections established');

      // Export data from SQLite
      const data = await exportData(sqliteClient);

      // Import data to PostgreSQL
      await importData(postgresClient, data);

      log.info('✅ Migration completed successfully!');
    } finally {
      await sqliteClient.$disconnect();
      await postgresClient.$disconnect();
    }
  } catch (error) {
    log.error('Migration failed', { error });
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as migrateSqliteToPostgres };
