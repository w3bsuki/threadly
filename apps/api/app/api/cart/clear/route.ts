import { NextResponse } from 'next/server';
import { database } from '@repo/database';
import { auth } from '@repo/auth/server';

// DELETE /api/cart/clear - Clear entire cart
export async function DELETE() {
  try {
    const user = await auth();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await database.cartItem.deleteMany({
      where: { userId: user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}