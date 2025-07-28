import { PrismaClient } from '../packages/database/generated/client';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error(
    'Please set the DATABASE_URL environment variable before running this script'
  );
  process.exit(1);
}

async function testCategories() {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    // Get all categories
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        _count: {
          select: { products: true },
        },
      },
    });

    categories.forEach((cat) => {});
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCategories();
