import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { checkRateLimit, generalApiLimit } from '@repo/security';
import { type NextRequest, NextResponse } from 'next/server';

// DELETE /api/cart/clear - Clear entire cart
export async function DELETE(request: NextRequest) {
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

  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await database.cartItem.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { log } = await import('@repo/observability/server');
    log.error('Error clearing cart', { error, userId });
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
