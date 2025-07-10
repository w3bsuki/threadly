import { database, type Prisma } from '@repo/database';
import { currentUser } from '@repo/auth/server';
import { generalApiLimit, checkRateLimit } from '@repo/security';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logError } from '@repo/observability/server';

// Schema for creating an order
const createOrderSchema = z.object({
  productId: z.string().min(1),
  buyerId: z.string().min(1),
  amount: z.number().positive(),
  shippingAddressId: z.string().min(1),
});

// GET /api/orders - List orders (for buyer or seller)
export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
        },
        { 
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') || 'buyer'; // 'buyer' or 'seller'
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build where clause
    const where: Prisma.OrderWhereInput = {};
    
    if (role === 'buyer') {
      where.buyerId = dbUser.id;
    } else if (role === 'seller') {
      where.sellerId = dbUser.id;
    }

    if (status && ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      where.status = status as 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    }

    // Get orders with related data
    const [orders, total] = await Promise.all([
      database.order.findMany({
        where,
        include: {
          product: {
            include: {
              images: true,
              category: true,
            },
          },
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          payment: true,
          review: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      database.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order (called after successful payment)
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get product details
    const product = await database.product.findUnique({
      where: { id: validatedData.productId },
      include: { seller: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      );
    }

    if (product.sellerId === dbUser.id) {
      return NextResponse.json(
        { error: 'Cannot purchase your own product' },
        { status: 400 }
      );
    }

    // Create order in a transaction
    const order = await database.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          buyerId: dbUser.id,
          sellerId: product.sellerId,
          productId: product.id,
          amount: validatedData.amount,
          shippingAddressId: validatedData.shippingAddressId,
          status: 'PENDING', // Will be updated to PAID by payment webhook
        },
        include: {
          product: {
            include: {
              images: true,
              category: true,
            },
          },
          buyer: true,
          seller: true,
        },
      });

      // Mark product as sold
      await tx.product.update({
        where: { id: product.id },
        data: { status: 'SOLD' },
      });

      // Update seller's total sales count
      await tx.user.update({
        where: { id: product.sellerId },
        data: {
          totalSales: { increment: 1 },
        },
      });

      // Update buyer's total purchases count
      await tx.user.update({
        where: { id: dbUser.id },
        data: {
          totalPurchases: { increment: 1 },
        },
      });

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    logError('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}