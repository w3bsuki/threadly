import { PrismaClient } from './packages/database/generated/client/index.js';

const DATABASE_URL = "postgresql://threadly_owner:npg_iEZ5Pqg8UYLo@ep-soft-art-a2tlilgq-pooler.eu-central-1.aws.neon.tech/threadly?sslmode=require&channel_binding=require";

async function checkStatus() {
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  });

  try {
    // Check status distribution
    const statusCounts = await prisma.product.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });
    
    console.log('📊 Product status distribution:');
    statusCounts.forEach(({ status, _count }) => {
      console.log(`${status}: ${_count.id} products`);
    });
    
    // Show recent products with their status
    const recentProducts = await prisma.product.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });
    
    console.log('\n🔍 Recent products with status:');
    recentProducts.forEach((product, index) => {
      console.log(`${index + 1}. "${product.title}" - ${product.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();