import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { logError } from '@repo/observability/server';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/favorites/check - Check if products are favorited
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get database user from Clerk ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const productIds = searchParams
      .get('productIds')
      ?.split(',')
      .filter(Boolean);

    if (!productIds || productIds.length === 0) {
      return NextResponse.json(
        { error: 'No product IDs provided' },
        { status: 400 }
      );
    }

    // Limit to prevent abuse
    if (productIds.length > 50) {
      return NextResponse.json(
        { error: 'Too many product IDs (max 50)' },
        { status: 400 }
      );
    }

    // Get user's favorites for these products
    const favorites = await database.favorite.findMany({
      where: {
        userId: dbUser.id,
        productId: { in: productIds },
      },
      select: {
        productId: true,
      },
    });

    // Create a map of favorited products
    const favoritedIds = new Set(favorites.map((f) => f.productId));

    // Build response object
    const favoriteStatus: Record<string, boolean> = {};
    productIds.forEach((id) => {
      favoriteStatus[id] = favoritedIds.has(id);
    });

    return NextResponse.json({ favorites: favoriteStatus });
  } catch (error) {
    logError('Error checking favorites:', error);
    return NextResponse.json(
      { error: 'Failed to check favorites' },
      { status: 500 }
    );
  }
}
