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
    
    // Test 3: Get ALL products with minimal details to debug
    const allProducts = await database.product.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        sellerId: true,
        categoryId: true,
        createdAt: true,
        _count: {
          select: {
            images: true
          }
        }
      }
    });
    
    // Test 4: Run the EXACT same query as ProductGridServer
    const productsWithFullQuery = await database.product.findMany({
      where: { status: ProductStatus.AVAILABLE },
      include: {
        images: { orderBy: { displayOrder: 'asc' }, take: 1 },
        seller: { 
          select: { 
            id: true,
            firstName: true, 
            lastName: true,
            location: true,
            averageRating: true
          } 
        },
        category: { select: { name: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 24,
    });
    
    // Test 5: Check categories
    const categories = await database.category.count();
    console.log(`[TestDB] Total categories: ${categories}`);
    
    // Test 6: Check users
    const users = await database.user.count();
    console.log(`[TestDB] Total users: ${users}`);
    
    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        availableProducts,
        totalCategories: categories,
        totalUsers: users,
        allProducts: allProducts.map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          sellerId: p.sellerId,
          categoryId: p.categoryId,
          imageCount: p._count.images,
          createdAt: p.createdAt
        })),
        productsFromExactQuery: productsWithFullQuery.length,
        sampleFromExactQuery: productsWithFullQuery.slice(0, 3).map(p => ({
          id: p.id,
          title: p.title,
          hasImages: p.images.length > 0,
          hasSeller: !!p.seller,
          hasCategory: !!p.category
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