import { database } from '@repo/database';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set the DATABASE_URL environment variable before running this script');
  process.exit(1);
}

async function checkProducts() {
  try {
    // Get all products
    const products = await database.product.findMany({
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

    console.log(`\n📊 Total products found: ${products.length}`);
    
    products.forEach((product, index) => {
      console.log(`
Product ${index + 1}:
- ID: ${product.id}
- Title: ${product.title}
- Brand: ${product.brand || 'N/A'}
- Price: $${product.price}
- Category: ${product.category?.name || 'N/A'}
- Status: ${product.status}
- Created: ${product.createdAt.toISOString()}
      `);
    });

    // Test specific searches
    const leatherProducts = await database.product.findMany({
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
    console.log(`\n🔍 Products containing "leather": ${leatherProducts.length}`);
    leatherProducts.forEach(product => {
      console.log(`- ${product.title} (${product.brand || 'No brand'})`);
    });

    const jacketProducts = await database.product.findMany({
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
    console.log(`\n🧥 Products containing "jacket": ${jacketProducts.length}`);
    jacketProducts.forEach(product => {
      console.log(`- ${product.title} (${product.brand || 'No brand'})`);
    });

  } catch (error) {
    console.error('❌ Error checking products:', error);
  }
}

checkProducts();