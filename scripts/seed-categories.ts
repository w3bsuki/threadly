import { PrismaClient } from '../packages/database/generated/client';

const prisma = new PrismaClient();

const categories = [
  // Women's categories
  {
    name: 'Women',
    slug: 'women',
    children: [
      { name: 'Women Clothing', slug: 'women-clothing' },
      { name: 'Women Shoes', slug: 'women-shoes' },
      { name: 'Women Bags', slug: 'women-bags' },
      { name: 'Women Jewelry', slug: 'women-jewelry' },
      { name: 'Women Accessories', slug: 'women-accessories' },
    ],
  },
  // Men's categories
  {
    name: 'Men',
    slug: 'men',
    children: [
      { name: 'Men Clothing', slug: 'men-clothing' },
      { name: 'Men Shoes', slug: 'men-shoes' },
      { name: 'Men Accessories', slug: 'men-accessories' },
    ],
  },
  // Kids categories
  {
    name: 'Kids',
    slug: 'kids',
    children: [
      { name: 'Kids Clothing', slug: 'kids-clothing' },
      { name: 'Kids Shoes', slug: 'kids-shoes' },
      { name: 'Kids Toys', slug: 'kids-toys' },
    ],
  },
  // Designer category
  {
    name: 'Designer',
    slug: 'designer',
    children: [
      { name: 'Designer Clothing', slug: 'designer-clothing' },
      { name: 'Designer Bags', slug: 'designer-bags' },
      { name: 'Designer Shoes', slug: 'designer-shoes' },
      { name: 'Designer Jewelry', slug: 'designer-jewelry' },
    ],
  },
  // Unisex category
  {
    name: 'Unisex',
    slug: 'unisex',
    children: [
      { name: 'Unisex Clothing', slug: 'unisex-clothing' },
      { name: 'Unisex Accessories', slug: 'unisex-accessories' },
      { name: 'Home Items', slug: 'unisex-home' },
    ],
  },
];

async function seedCategories() {
  for (const category of categories) {
    // Create parent category
    const parent = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
      },
    });

    // Create child categories
    for (const child of category.children) {
      const childCategory = await prisma.category.upsert({
        where: { slug: child.slug },
        update: {},
        create: {
          name: child.name,
          slug: child.slug,
          parentId: parent.id,
        },
      });
    }
  }
}

async function main() {
  try {
    await seedCategories();
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
main();

export { seedCategories };
