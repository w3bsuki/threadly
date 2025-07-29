import { currentUser } from '@repo/auth/server';
import { getCacheService } from '@repo/database';
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

// GET /api/users/[id] - Get user profile with stats
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

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // Get current user to check if following
    const clerkUser = await currentUser();
    const currentUserId = clerkUser?.id;

    // Cache user profile
    const userProfile = await cache.remember(
      `user:${userId}:profile`,
      async () => {
        const user = await database.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            clerkId: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            bio: true,
            location: true,
            joinedAt: true,
            verified: true,
            totalSales: true,
            totalPurchases: true,
            averageRating: true,
            _count: {
              select: {
                Product: {
                  where: {
                    status: 'AVAILABLE',
                  },
                },
                followers: true,
                following: true,
                reviewsReceived: true,
              },
            },
          },
        });

        if (!user) {
          return null;
        }

        // Get recent listings
        const recentListings = await database.product.findMany({
          where: {
            sellerId: userId,
            status: 'AVAILABLE',
          },
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              select: {
                imageUrl: true,
                alt: true,
              },
              orderBy: {
                displayOrder: 'asc',
              },
              take: 1,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 6,
        });

        return {
          ...user,
          recentListings,
        };
      },
      300 // Cache for 5 minutes
    );

    if (!userProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Check if current user follows this user (not cached)
    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const currentUserDb = await database.user.findUnique({
        where: { clerkId: currentUserId },
        select: { id: true },
      });

      if (currentUserDb) {
        const follow = await database.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserDb.id,
              followingId: userId,
            },
          },
        });
        isFollowing = !!follow;
      }
    }

    // Add cache headers
    const headers = new Headers();
    headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          ...userProfile,
          isFollowing,
          isOwnProfile: currentUserId === userProfile.clerkId,
        },
      },
      { headers }
    );
  } catch (error) {
    logError('Get user profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get user profile',
      },
      { status: 500 }
    );
  }
}
