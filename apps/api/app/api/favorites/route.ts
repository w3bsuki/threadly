import { database } from '@repo/database';
import { currentUser } from '@repo/auth/server';
import { generalApiLimit, checkRateLimit } from '@repo/security';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logError } from '@repo/observability/server';

// Schema for toggling favorites
const toggleFavoriteSchema = z.object({
  productId: z.string().min(1),
});

// GET /api/favorites - Get user's favorite products
export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
        },
        { 
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get favorites with product details
    const [favorites, total] = await Promise.all([
      database.favorite.findMany({
        where: { userId: user.id },
        include: {
          product: {
            include: {
              images: true,
              category: true,
              seller: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                },
              },
              _count: {
                select: { favorites: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      database.favorite.count({
        where: { userId: user.id },
      }),
    ]);

    // Transform to return just products with favorite info
    const products = favorites.map(fav => ({
      ...fav.product,
      isFavorited: true,
      favoritedAt: fav.createdAt,
    }));

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add a product to favorites
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
        },
        { 
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Check if already favorited
    const existingFavorite = await database.favorite.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Product already favorited' },
        { status: 400 }
      );
    }

    // Create favorite
    const favorite = await database.favorite.create({
      data: {
        userId: user.id,
        productId,
      },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Product added to favorites',
      favorite,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    logError('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove a product from favorites
export async function DELETE(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
        },
        { 
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = toggleFavoriteSchema.parse(body);

    // Delete favorite
    const deleted = await database.favorite.deleteMany({
      where: {
        userId: user.id,
        productId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Product removed from favorites',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    logError('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}