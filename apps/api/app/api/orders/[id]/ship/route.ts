import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { logError } from '@repo/tooling/observability/server';
import { checkRateLimit, generalApiLimit } from '@repo/auth/security';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const shipOrderSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required').optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.string().optional(),
});

// POST /api/orders/[id]/ship - Mark order as shipped
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

    // Parse request body
    const body = await request.json();
    const validatedData = shipOrderSchema.parse(body);

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

    // Verify order can be shipped (must be PAID)
    if (order.status !== 'PAID') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot ship order with status: ${order.status}`,
        },
        { status: 400 }
      );
    }

    // Update order status to SHIPPED
    const updatedOrder = await database.order.update({
      where: { id: orderId },
      data: {
        status: 'SHIPPED',
        shippedAt: new Date(),
        trackingNumber: validatedData.trackingNumber || null,
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
        title: 'Order Shipped',
        message: `Your order for "${order.Product.title}" has been shipped${validatedData.trackingNumber ? ` (Tracking: ${validatedData.trackingNumber})` : ''}`,
        type: 'ORDER',
        metadata: JSON.stringify({
          orderId: order.id,
          trackingNumber: validatedData.trackingNumber,
          carrier: validatedData.carrier,
          estimatedDelivery: validatedData.estimatedDelivery,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder,
        message: 'Order marked as shipped successfully',
      },
    });
  } catch (error) {
    logError('Ship order error:', error);

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
        error: 'Failed to ship order',
      },
      { status: 500 }
    );
  }
}
