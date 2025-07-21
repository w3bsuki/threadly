import { database } from './packages/database/index.ts';

async function testDb() {
  try {
    console.log('🔍 Testing database connection...');
    
    const productCount = await database.product.count();
    console.log(`📊 Total products: ${productCount}`);
    
    if (productCount > 0) {
      const products = await database.product.findMany({
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
    await database.$disconnect();
  }
}

testDb();