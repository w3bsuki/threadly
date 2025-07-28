import { database } from '@repo/database';
import { log, logError } from '@repo/observability/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    log.info('🌱 Creating categories...');

    const categories = [
      { name: "Women's Clothing", slug: 'womens-clothing' },
      { name: "Men's Clothing", slug: 'mens-clothing' },
      { name: "Kids' Clothing", slug: 'kids-clothing' },
      { name: 'Unisex Accessories', slug: 'unisex-accessories' },
      { name: 'Designer Clothing', slug: 'designer-clothing' },
      { name: 'Shoes', slug: 'shoes' },
      { name: 'Bags & Purses', slug: 'bags-purses' },
      { name: 'Jewelry', slug: 'jewelry' },
      { name: 'Vintage', slug: 'vintage' },
    ];

    const created = [];

    for (const category of categories) {
      try {
        const result = await database.category.upsert({
          where: { slug: category.slug },
          update: {},
          create: category,
        });
        created.push(result);
        log.info(`✅ Created category: ${category.name}`);
      } catch (error) {
        logError(`❌ Failed to create category ${category.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} categories`,
      categories: created,
    });
  } catch (error) {
    logError('Error seeding categories:', error);
    return NextResponse.json(
      { error: 'Failed to seed categories' },
      { status: 500 }
    );
  }
}
