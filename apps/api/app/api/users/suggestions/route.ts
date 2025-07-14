import { NextRequest, NextResponse } from 'next/server';
import { database } from '@repo/database';
import { auth } from '@repo/auth/server';
import { generalApiLimit, checkRateLimit } from '@repo/security';
import { getCacheService } from '@repo/cache';
import { logError } from '@repo/observability/server';

// Initialize cache service
const cache = getCacheService({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || 'redis://localhost:6379',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
});

// GET /api/users/suggestions - Get suggested users to follow
export async function GET(request: NextRequest) {
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
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    // Get user info
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { id: true, location: true },
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Cache suggestions per user
    const suggestions = await cache.remember(
      `user:${user.id}:suggestions`,
      async () => {
        // Get users the current user is already following
        const following = await database.follow.findMany({
          where: {
            followerId: user.id,
          },
          select: {
            followingId: true,
          },
        });

        const followingIds = following.map(f => f.followingId);

        // Get suggested users based on various criteria
        const suggestedUsers = await database.user.findMany({
          where: {
            AND: [
              { id: { not: user.id } }, // Not self
              { id: { notIn: followingIds } }, // Not already following
              {
                OR: [
                  // Users with high ratings
                  { averageRating: { gte: 4.5 } },
                  // Verified users
                  { verified: true },
                  // Active sellers
                  { totalSales: { gte: 5 } },
                  // Users in the same location
                  user.location ? { location: user.location } : {},
                ],
              },
            ],
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            bio: true,
            verified: true,
            location: true,
            averageRating: true,
            _count: {
              select: {
                Product: {
                  where: {
                    status: 'AVAILABLE',
                  },
                },
                Follow_Follow_followerIdToUser: true,
                Review_Review_reviewedIdToUser: true,
              },
            },
          },
          orderBy: [
            { Follow_Follow_followerIdToUser: { _count: 'desc' } }, // Popular users first
            { averageRating: 'desc' },
            { totalSales: 'desc' },
          ],
          take: limit * 2, // Get extra to randomize
        });

        // Shuffle and return limited results for variety
        const shuffled = suggestedUsers.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
      },
      3600 // Cache for 1 hour
    );

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logError('Get suggestions error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get suggestions' 
      },
      { status: 500 }
    );
  }
}