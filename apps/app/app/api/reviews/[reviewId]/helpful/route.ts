import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { logError } from '@repo/observability/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { reviewId } = await params;
    const { isHelpful } = await request.json();

    // Check if review exists
    const review = await database.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user is voting on their own review
    if (review.reviewerId === dbUser.id) {
      return NextResponse.json(
        { error: 'Cannot vote on your own review' },
        { status: 400 }
      );
    }

    // Check for existing vote
    const existingVote = await database.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId: dbUser.id,
        },
      },
    });

    let action = '';
    
    if (existingVote) {
      if (existingVote.isHelpful === isHelpful) {
        // Remove vote
        await database.reviewVote.delete({
          where: { id: existingVote.id },
        });
        
        await database.review.update({
          where: { id: reviewId },
          data: {
            helpfulCount: Math.max(0, review.helpfulCount + (existingVote.isHelpful ? -1 : 1)),
          },
        });
        
        action = 'removed';
      } else {
        // Update vote
        await database.reviewVote.update({
          where: { id: existingVote.id },
          data: { isHelpful },
        });
        
        await database.review.update({
          where: { id: reviewId },
          data: {
            helpfulCount: Math.max(0, review.helpfulCount + (isHelpful ? 2 : -2)),
          },
        });
        
        action = 'updated';
      }
    } else {
      // Create new vote
      await database.reviewVote.create({
        data: {
          reviewId,
          userId: dbUser.id,
          isHelpful,
        },
      });
      
      await database.review.update({
        where: { id: reviewId },
        data: {
          helpfulCount: Math.max(0, review.helpfulCount + (isHelpful ? 1 : -1)),
        },
      });
      
      action = 'created';
    }

    return NextResponse.json({ success: true, action });
    
  } catch (error) {
    logError('Failed to vote on review:', error);
    return NextResponse.json(
      { error: 'Failed to vote on review' },
      { status: 500 }
    );
  }
}