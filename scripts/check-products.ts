import { PrismaClient } from '../packages/database/generated/client';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set the DATABASE_URL environment variable before running this script');
  process.exit(1);
}

async function checkProducts() {
  
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    // Get all products
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    
    products.forEach((product, index) => {
    });

    // Test specific searches
    const leatherProducts = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE',
        OR: [
          {
            title: {
              contains: 'leather',
            },
          },
          {
            description: {
              contains: 'leather',
            },
          },
          {
            brand: {
              contains: 'leather',
            },
          },
        ],
      },
    });
    
    leatherProducts.forEach(product => {
    });

    const jacketProducts = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE',
        OR: [
          {
            title: {
              contains: 'jacket',
            },
          },
          {
            description: {
              contains: 'jacket',
            },
          },
        ],
      },
    });
    
    jacketProducts.forEach(product => {
    });

  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();