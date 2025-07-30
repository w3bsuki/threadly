import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { logError } from '@repo/tooling/observability/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const toggleFavoriteSchema = z.object({
  productId: z.string().min(1),
});

// POST /api/favorites/toggle - Toggle favorite status
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { productId } = toggleFavoriteSchema.parse(body);

    // Check if product exists
    const product = await database.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check current favorite status
    const existingFavorite = await database.favorite.findUnique({
      where: {
        userId_productId: {
          userId: dbUser.id,
          productId,
        },
      },
    });

    let isFavorited: boolean;
    let message: string;

    if (existingFavorite) {
      // Remove favorite
      await database.favorite.delete({
        where: {
          userId_productId: {
            userId: dbUser.id,
            productId,
          },
        },
      });
      isFavorited = false;
      message = 'Product removed from favorites';
    } else {
      // Add favorite
      await database.favorite.create({
        data: {
          userId: dbUser.id,
          productId,
        },
      });
      isFavorited = true;
      message = 'Product added to favorites';
    }

    // Get updated favorite count
    const favoriteCount = await database.favorite.count({
      where: { productId },
    });

    return NextResponse.json({
      message,
      isFavorited,
      favoriteCount,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    logError('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}
