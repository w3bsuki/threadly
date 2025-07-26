import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { logError } from '@repo/observability/server';
import { checkRateLimit, generalApiLimit } from '@repo/security';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const deliverOrderSchema = z.object({
  deliveryNotes: z.string().optional(),
  photos: z.array(z.string()).optional(), // Array of image URLs for delivery proof
});

// POST /api/orders/[id]/deliver - Mark order as delivered
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit check
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Get current user data
    const user = await database.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    // Parse request body (optional for delivery confirmation)
    let validatedData = {};
    try {
      const body = await request.json();
      validatedData = deliverOrderSchema.parse(body);
    } catch {
      // Body is optional for delivery confirmation
      validatedData = {};
    }

    // Find the order and verify ownership
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        Product: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Verify user is the seller
    if (order.sellerId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authorized to update this order',
        },
        { status: 403 }
      );
    }

    // Verify order can be delivered (must be SHIPPED)
    if (order.status !== 'SHIPPED') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot mark as delivered. Order status: ${order.status}. Order must be shipped first.`,
        },
        { status: 400 }
      );
    }

    // Update order status to DELIVERED
    const updatedOrder = await database.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        Product: {
          select: {
            title: true,
          },
        },
      },
    });

    // Create notification for buyer
    await database.notification.create({
      data: {
        userId: order.buyer.id,
        title: 'Order Delivered',
        message: `Your order for "${order.Product.title}" has been marked as delivered. You can now leave a review.`,
        type: 'ORDER',
        metadata: JSON.stringify({
          orderId: order.id,
          action: 'delivered',
          deliveryNotes: 'deliveryNotes' in validatedData ? validatedData.deliveryNotes : undefined,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder,
        message: 'Order marked as delivered successfully',
      },
    });
  } catch (error) {
    logError('Deliver order error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark order as delivered',
      },
      { status: 500 }
    );
  }
}
