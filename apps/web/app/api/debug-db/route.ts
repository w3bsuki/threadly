import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get product counts and latest product
    const [totalProducts, availableProducts, latestProduct] = await Promise.all([
      database.product.count(),
      database.product.count({ where: { status: 'AVAILABLE' } }),
      database.product.findFirst({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
        }
      })
    ]);

    // Get database connection info (without exposing sensitive data)
    const dbInfo = {
      source: 'customer-web-app',
      timestamp: new Date().toISOString(),
      stats: {
        totalProducts,
        availableProducts,
        latestProduct,
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
      }
    };

    return NextResponse.json(dbInfo);
  } catch (error) {
    return NextResponse.json({
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      source: 'customer-web-app',
    }, { status: 500 });
  }
}