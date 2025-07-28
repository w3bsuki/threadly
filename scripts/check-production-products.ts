import { PrismaClient } from '../packages/database/generated/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        'postgresql://threadly_owner:npg_qwPJ5Ziazf4O@ep-soft-art-a2tlilgq-pooler.eu-central-1.aws.neon.tech/threadly?sslmode=require',
    },
  },
});

async function checkProducts() {
  try {
    // Count total products
    const totalProducts = await prisma.product.count();
    console.log(`\nTotal products in database: ${totalProducts}`);

    // Count available products
    const availableProducts = await prisma.product.count({
      where: { status: 'AVAILABLE' },
    });
    console.log(`Available products: ${availableProducts}`);

    // Get recent products
    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        price: true,
        seller: {
          select: {
            email: true,
          },
        },
      },
    });

    console.log('\nMost recent products:');
    recentProducts.forEach((p) => {
      console.log(
        `- ${p.title} (${p.status}) - Created: ${p.createdAt.toLocaleString()} by ${p.seller.email}`
      );
      console.log(`  ID: ${p.id} | Price: $${p.price}`);
    });
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
