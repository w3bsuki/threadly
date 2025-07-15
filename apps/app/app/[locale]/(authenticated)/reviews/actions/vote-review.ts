'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { logError } from '@repo/observability/server';

const voteReviewSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  isHelpful: z.boolean(),
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
      where: { clerkId: user.id }
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

    // Check for existing vote
    const existingVote = await database.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: validatedInput.reviewId,
          userId: dbUser.id,
        },
      },
    });

    if (existingVote) {
      if (existingVote.isHelpful === validatedInput.isHelpful) {
        // Remove vote if clicking the same button
        await database.reviewVote.delete({
          where: {
            id: existingVote.id,
          },
        });

        // Update helpful count
        const newCount = review.helpfulCount + (existingVote.isHelpful ? -1 : 1);
        await database.review.update({
          where: {
            id: validatedInput.reviewId,
          },
          data: {
            helpfulCount: Math.max(0, newCount),
          },
        });

        return {
          success: true,
          action: 'removed',
        };
      } else {
        // Update existing vote
        await database.reviewVote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            isHelpful: validatedInput.isHelpful,
          },
        });

        // Update helpful count
        const newCount = review.helpfulCount + (validatedInput.isHelpful ? 2 : -2);
        await database.review.update({
          where: {
            id: validatedInput.reviewId,
          },
          data: {
            helpfulCount: Math.max(0, newCount),
          },
        });

        return {
          success: true,
          action: 'updated',
        };
      }
    } else {
      // Create new vote
      await database.reviewVote.create({
        data: {
          reviewId: validatedInput.reviewId,
          userId: dbUser.id,
          isHelpful: validatedInput.isHelpful,
        },
      });

      // Update helpful count
      const newCount = review.helpfulCount + (validatedInput.isHelpful ? 1 : -1);
      await database.review.update({
        where: {
          id: validatedInput.reviewId,
        },
        data: {
          helpfulCount: Math.max(0, newCount),
        },
      });

      return {
        success: true,
        action: 'created',
      };
    }

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
      error: error instanceof Error ? error.message : 'Failed to vote on review',
    };
  }
}