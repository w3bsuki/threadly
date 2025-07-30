'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { logError } from '@repo/tooling/observability/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const voteReviewSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  helpful: z.boolean(),
});

export async function voteReview(input: z.infer<typeof voteReviewSchema>) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Validate input
    const validatedInput = voteReviewSchema.parse(input);

    // Check if review exists
    const review = await database.review.findUnique({
      where: {
        id: validatedInput.reviewId,
      },
    });

    if (!review) {
      return {
        success: false,
        error: 'Review not found',
      };
    }

    // Check if user is voting on their own review
    if (review.reviewerId === dbUser.id) {
      return {
        success: false,
        error: 'You cannot vote on your own review',
      };
    }

    // TODO: Add ReviewVote model to database schema
    const existingVote = null;

    // TODO: Implement review voting when ReviewVote model is added
    return {
      success: false,
      error: 'Review voting not implemented',
    };
  } catch (error) {
    logError('Failed to vote on review:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid vote data',
        details: error.issues,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to vote on review',
    };
  }
}
