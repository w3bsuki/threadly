#!/usr/bin/env tsx
import { database } from '@repo/database';
import { PrismaClient } from '../packages/database/generated/client';

// Support both @repo/database and direct PrismaClient for flexibility
const db = database || new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL ||
    'postgresql://threadly_owner:npg_qwPJ5Ziazf4O@ep-soft-art-a2tlilgq-pooler.eu-central-1.aws.neon.tech/threadly?sslmode=require',
});

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error(
    'Please set the DATABASE_URL environment variable before running this script'
  );
  process.exit(1);
}

async function checkProducts() {
  console.log('🔍 Starting product database check...');
  
  try {
    // Count total products
    const totalProducts = await db.product.count();
    console.log(`\nTotal products in database: ${totalProducts}`);

    // Count available products
    const availableProducts = await db.product.count({
      where: { status: 'AVAILABLE' },
    });
    console.log(`Available products: ${availableProducts}`);

    // Get all products with detailed information
    const products = await db.product.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
        seller: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`\n📊 Detailed product listing (${products.length} total):`);

    products.forEach((product, index) => {
      console.log(`
Product ${index + 1}:
- ID: ${product.id}
- Title: ${product.title}
- Brand: ${product.brand || 'N/A'}
- Price: $${product.price}
- Category: ${product.category?.name || 'N/A'}
- Status: ${product.status}
- Seller: ${product.seller?.email || 'N/A'}
- Created: ${product.createdAt.toISOString()}
      `);
    });

    // Get recent products (consolidated from check-production-products.ts)
    const recentProducts = await db.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        price: true,
        seller: {
          select: {
            email: true,
          },
        },
      },
    });

    console.log('\n🕒 Most recent products:');
    recentProducts.forEach((p) => {
      console.log(
        `- ${p.title} (${p.status}) - Created: ${p.createdAt.toLocaleString()} by ${p.seller?.email || 'Unknown'}`
      );
      console.log(`  ID: ${p.id} | Price: $${p.price}`);
    });

    // Test specific searches
    const leatherProducts = await db.product.findMany({
      where: {
        status: 'AVAILABLE',
        OR: [
          {
            title: {
              contains: 'leather',
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: 'leather',
              mode: 'insensitive',
            },
          },
          {
            brand: {
              contains: 'leather',
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    console.log(
      `\n🔍 Products containing "leather": ${leatherProducts.length}`
    );
    leatherProducts.forEach((product) => {
      console.log(`- ${product.title} (${product.brand || 'No brand'})`);
    });

    const jacketProducts = await db.product.findMany({
      where: {
        status: 'AVAILABLE',
        OR: [
          {
            title: {
              contains: 'jacket',
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: 'jacket',
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    console.log(`\n🧥 Products containing "jacket": ${jacketProducts.length}`);
    jacketProducts.forEach((product) => {
      console.log(`- ${product.title} (${product.brand || 'No brand'})`);
    });

    // Test category breakdown
    const categoryStats = await db.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    console.log('\n📂 Products by category:');
    categoryStats.forEach((category) => {
      console.log(`- ${category.name}: ${category._count.products} products`);
    });

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    // Disconnect if using PrismaClient directly
    if (db && typeof db.$disconnect === 'function') {
      await db.$disconnect();
    }
  }
}

// Run the check
checkProducts()
  .then(() => {
    console.log('\n✅ Product check completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Product check failed:', error);
    process.exit(1);
  });
