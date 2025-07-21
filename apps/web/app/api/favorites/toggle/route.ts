import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const toggleFavoriteSchema = z.object({
  productId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = toggleFavoriteSchema.parse(body);

    // Get the database user
    const user = await database.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if favorite already exists
    const existingFavorite = await database.favorite.findFirst({
      where: {
        userId: user.id,
        productId,
      },
    });

    if (existingFavorite) {
      // Remove favorite
      await database.favorite.delete({
        where: { id: existingFavorite.id },
      });

      return NextResponse.json({
        favorited: false,
        message: 'Removed from favorites',
      });
    }
    // Add favorite
    await database.favorite.create({
      data: {
        userId: user.id,
        productId,
      },
    });

    return NextResponse.json({
      favorited: true,
      message: 'Added to favorites',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
