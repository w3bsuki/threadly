import { database, ProductStatus } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await database.product.findMany({
      where: { status: ProductStatus.AVAILABLE },
      include: {
        images: true,
        seller: true,
        category: true,
      },
      take: 5,
    });

    return NextResponse.json({
      count: products.length,
      products: products.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price.toString(),
        images: p.images.length,
        seller: p.seller.email,
        category: p.category?.name,
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}