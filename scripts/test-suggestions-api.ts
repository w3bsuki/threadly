import { PrismaClient } from '../packages/database/generated/client';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error(
    'Please set the DATABASE_URL environment variable before running this script'
  );
  process.exit(1);
}

const database = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function testSuggestionsLogic() {
  try {
    const query = 'leather';
    const searchTerm = query.toLowerCase().trim();
    const suggestions: any[] = [];

    // Get product suggestions (top 3)
    const products = await database.product.findMany({
      where: {
        status: 'AVAILABLE',
        title: {
          contains: searchTerm,
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
      take: 3,
    });

    products.forEach((product) => {
      suggestions.push({
        id: product.id,
        title: product.title,
        type: 'product',
        brand: product.brand,
        category: product.category?.name,
      });
    });

    // Get brand suggestions (top 2)
    const brands = await database.product.groupBy({
      by: ['brand'],
      where: {
        status: 'AVAILABLE',
        brand: {
          not: null,
          contains: searchTerm,
        },
      },
      _count: {
        brand: true,
      },
      orderBy: {
        _count: {
          brand: 'desc',
        },
      },
      take: 2,
    });

    brands.forEach((brand, index) => {
      if (brand.brand) {
        suggestions.push({
          id: `brand-${index}`,
          title: brand.brand,
          type: 'brand',
        });
      }
    });

    // Get category suggestions (top 2)
    const categories = await database.category.findMany({
      where: {
        name: {
          contains: searchTerm,
        },
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: 'AVAILABLE',
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: 2,
    });

    categories.forEach((category) => {
      suggestions.push({
        id: category.id,
        title: category.name,
        type: 'category',
      });
    });

    const finalSuggestions = suggestions.slice(0, 7);
  } catch (error) {
    console.error('❌ Error testing suggestions:', error);
  } finally {
    await database.$disconnect();
  }
}

testSuggestionsLogic();
