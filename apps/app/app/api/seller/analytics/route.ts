import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { z } from 'zod';
import { log } from '@repo/observability/server';
import { getSellerAnalytics, getProductAnalytics } from '../../../../lib/queries/seller-analytics';

const analyticsQuerySchema = z.object({
  productId: z.string().cuid().optional(),
  timeRange: z.enum(['day', 'week', 'month', 'year']).optional().default('week'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validationResult = analyticsQuerySchema.safeParse(query);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, timeRange, startDate, endDate } = validationResult.data;

    // Calculate date range
    let start: Date, end: Date;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      switch (timeRange) {
        case 'day':
          start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
    }

    if (productId) {
      // Verify product ownership
      const product = await database.product.findFirst({
        where: {
          id: productId,
          sellerId: dbUser.id
        }
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const analytics = await getProductAnalytics(productId);
      return NextResponse.json({ analytics });
    } else {
      // Get seller analytics
      const analytics = await getSellerAnalytics(dbUser.id, start, end);
      return NextResponse.json({ analytics });
    }

  } catch (error) {
    log.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { productId, event } = body;

    // Track user interaction
    await database.userInteraction.create({
      data: {
        userId: dbUser.id,
        productId,
        type: event.toUpperCase(),
        metadata: body.metadata || {}
      }
    });

    // Increment view count for VIEW events
    if (event === 'view') {
      await database.product.update({
        where: { id: productId },
        data: { views: { increment: 1 } }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    log.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}