import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { validatePaginationParams, buildCursorWhere, processPaginationResult } from '@repo/design-system/lib/pagination';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const user = await currentUser();

    // Verify user is authenticated and requesting their own data
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });

    if (!dbUser || dbUser.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const pagination = validatePaginationParams(searchParams);

    // Fetch products with pagination
    const products = await database.product.findMany({
      where: {
        sellerId: userId,
        ...buildCursorWhere(pagination.cursor),
      },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
          take: 1,
        },
        category: true,
        _count: {
          select: {
            orders: true,
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: pagination.limit,
    });

    // Get total count for first request
    const totalCount = pagination.cursor ? undefined : await database.product.count({
      where: { sellerId: userId },
    });

    // Process pagination result
    const result = processPaginationResult(products, pagination.limit, totalCount);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching user products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}