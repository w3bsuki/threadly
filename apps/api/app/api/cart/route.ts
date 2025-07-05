import { NextRequest, NextResponse } from 'next/server';
import { database } from '@repo/database';
import { auth } from '@repo/auth/server';
import { z } from 'zod';

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const user = await auth();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cartItems = await database.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            images: {
              orderBy: { displayOrder: 'asc' },
              take: 1
            },
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to match client expectations
    const items = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      title: item.product.title,
      price: Number(item.product.price),
      imageUrl: item.product.images[0]?.imageUrl || '',
      size: item.product.size || '',
      condition: item.product.condition,
      sellerId: item.product.sellerId,
      sellerName: [item.product.seller.firstName, item.product.seller.lastName].filter(Boolean).join(' ') || 'Unknown Seller',
      quantity: 1, // Currently not tracking quantity in DB
      status: item.product.status
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
const addToCartSchema = z.object({
  productId: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = addToCartSchema.parse(body);

    // Check if product exists and is available
    const product = await database.product.findUnique({
      where: { id: productId },
      select: { 
        id: true, 
        status: true,
        sellerId: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Product is not available' }, { status: 400 });
    }

    // Can't add own products to cart
    if (product.sellerId === user.id) {
      return NextResponse.json({ error: 'Cannot add your own product to cart' }, { status: 400 });
    }

    // Check if already in cart
    const existingItem = await database.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId
        }
      }
    });

    if (existingItem) {
      return NextResponse.json({ error: 'Product already in cart' }, { status: 400 });
    }

    // Add to cart
    const cartItem = await database.cartItem.create({
      data: {
        userId: user.id,
        productId
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: { displayOrder: 'asc' },
              take: 1
            },
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    const item = {
      id: cartItem.id,
      productId: cartItem.productId,
      title: cartItem.product.title,
      price: Number(cartItem.product.price),
      imageUrl: cartItem.product.images[0]?.imageUrl || '',
      size: cartItem.product.size || '',
      condition: cartItem.product.condition,
      sellerId: cartItem.product.sellerId,
      sellerName: [cartItem.product.seller.firstName, cartItem.product.seller.lastName].filter(Boolean).join(' ') || 'Unknown Seller',
      quantity: 1,
      status: cartItem.product.status
    };

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

// DELETE /api/cart/:productId - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const deleted = await database.cartItem.deleteMany({
      where: {
        userId: user.id,
        productId
      }
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}

// PATCH /api/cart/clear - Clear entire cart
export async function PATCH(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    if (url.pathname.endsWith('/clear')) {
      await database.cartItem.deleteMany({
        where: { userId: user.id }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}