import { auth } from '@repo/auth/server';
import { database, type Prisma } from '@repo/database';
import { logError } from '@repo/observability/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for listing conversations
const listConversationsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});

// Schema for creating a conversation
const createConversationSchema = z.object({
  productId: z.string().min(1),
  message: z.string().min(1).max(1000), // Initial message content
});

// GET /api/messages/conversations - List all conversations for a user
export async function GET(request: NextRequest) {
  try {
    // Check authentication
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

    // Get user from database
    const user = await database.user.findUnique({
      where: { clerkId: userId },
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

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);

    const { page, limit, status } = listConversationsSchema.parse(params);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ConversationWhereInput = {
      OR: [{ buyerId: user.id }, { sellerId: user.id }],
    };

    if (status) {
      where.status = status;
    }

    // Get conversations with last message
    const [conversations, total] = await Promise.all([
      database.conversation.findMany({
        where,
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
        include: {
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
          Product: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
              images: {
                select: {
                  imageUrl: true,
                },
                orderBy: {
                  displayOrder: 'asc',
                },
                take: 1,
              },
            },
          },
          Message: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            include: {
              User: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: {
              Message: {
                where: {
                  read: false,
                  senderId: {
                    not: user.id,
                  },
                },
              },
            },
          },
        },
      }),
      database.conversation.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Format conversations with additional info
    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      status: conv.status,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      isUserBuyer: conv.buyerId === user.id,
      buyer: conv.buyer,
      seller: conv.seller,
      product: conv.Product,
      lastMessage: conv.Message[0] || null,
      unreadCount: conv._count.Message,
    }));

    return NextResponse.json({
      success: true,
      data: {
        conversations: formattedConversations,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    logError('Error fetching conversations:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameters',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conversations',
      },
      { status: 500 }
    );
  }
}

// POST /api/messages/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    // Check authentication
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

    const body = await request.json();
    const validatedData = createConversationSchema.parse(body);

    // Get user from database
    const user = await database.user.findUnique({
      where: { clerkId: userId },
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

    // Get product with seller info
    const product = await database.product.findUnique({
      where: { id: validatedData.productId },
      include: {
        seller: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    // Check if user is trying to message themselves
    if (product.sellerId === user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot message yourself',
        },
        { status: 400 }
      );
    }

    // Check if product is available
    if (product.status !== 'AVAILABLE') {
      return NextResponse.json(
        {
          success: false,
          error: 'Product is no longer available',
        },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await database.conversation.findUnique({
      where: {
        buyerId_sellerId_productId: {
          buyerId: user.id,
          sellerId: product.sellerId,
          productId: product.id,
        },
      },
    });

    if (existingConversation) {
      // Reactivate if archived
      if (existingConversation.status === 'ARCHIVED') {
        await database.conversation.update({
          where: { id: existingConversation.id },
          data: { status: 'ACTIVE' },
        });
      }

      // Add message to existing conversation
      const message = await database.message.create({
        data: {
          conversationId: existingConversation.id,
          senderId: user.id,
          content: validatedData.message,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          conversation: existingConversation,
          message,
        },
        message: 'Message sent to existing conversation',
      });
    }

    // Create new conversation with initial message
    const conversation = await database.conversation.create({
      data: {
        buyerId: user.id,
        sellerId: product.sellerId,
        productId: product.id,
        Message: {
          create: {
            senderId: user.id,
            content: validatedData.message,
          },
        },
      },
      include: {
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
        Product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              select: {
                imageUrl: true,
              },
              orderBy: {
                displayOrder: 'asc',
              },
              take: 1,
            },
          },
        },
        Message: {
          include: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: { conversation },
        message: 'Conversation created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    logError('Error creating conversation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid conversation data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create conversation',
      },
      { status: 500 }
    );
  }
}
