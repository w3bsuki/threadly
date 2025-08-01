import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { checkRateLimit, generalApiLimit } from '@repo/auth/security';
import { type NextRequest, NextResponse } from 'next/server';

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
        code: rateLimitResult.error?.code || 'RATE_LIMIT_EXCEEDED',
      },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
  }

  let userId: string | null = null;
  let productId: string | undefined;

  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    productId = resolvedParams.productId;

    const deleted = await database.cartItem.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const { logError } = await import('@repo/tooling/observability/server');
    logError('Error removing from cart', { error, userId, productId });
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
