import { NextRequest, NextResponse } from 'next/server';
import { database } from '@repo/database';
import { generalApiLimit, checkRateLimit } from '@repo/security';
import { getCacheService } from '@repo/cache';

// Initialize cache service
const cache = getCacheService({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// GET /api/users/[id]/followers - Get user's followers
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

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { id: true },
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

    // Cache key with pagination
    const cacheKey = `user:${userId}:followers:page:${page}:limit:${limit}`;

    const result = await cache.remember(
      cacheKey,
      async () => {
        // Get followers with pagination
        const [followers, totalCount] = await Promise.all([
          database.follow.findMany({
            where: {
              followingId: userId,
            },
            include: {
              follower: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                  bio: true,
                  verified: true,
                  _count: {
                    select: {
                      listings: {
                        where: {
                          status: 'AVAILABLE',
                        },
                      },
                      followers: true,
                      following: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            skip,
            take: limit,
          }),
          database.follow.count({
            where: {
              followingId: userId,
            },
          }),
        ]);

        return {
          followers: followers.map(f => ({
            ...f.follower,
            followedAt: f.createdAt,
          })),
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: skip + limit < totalCount,
          },
        };
      },
      300 // Cache for 5 minutes
    );

    // Add cache headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    return NextResponse.json({
      success: true,
      data: result,
    }, { headers });
  } catch (error) {
    console.error('Get followers error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get followers' 
      },
      { status: 500 }
    );
  }
}