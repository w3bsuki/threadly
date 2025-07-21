import { PrismaClient } from './packages/database/generated/client/index.js';

const DATABASE_URL = "postgresql://threadly_owner:npg_iEZ5Pqg8UYLo@ep-soft-art-a2tlilgq-pooler.eu-central-1.aws.neon.tech/threadly?sslmode=require&channel_binding=require";

async function testDb() {
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  });

  try {
    console.log('🔍 Testing database connection...');
    
    const productCount = await prisma.product.count();
    console.log(`📊 Total products: ${productCount}`);
    
    if (productCount > 0) {
      const products = await prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          brand: true,
          price: true,
          status: true,
          createdAt: true,
        },
      });
      
      console.log('\n🔍 Recent products:');
      products.forEach((product, index) => {
        console.log(`${index + 1}. "${product.title}" - $${product.price} (${product.status})`);
      });
    }
    
    console.log('\n✅ Database connection successful!');
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDb();