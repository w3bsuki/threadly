import { NextResponse } from 'next/server';
import { database, ProductStatus } from '@repo/database';

export async function GET() {
  try {
    console.log('[TestDB] Starting database test...');
    
    // Test 1: Count all products
    const totalProducts = await database.product.count();
    console.log(`[TestDB] Total products in database: ${totalProducts}`);
    
    // Test 2: Count available products
    const availableProducts = await database.product.count({
      where: { status: ProductStatus.AVAILABLE }
    });
    console.log(`[TestDB] Available products: ${availableProducts}`);
    
    // Test 3: Get first 5 products with details
    const products = await database.product.findMany({
      take: 5,
      include: {
        seller: { select: { id: true, firstName: true, lastName: true } },
        category: { select: { name: true } }
      }
    });
    
    // Test 4: Check categories
    const categories = await database.category.count();
    console.log(`[TestDB] Total categories: ${categories}`);
    
    // Test 5: Check users
    const users = await database.user.count();
    console.log(`[TestDB] Total users: ${users}`);
    
    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        availableProducts,
        totalCategories: categories,
        totalUsers: users,
        sampleProducts: products.map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          price: p.price.toString(),
          seller: `${p.seller.firstName} ${p.seller.lastName || ''}`.trim(),
          category: p.category?.name || 'None'
        }))
      }
    });
  } catch (error) {
    console.error('[TestDB] Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}