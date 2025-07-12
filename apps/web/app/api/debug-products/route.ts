import { database } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const productCount = await database.product.count();
    const categoryCount = await database.category.count();
    const userCount = await database.user.count();
    
    const products = await database.product.findMany({
      take: 5,
      include: {
        images: true,
        category: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return NextResponse.json({
      counts: {
        products: productCount,
        categories: categoryCount,
        users: userCount
      },
      sampleProducts: products.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        status: p.status,
        seller: p.seller?.firstName,
        category: p.category?.name,
        imageCount: p.images.length
      }))
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}