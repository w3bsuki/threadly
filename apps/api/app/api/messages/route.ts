import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { logError } from '@repo/tooling/observability/server';
import { getPusherServer } from '@repo/features/notifications/src/realtime/server';
import { checkRateLimit, messageRateLimit } from '@repo/auth/security';
import { sanitizeForDisplay } from '@repo/api/utils/src/validation/sanitize';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for listing messages
const listMessagesSchema = z.object({
  conversationId: z.string().min(1),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// Schema for sending a message
const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1).max(1000),
  imageUrl: z.string().url().optional(),
});

// Helper function to check if user has access to conversation
async function checkUserAccessToConversation(
  conversationId: string,
  userId: string
) {
  const user = await database.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return { hasAccess: false, error: 'User not found', user: null };
  }

  const conversation = await database.conversation.findUnique({
    where: { id: conversationId },
    select: {
      buyerId: true,
      sellerId: true,
      status: true,
    },
  });

  if (!conversation) {
    return { hasAccess: false, error: 'Conversation not found', user: null };
  }

  const isParticipant =
    conversation.buyerId === user.id || conversation.sellerId === user.id;

  if (!isParticipant) {
    return { hasAccess: false, error: 'Access denied', user: null };
  }

  if (conversation.status === 'ARCHIVED') {
    return { hasAccess: false, error: 'Conversation is archived', user: null };
  }

  return { hasAccess: true, user, conversation };
}

// GET /api/messages - Get messages for a conversation with pagination
export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(messageRateLimit, request);
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

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);

    const { conversationId, page, limit } = listMessagesSchema.parse(params);

    // Check access to conversation
    const accessCheck = await checkUserAccessToConversation(
      conversationId,
      userId
    );
    if (!accessCheck.hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: accessCheck.error,
        },
        { status: accessCheck.error === 'Conversation not found' ? 404 : 403 }
      );
    }

    const skip = (page - 1) * limit;

    // Get messages with pagination (newest first)
    const [messages, total] = await Promise.all([
      database.message.findMany({
        where: {
          conversationId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
      }),
      database.message.count({
        where: {
          conversationId,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Mark messages as read if user is the recipient
    const messagesToMarkAsRead = messages.filter(
      (msg) => msg.senderId !== accessCheck.user?.id && !msg.read
    );

    if (messagesToMarkAsRead.length > 0) {
      await database.message.updateMany({
        where: {
          id: {
            in: messagesToMarkAsRead.map((msg) => msg.id),
          },
        },
        data: {
          read: true,
        },
      });
    }

    // Reverse messages to show oldest first for better UX
    const reversedMessages = messages.reverse();

    return NextResponse.json({
      success: true,
      data: {
        messages: reversedMessages.map((msg) => ({
          ...msg,
          isOwnMessage: msg.senderId === accessCheck.user?.id,
        })),
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
    logError('Error fetching messages:', error);

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
        error: 'Failed to fetch messages',
      },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new message in a conversation
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(messageRateLimit, request);
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
    const validatedData = sendMessageSchema.parse(body);

    // Check access to conversation
    const accessCheck = await checkUserAccessToConversation(
      validatedData.conversationId,
      userId
    );
    if (!accessCheck.hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: accessCheck.error,
        },
        { status: accessCheck.error === 'Conversation not found' ? 404 : 403 }
      );
    }

    // Create the message with sanitized content
    const message = await database.message.create({
      data: {
        conversationId: validatedData.conversationId,
        senderId: accessCheck.user!.id,
        content: sanitizeForDisplay(validatedData.content),
        imageUrl: validatedData.imageUrl,
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    // Update conversation's updatedAt timestamp
    await database.conversation.update({
      where: { id: validatedData.conversationId },
      data: {
        updatedAt: new Date(),
      },
    });

    // Send real-time notification
    try {
      const pusherServer = getPusherServer({
        pusherAppId: process.env.PUSHER_APP_ID || '',
        pusherKey: process.env.PUSHER_KEY || '',
        pusherSecret: process.env.PUSHER_SECRET || '',
        pusherCluster: process.env.PUSHER_CLUSTER || '',
      });

      await pusherServer.sendMessage({
        id: message.id,
        conversationId: validatedData.conversationId,
        senderId: accessCheck.user!.id,
        content: message.content,
        createdAt: message.createdAt,
      });
    } catch (error) {
      logError('Failed to send real-time message:', error);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message: {
            ...message,
            isOwnMessage: true,
          },
        },
        message: 'Message sent successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    logError('Error sending message:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid message data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send message',
      },
      { status: 500 }
    );
  }
}
