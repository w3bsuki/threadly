import { NextRequest, NextResponse } from 'next/server';
import { database } from '@repo/database';
import { auth } from '@repo/auth/server';
import { generalApiLimit, checkRateLimit } from '@repo/security';

// DELETE /api/cart/clear - Clear entire cart
export async function DELETE(request: NextRequest) {
  // Check rate limit first
  const rateLimitResult = await checkRateLimit(generalApiLimit, request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: rateLimitResult.error?.message || 'Rate limit exceeded',
        code: rateLimitResult.error?.code || 'RATE_LIMIT_EXCEEDED' 
      },
      { 
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await database.cartItem.deleteMany({
      where: { userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}