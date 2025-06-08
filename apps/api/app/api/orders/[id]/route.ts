import { database } from '@repo/database';
import { currentUser } from '@repo/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for updating an order
const updateOrderSchema = z.object({
  status: z.enum(['SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  trackingNumber: z.string().optional(),
  shippedAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
});

// GET /api/orders/[id] - Get a single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await database.order.findUnique({
      where: { id: params.id },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
                totalSales: true,
                averageRating: true,
                joinedAt: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            email: true,
          },
        },
        payment: true,
        review: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user is authorized to view this order
    if (order.buyerId !== user.id && order.sellerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update an order (mainly for sellers to update shipping)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await database.order.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        status: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);

    // Different permissions for different updates
    const updateData: any = {};

    // Sellers can update shipping info
    if (order.sellerId === user.id) {
      if (validatedData.status === 'SHIPPED' && order.status === 'PAID') {
        updateData.status = 'SHIPPED';
        updateData.shippedAt = validatedData.shippedAt || new Date();
        if (validatedData.trackingNumber) {
          updateData.trackingNumber = validatedData.trackingNumber;
        }
      } else if (validatedData.status === 'CANCELLED' && order.status === 'PENDING') {
        updateData.status = 'CANCELLED';
      }
    }

    // Buyers can mark as delivered or cancel pending orders
    if (order.buyerId === user.id) {
      if (validatedData.status === 'DELIVERED' && order.status === 'SHIPPED') {
        updateData.status = 'DELIVERED';
        updateData.deliveredAt = validatedData.deliveredAt || new Date();
      } else if (validatedData.status === 'CANCELLED' && order.status === 'PENDING') {
        updateData.status = 'CANCELLED';
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    const updatedOrder = await database.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        product: {
          include: {
            images: true,
            category: true,
          },
        },
        buyer: true,
        seller: true,
        payment: true,
        review: true,
      },
    });

    // If order was cancelled, mark product as available again
    if (updateData.status === 'CANCELLED') {
      await database.product.update({
        where: { id: order.id },
        data: { status: 'AVAILABLE' },
      });
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Cancel an order (only for pending orders)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await database.order.findUnique({
      where: { id: params.id },
      include: { product: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only buyer or seller can cancel
    if (order.buyerId !== user.id && order.sellerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only pending orders can be cancelled
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending orders can be cancelled' },
        { status: 400 }
      );
    }

    // Cancel order and restore product availability
    await database.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' },
      });

      await tx.product.update({
        where: { id: order.productId },
        data: { status: 'AVAILABLE' },
      });

      // Update user stats
      await tx.user.update({
        where: { id: order.sellerId },
        data: { totalSales: { decrement: 1 } },
      });

      await tx.user.update({
        where: { id: order.buyerId },
        data: { totalPurchases: { decrement: 1 } },
      });
    });

    return NextResponse.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}