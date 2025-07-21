import { PrismaClient } from './packages/database/generated/client/index.js';

const DATABASE_URL = "postgresql://threadly_owner:npg_iEZ5Pqg8UYLo@ep-soft-art-a2tlilgq-pooler.eu-central-1.aws.neon.tech/threadly?sslmode=require&channel_binding=require";

async function checkRelations() {
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  });

  try {
    // Check products with their relations
    const products = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        ProductImage: true,
        Category: true,
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });
    
    console.log('🔍 Product relations check:');
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. "${product.title}"`);
      console.log(`   Seller: ${product.User ? `${product.User.firstName} ${product.User.lastName}` : 'MISSING'}`);
      console.log(`   Category: ${product.Category ? product.Category.name : 'MISSING'}`);
      console.log(`   Images: ${product.ProductImage.length} images`);
      console.log(`   SellerId: ${product.sellerId}`);
      console.log(`   CategoryId: ${product.categoryId}`);
    });
    
    // Check for products with missing relations
    const productsWithoutSeller = await prisma.product.count({
      where: {
        User: null
      }
    });
    
    const productsWithoutCategory = await prisma.product.count({
      where: {
        Category: null
      }
    });
    
    console.log(`\n📊 Missing relations:`);
    console.log(`Products without seller: ${productsWithoutSeller}`);
    console.log(`Products without category: ${productsWithoutCategory}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRelations();