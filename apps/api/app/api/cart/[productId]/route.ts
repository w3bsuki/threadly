import { NextRequest, NextResponse } from 'next/server';
import { database } from '@repo/database';
import { auth } from '@repo/auth/server';
import { generalApiLimit, checkRateLimit } from '@repo/security';

// DELETE /api/cart/:productId - Remove specific item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
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

    const { productId } = await params;

    const deleted = await database.cartItem.deleteMany({
      where: {
        userId,
        productId
      }
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const { log } = await import('@repo/observability/server');
    log.error('Error removing from cart', { error, userId, productId });
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}