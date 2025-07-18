import { createErrorResponse, createSuccessResponse } from '@repo/api-utils';
import { database } from '@repo/database';
import { checkRateLimit, generalApiLimit } from '@repo/security';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for database check endpoint
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return createErrorResponse(new Error('Rate limit exceeded'), {
        status: 429,
        headers: rateLimitResult.headers,
      });
    }

    // Get counts
    const stats = {
      users: await database.user.count(),
      products: await database.product.count(),
      availableProducts: await database.product.count({
        where: { status: 'AVAILABLE' },
      }),
      categories: await database.category.count(),
      orders: await database.order.count(),
      reviews: await database.review.count(),
    };

    // Get sample products
    const sampleProducts = await database.product.findMany({
      take: 5,
      include: {
        images: true,
        category: true,
        seller: true,
      },
    });

    const diagnosis =
      stats.products === 0
        ? 'No products in database - run pnpm seed'
        : stats.availableProducts === 0
          ? 'Products exist but none are AVAILABLE'
          : 'Database has products';

    return createSuccessResponse({
      stats,
      sampleProducts,
      diagnosis,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
