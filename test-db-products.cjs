const { PrismaClient } = require('./packages/database/generated/client');

async function checkProducts() {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking database connection...');
    
    const totalProducts = await prisma.product.count();
    console.log(`📦 Total products in database: ${totalProducts}`);
    
    const availableProducts = await prisma.product.count({
      where: { status: 'AVAILABLE' }
    });
    console.log(`✅ Available products: ${availableProducts}`);
    
    const categories = await prisma.category.count();
    console.log(`🏷️ Total categories: ${categories}`);
    
    const users = await prisma.user.count();
    console.log(`👥 Total users: ${users}`);
    
    if (totalProducts > 0) {
      console.log('\n📋 Sample products:');
      const sampleProducts = await prisma.product.findMany({
        take: 3,
        include: {
          category: { select: { name: true } },
          seller: { select: { firstName: true, lastName: true } }
        }
      });
      
      sampleProducts.forEach((product, idx) => {
        console.log(`${idx + 1}. ${product.title} - $${product.price} (${product.condition})`);
        console.log(`   Category: ${product.category?.name || 'Unknown'}`);
        console.log(`   Seller: ${product.seller?.firstName} ${product.seller?.lastName}`);
        console.log(`   Status: ${product.status}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();