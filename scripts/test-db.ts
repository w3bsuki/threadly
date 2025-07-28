import { PrismaClient } from '../packages/database/generated/client';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error(
    'Please set the DATABASE_URL environment variable before running this script'
  );
  process.exit(1);
}

async function testDatabase() {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    // Test connection
    const categoryCount = await prisma.category.count();

    // List some categories
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: {
          select: { products: true },
        },
      },
    });

    categories.forEach((cat) => {});

    // Test product query
    const productCount = await prisma.product.count();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
