'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

const createReviewSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(1, 'Comment is required').max(1000, 'Comment must be less than 1000 characters'),
});

export async function createReview(input: z.infer<typeof createReviewSchema>) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Validate input
    const validatedInput = createReviewSchema.parse(input);

    // Verify the order exists and belongs to this user
    const order = await database.order.findUnique({
      where: {
        id: validatedInput.orderId,
      },
      include: {
        product: {
          include: {
            seller: true,
          },
        },
        review: true, // Check if review already exists
      },
    });

    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    if (order.buyerId !== dbUser.id) {
      return {
        success: false,
        error: 'You can only review your own orders',
      };
    }

    if (order.status !== 'DELIVERED') {
      return {
        success: false,
        error: 'You can only review delivered orders',
      };
    }

    if (order.review) {
      return {
        success: false,
        error: 'You have already reviewed this order',
      };
    }

    // Create the review
    const review = await database.review.create({
      data: {
        orderId: validatedInput.orderId,
        reviewerId: dbUser.id,
        reviewedId: order.sellerId, // Review is for the seller
        rating: validatedInput.rating,
        comment: validatedInput.comment,
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
        order: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // Update seller's average rating
    const sellerReviews = await database.review.findMany({
      where: {
        reviewedId: order.sellerId,
      },
      select: {
        rating: true,
      },
    });

    const averageRating = sellerReviews.reduce((sum, review) => sum + review.rating, 0) / sellerReviews.length;

    await database.user.update({
      where: {
        id: order.sellerId,
      },
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      },
    });

    return {
      success: true,
      review,
    };

  } catch (error) {
    logError('Failed to create review:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid review data',
        details: error.issues,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create review',
    };
  }
}