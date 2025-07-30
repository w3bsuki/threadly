import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { validatePaginationParams } from '@repo/ui/lib/pagination';
import { checkRateLimit, generalApiLimit } from '@repo/auth/security';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check rate limit for admin operations
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error?.message || 'Rate limit exceeded' },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    const user = await currentUser();

    // Verify user is authenticated and is admin
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get database user to check admin role
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true },
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse pagination and filter parameters
    const searchParams = request.nextUrl.searchParams;
    const pagination = validatePaginationParams(searchParams);
    const search = searchParams.get('q') || '';
    const roleFilter = searchParams.get('role') || 'all';

    // Build where clause with proper types
    interface WhereClause {
      OR?: Array<{
        email?: { contains: string };
        firstName?: { contains: string };
        lastName?: { contains: string };
      }>;
      role?: string;
    }

    const where: WhereClause = {};

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    if (roleFilter !== 'all') {
      where.role = roleFilter.toUpperCase();
    }

    // Custom cursor for joinedAt field (since we order by joinedAt, not createdAt)
    const cursorWhere = pagination.cursor
      ? {
          OR: [
            {
              joinedAt: {
                lt: new Date(
                  Buffer.from(pagination.cursor, 'base64')
                    .toString('utf-8')
                    .split(':')[0]
                ),
              },
            },
            {
              joinedAt: new Date(
                Buffer.from(pagination.cursor, 'base64')
                  .toString('utf-8')
                  .split(':')[0]
              ),
              id: {
                lt: Buffer.from(pagination.cursor, 'base64')
                  .toString('utf-8')
                  .split(':')[1],
              },
            },
          ],
        }
      : {};

    // Fetch users with pagination (using joinedAt for cursor)
    const users = await database.user.findMany({
      where: {
        ...where,
        ...cursorWhere,
      },
      orderBy: { joinedAt: 'desc' },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        role: true,
        verified: true,
        suspended: true,
        joinedAt: true,
        _count: {
          select: {
            Product: true,
            Order_Order_buyerIdToUser: true,
            Order_Order_sellerIdToUser: true,
          },
        },
      },
      take: pagination.limit,
    });

    // Process pagination result (create compatible data for cursor generation)
    const hasNextPage = users.length === pagination.limit;
    const nextCursor =
      hasNextPage && users.length > 0
        ? Buffer.from(
            `${users[users.length - 1].joinedAt.toISOString()}:${users[users.length - 1].id}`
          ).toString('base64')
        : undefined;

    return NextResponse.json({
      items: users,
      nextCursor,
      hasNextPage,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
