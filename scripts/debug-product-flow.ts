import { PrismaClient } from '../packages/database/generated/client';

async function debugProductFlow() {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('🔍 Debugging Product Flow Issue\n');

    // 1. Test direct database query
    console.log('1️⃣ Testing direct database query:');
    const directProducts = await prisma.product.findMany({
      where: { status: 'AVAILABLE' },
      take: 5,
      include: {
        images: true,
        seller: true,
        category: true
      }
    });
    console.log(`   Found ${directProducts.length} products directly from DB`);

    // 2. Check if issue is with specific conditions
    console.log('\n2️⃣ Testing various query conditions:');
    
    // Products with images
    const withImages = await prisma.product.count({
      where: {
        status: 'AVAILABLE',
        images: { some: {} }
      }
    });
    console.log(`   Products with images: ${withImages}`);

    // Products without images
    const withoutImages = await prisma.product.count({
      where: {
        status: 'AVAILABLE',
        images: { none: {} }
      }
    });
    console.log(`   Products without images: ${withoutImages}`);

    // 3. Test the exact query used in ProductGridServer
    console.log('\n3️⃣ Testing ProductGridServer query:');
    const serverQuery = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE'
      },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' }
        },
        seller: true,
        category: true,
        _count: {
          select: { favorites: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 24,
    });
    console.log(`   ProductGridServer query returned: ${serverQuery.length} products`);

    // 4. Check for any data issues
    console.log('\n4️⃣ Checking for data issues:');
    const nullCategories = await prisma.product.count({
      where: {
        status: 'AVAILABLE',
        category: null
      }
    });
    console.log(`   Products with null category: ${nullCategories}`);

    const nullSellers = await prisma.product.count({
      where: {
        status: 'AVAILABLE',
        seller: null
      }
    });
    console.log(`   Products with null seller: ${nullSellers}`);

    // 5. Sample product details
    console.log('\n5️⃣ Sample product details:');
    if (directProducts.length > 0) {
      const sample = directProducts[0];
      console.log(`   Product: ${sample.title}`);
      console.log(`   Status: ${sample.status}`);
      console.log(`   Images: ${sample.images.length}`);
      console.log(`   Seller: ${sample.seller?.email}`);
      console.log(`   Category: ${sample.category?.name}`);
    }

    // 6. Check environment
    console.log('\n6️⃣ Environment check:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   Database URL starts with: ${process.env.DATABASE_URL?.substring(0, 30)}...`);

  } catch (error) {
    console.error('❌ Error in debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run with environment variable
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

debugProductFlow();