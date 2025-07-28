import { PrismaClient } from '../packages/database/generated/client';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error(
    'Please set the DATABASE_URL environment variable before running this script'
  );
  process.exit(1);
}

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function seedProducts() {
  try {
    // First, create a test user if it doesn't exist
    const testUser = await prisma.user.upsert({
      where: { email: 'test@threadly.com' },
      update: {},
      create: {
        clerkId: 'test_user_001',
        email: 'test@threadly.com',
        firstName: 'Test',
        lastName: 'Seller',
        verified: true,
      },
    });

    // Get some categories
    const womenClothing = await prisma.category.findFirst({
      where: { slug: 'women-clothing' },
    });

    const menClothing = await prisma.category.findFirst({
      where: { slug: 'men-clothing' },
    });

    const designerBags = await prisma.category.findFirst({
      where: { slug: 'designer-bags' },
    });

    if (!(womenClothing && menClothing && designerBags)) {
      console.error('❌ Categories not found. Run seed-categories.ts first!');
      return;
    }

    // Sample products
    const products = [
      {
        title: 'Vintage Denim Jacket',
        description:
          'Classic 90s style denim jacket in excellent condition. Perfect for layering.',
        price: 45.0,
        condition: 'VERY_GOOD' as const,
        categoryId: womenClothing.id,
        brand: "Levi's",
        size: 'M',
        color: 'Blue',
        sellerId: testUser.id,
      },
      {
        title: 'Designer Leather Handbag',
        description:
          'Authentic luxury handbag with dust bag and authentication card. Minor signs of wear.',
        price: 850.0,
        condition: 'GOOD' as const,
        categoryId: designerBags.id,
        brand: 'Gucci',
        color: 'Black',
        sellerId: testUser.id,
      },
      {
        title: 'Mens Wool Coat',
        description:
          'Premium wool coat, barely worn. Perfect for winter. Retail $500+',
        price: 125.0,
        condition: 'NEW_WITHOUT_TAGS' as const,
        categoryId: menClothing.id,
        brand: 'Zara',
        size: 'L',
        color: 'Navy',
        sellerId: testUser.id,
      },
      {
        title: 'Summer Floral Dress',
        description:
          'Beautiful floral print dress, perfect for summer occasions. Worn once.',
        price: 35.0,
        condition: 'VERY_GOOD' as const,
        categoryId: womenClothing.id,
        brand: 'H&M',
        size: 'S',
        color: 'Multicolor',
        sellerId: testUser.id,
      },
      {
        title: 'Limited Edition Sneakers',
        description:
          'Rare collaboration sneakers, comes with original box. Authenticated.',
        price: 450.0,
        condition: 'NEW_WITH_TAGS' as const,
        categoryId: menClothing.id,
        brand: 'Nike x Off-White',
        size: '10',
        color: 'White/Black',
        sellerId: testUser.id,
      },
    ];

    // Create products
    for (const productData of products) {
      const product = await prisma.product.create({
        data: {
          ...productData,
          images: {
            create: [],
          },
        },
      });
    }

    // Show summary
    const totalProducts = await prisma.product.count();
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
