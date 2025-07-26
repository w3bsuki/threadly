import { auth } from '@repo/auth/server';
import { getCacheService } from '@repo/cache';
import { database } from '@repo/database';
import { logError } from '@repo/observability/server';
import { checkRateLimit, generalApiLimit } from '@repo/security';
import { type NextRequest, NextResponse } from 'next/server';

// Initialize cache service
const cache = getCacheService({
  url:
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.REDIS_URL ||
    'redis://localhost:6379',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
});

// POST /api/users/[id]/follow - Follow a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit check
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Get current user data
    const user = await database.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, firstName: true, lastName: true, imageUrl: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    const resolvedParams = await params;
    const userToFollowId = resolvedParams.id;

    // Prevent self-following
    if (user.id === userToFollowId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot follow yourself',
        },
        { status: 400 }
      );
    }

    // Check if user to follow exists
    const userToFollow = await database.user.findUnique({
      where: { id: userToFollowId },
      select: { id: true },
    });

    if (!userToFollow) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await database.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: userToFollowId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Already following this user',
        },
        { status: 400 }
      );
    }

    // Create follow relationship
    const follow = await database.follow.create({
      data: {
        followerId: user.id,
        followingId: userToFollowId,
      },
      include: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    // Create notification for the followed user
    await database.notification.create({
      data: {
        userId: userToFollowId,
        title: 'New Follower',
        message: `${user.firstName || 'Someone'} started following you`,
        type: 'SYSTEM',
        metadata: JSON.stringify({
          followerId: user.id,
          followerName: user.firstName || 'User',
          followerImage: user.imageUrl,
        }),
      },
    });

    // Invalidate cache
    await Promise.all([
      cache.invalidateUser(user.id),
      cache.invalidateUser(userToFollowId),
    ]);

    return NextResponse.json({
      success: true,
      data: follow,
    });
  } catch (error) {
    logError('Follow error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to follow user',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/follow - Unfollow a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit check
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Get current user data
    const user = await database.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    const resolvedParams = await params;
    const userToUnfollowId = resolvedParams.id;

    // Find and delete follow relationship
    const follow = await database.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: userToUnfollowId,
        },
      },
    });

    if (!follow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not following this user',
        },
        { status: 400 }
      );
    }

    await database.follow.delete({
      where: {
        id: follow.id,
      },
    });

    // Invalidate cache
    await Promise.all([
      cache.invalidateUser(user.id),
      cache.invalidateUser(userToUnfollowId),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Successfully unfollowed user',
    });
  } catch (error) {
    logError('Unfollow error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unfollow user',
      },
      { status: 500 }
    );
  }
}

// GET /api/users/[id]/follow - Check if following a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit check
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Get current user data
    const user = await database.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;

    // Check if following
    const follow = await database.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetUserId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: !!follow,
        followedAt: follow?.createdAt || null,
      },
    });
  } catch (error) {
    logError('Check follow error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check follow status',
      },
      { status: 500 }
    );
  }
}
