import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

export async function GET() {
  try {
    const products = await database.product.findMany({
      where: {
        status: 'AVAILABLE',
      },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
          take: 1,
        },
        category: {
          include: {
            parent: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            location: true,
            averageRating: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    logError('Failed to fetch products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}