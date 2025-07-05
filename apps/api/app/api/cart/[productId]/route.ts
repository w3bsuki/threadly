import { NextRequest, NextResponse } from 'next/server';
import { database } from '@repo/database';
import { auth } from '@repo/auth/server';

// DELETE /api/cart/:productId - Remove specific item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await auth();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await params;

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