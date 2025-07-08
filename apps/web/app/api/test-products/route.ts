import { database } from '@repo/database';
import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@repo/api-utils';
import { generalApiLimit, checkRateLimit } from '@repo/security';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for test endpoint
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        new Error('Rate limit exceeded'),
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return createErrorResponse(
        new Error('Test endpoint not available in production'),
        { status: 403 }
      );
    }

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

    return createSuccessResponse({
      count: products.length,
      products,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}