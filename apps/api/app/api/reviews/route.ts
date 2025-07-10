import { database } from '@repo/database';
import type { Prisma } from '@repo/database';
import { currentUser } from '@repo/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logError } from '@repo/observability/server';
import { generalApiLimit, checkRateLimit } from '@repo/security';

// Schema for creating a review
const createReviewSchema = z.object({
  orderId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// GET /api/reviews - Get reviews for a user or product
export async function GET(request: NextRequest) {
  // Check rate limit first
  const rateLimitResult = await checkRateLimit(generalApiLimit, request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: rateLimitResult.error?.message || 'Rate limit exceeded',
        code: rateLimitResult.error?.code || 'RATE_LIMIT_EXCEEDED' 
      },
      { 
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!userId && !productId) {
      return NextResponse.json(
        { error: 'Either userId or productId is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: Prisma.ReviewWhereInput = {};
    
    if (userId) {
      where.reviewedId = userId;
    }
    
    if (productId) {
      where.order = {
        productId,
      };
    }

    // Get reviews with related data
    const [reviews, total] = await Promise.all([
      database.review.findMany({
        where,
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          reviewed: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          order: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  images: {
                    take: 1,
                    orderBy: { displayOrder: 'asc' },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      database.review.count({ where }),
    ]);

    // Calculate average rating if getting user reviews
    let averageRating = null;
    if (userId) {
      const result = await database.review.aggregate({
        where: { reviewedId: userId },
        _avg: { rating: true },
        _count: true,
      });
      averageRating = result._avg.rating;
    }

    return NextResponse.json({
      reviews,
      averageRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a review after order completion
export async function POST(request: NextRequest) {
  // Check rate limit first
  const rateLimitResult = await checkRateLimit(generalApiLimit, request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: rateLimitResult.error?.message || 'Rate limit exceeded',
        code: rateLimitResult.error?.code || 'RATE_LIMIT_EXCEEDED' 
      },
      { 
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
  }

  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, rating, comment } = createReviewSchema.parse(body);

    // Get order details
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        review: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user is the buyer
    if (order.buyerId !== user.id) {
      return NextResponse.json(
        { error: 'Only the buyer can review this order' },
        { status: 403 }
      );
    }

    // Check if order is delivered
    if (order.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'Can only review delivered orders' },
        { status: 400 }
      );
    }

    // Check if already reviewed
    if (order.review) {
      return NextResponse.json(
        { error: 'Order already reviewed' },
        { status: 400 }
      );
    }

    // Create review in a transaction
    const review = await database.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.review.create({
        data: {
          orderId,
          reviewerId: user.id,
          reviewedId: order.sellerId,
          rating,
          comment,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          reviewed: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          order: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update seller's average rating
      const avgResult = await tx.review.aggregate({
        where: { reviewedId: order.sellerId },
        _avg: { rating: true },
      });

      if (avgResult._avg.rating !== null) {
        await tx.user.update({
          where: { id: order.sellerId },
          data: { averageRating: avgResult._avg.rating },
        });
      }

      return newReview;
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    logError('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}