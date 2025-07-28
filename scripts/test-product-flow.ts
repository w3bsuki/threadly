import { PrismaClient } from '../packages/database/generated/client';

async function testProductFlow() {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Testing Product Data Flow\n');

    // 1. Check total products in database
    const totalProducts = await prisma.product.count();
    console.log(`📊 Total products in database: ${totalProducts}`);

    // 2. Check available products
    const availableProducts = await prisma.product.count({
      where: { status: 'AVAILABLE' },
    });
    console.log(`✅ Available products: ${availableProducts}`);

    // 3. Check products with images
    const productsWithImages = await prisma.product.count({
      where: {
        status: 'AVAILABLE',
        images: { some: {} },
      },
    });
    console.log(`📸 Available products with images: ${productsWithImages}`);

    // 4. Check products by category
    const productsByCategory = await prisma.product.groupBy({
      by: ['categoryId'],
      where: { status: 'AVAILABLE' },
      _count: true,
    });

    console.log('\n📁 Products by category:');
    for (const cat of productsByCategory) {
      const category = await prisma.category.findUnique({
        where: { id: cat.categoryId },
      });
      console.log(`  - ${category?.name || 'Unknown'}: ${cat._count} products`);
    }

    // 5. Check recent products (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentProducts = await prisma.product.count({
      where: {
        status: 'AVAILABLE',
        createdAt: { gte: oneDayAgo },
      },
    });
    console.log(`\n🆕 Products added in last 24 hours: ${recentProducts}`);

    // 6. Check unique sellers
    const uniqueSellers = await prisma.product.groupBy({
      by: ['sellerId'],
      _count: true,
    });
    console.log(`👤 Unique sellers: ${uniqueSellers.length}`);

    // 7. Sample a few products to check their structure
    const sampleProducts = await prisma.product.findMany({
      where: { status: 'AVAILABLE' },
      take: 3,
      include: {
        seller: true,
        category: true,
        images: true,
        _count: { select: { favorites: true, cartItems: true, orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('\n📋 Sample product details:');
    sampleProducts.forEach((product, index) => {
      console.log(`\nProduct ${index + 1}: ${product.title}`);
      console.log(`  - ID: ${product.id}`);
      console.log(
        `  - Seller: ${product.seller?.firstName} ${product.seller?.lastName} (${product.seller?.email})`
      );
      console.log(`  - Category: ${product.category?.name}`);
      console.log(`  - Images: ${product.images.length}`);
      console.log(`  - Favorites: ${product._count.favorites}`);
      console.log(`  - In carts: ${product._count.cartItems}`);
      console.log(`  - Orders: ${product._count.orders}`);
    });

    // 8. Check if there are any users who can see products
    const users = await prisma.user.count();
    console.log(`\n👥 Total users in database: ${users}`);
  } catch (error) {
    console.error('❌ Error testing product flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run with environment variable
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

testProductFlow();
