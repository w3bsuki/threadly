/**
 * Server-side messaging utilities
 */

import { database } from '@repo/database';
import { sanitizeForDisplay } from '@repo/validation/sanitize';
import { log, logError } from '@repo/observability/server';
import { getPusherServer } from '@repo/real-time/server';
import type { 
  MessageWithSender, 
  ConversationWithDetails, 
  ConversationListItem,
  MessagesResponse,
  SendMessageResult,
  CreateConversationResult 
} from './types';
import { 
  sendMessageRequestSchema, 
  fetchMessagesRequestSchema, 
  createConversationRequestSchema 
} from './schemas';

/**
 * Get messages for a conversation with pagination
 */
export async function getMessages(
  conversationId: string,
  userId: string,
  options: { page?: number; limit?: number } = {}
): Promise<MessagesResponse> {
  try {
    const { page = 1, limit = 50 } = fetchMessagesRequestSchema.parse({
      conversationId,
      page: options.page,
      limit: options.limit,
    });

    // Verify user has access to the conversation
    const dbUser = await database.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return { success: false, error: 'User not found' };
    }

    const conversation = await database.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true, status: true },
    });

    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    const isParticipant = conversation.buyerId === dbUser.id || conversation.sellerId === dbUser.id;
    if (!isParticipant) {
      return { success: false, error: 'Access denied' };
    }

    if (conversation.status === 'ARCHIVED') {
      return { success: false, error: 'Conversation is archived' };
    }

    const skip = (page - 1) * limit;

    // Get messages with pagination (newest first)
    const [messages, total] = await Promise.all([
      database.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sender: {
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
        where: { conversationId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Mark messages as read if user is the recipient
    const messagesToMarkAsRead = messages.filter(
      (msg) => msg.senderId !== dbUser.id && !msg.read
    );

    if (messagesToMarkAsRead.length > 0) {
      await database.message.updateMany({
        where: {
          id: { in: messagesToMarkAsRead.map((msg) => msg.id) },
        },
        data: { read: true },
      });
    }

    // Reverse messages to show oldest first for better UX
    const reversedMessages = messages.reverse();

    return {
      success: true,
      data: {
        messages: reversedMessages.map((msg) => ({
          ...msg,
          isOwnMessage: msg.senderId === dbUser.id,
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
    };
  } catch (error) {
    logError('Error fetching messages:', error);
    return { success: false, error: 'Failed to fetch messages' };
  }
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  userId: string,
  data: { conversationId: string; content: string; imageUrl?: string }
): Promise<SendMessageResult> {
  try {
    const validatedData = sendMessageRequestSchema.parse(data);

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return { success: false, error: 'User not found in database' };
    }

    // Verify the user is part of this conversation
    const conversation = await database.conversation.findUnique({
      where: { id: validatedData.conversationId },
      include: { product: true },
    });

    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    if (conversation.buyerId !== dbUser.id && conversation.sellerId !== dbUser.id) {
      return { success: false, error: 'You are not authorized to send messages in this conversation' };
    }

    // Create the message with sanitized content
    const message = await database.message.create({
      data: {
        conversationId: validatedData.conversationId,
        senderId: dbUser.id,
        content: sanitizeForDisplay(validatedData.content),
        imageUrl: validatedData.imageUrl,
        read: false,
      },
      include: {
        sender: {
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
      data: { updatedAt: new Date() },
    });

    // Send real-time message notification
    try {
      const pusherServer = getPusherServer({
        pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY!,
        pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        pusherAppId: process.env.PUSHER_APP_ID!,
        pusherSecret: process.env.PUSHER_SECRET!,
      });
      
      await pusherServer.sendMessage({
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt,
      });
    } catch (error) {
      logError('Failed to send real-time message:', error);
    }

    log.info('Message sent successfully', {
      messageId: message.id,
      conversationId: validatedData.conversationId,
      senderId: dbUser.id,
    });

    return {
      success: true,
      message: {
        ...message,
        isOwnMessage: true,
      },
    };
  } catch (error) {
    logError('Failed to send message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    };
  }
}

/**
 * Create a new conversation with initial message
 */
export async function createConversation(
  userId: string,
  data: { productId: string; initialMessage: string }
): Promise<CreateConversationResult> {
  try {
    const validatedData = createConversationRequestSchema.parse(data);

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return { success: false, error: 'User not found in database' };
    }

    // Get the product and verify it exists
    const product = await database.product.findUnique({
      where: {
        id: validatedData.productId,
        status: 'AVAILABLE',
      },
      include: {
        seller: true,
        images: { orderBy: { displayOrder: 'asc' } },
      },
    });

    if (!product) {
      return { success: false, error: 'Product not found or no longer available' };
    }

    if (product.sellerId === dbUser.id) {
      return { success: false, error: 'You cannot start a conversation about your own product' };
    }

    // Check if conversation already exists
    const existingConversation = await database.conversation.findFirst({
      where: {
        productId: validatedData.productId,
        buyerId: dbUser.id,
        sellerId: product.sellerId,
      },
      include: {
        buyer: true,
        seller: true,
        product: {
          include: { images: { orderBy: { displayOrder: 'asc' } } },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (existingConversation) {
      // Add the initial message to existing conversation
      const newMessage = await database.message.create({
        data: {
          conversationId: existingConversation.id,
          senderId: dbUser.id,
          content: sanitizeForDisplay(validatedData.initialMessage),
          read: false,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
      });

      // Update conversation timestamp
      await database.conversation.update({
        where: { id: existingConversation.id },
        data: { updatedAt: new Date() },
      });

      return {
        success: true,
        conversation: {
          ...existingConversation,
          messages: [...existingConversation.messages, newMessage],
        } as ConversationWithDetails,
      };
    }

    // Create new conversation with initial message
    const conversation = await database.conversation.create({
      data: {
        productId: validatedData.productId,
        buyerId: dbUser.id,
        sellerId: product.sellerId,
        status: 'ACTIVE',
        messages: {
          create: {
            senderId: dbUser.id,
            content: sanitizeForDisplay(validatedData.initialMessage),
            read: false,
          },
        },
      },
      include: {
        buyer: true,
        seller: true,
        product: {
          include: { images: { orderBy: { displayOrder: 'asc' } } },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    log.info('Conversation created successfully', {
      conversationId: conversation.id,
      productId: validatedData.productId,
      buyerId: dbUser.id,
      sellerId: product.sellerId,
    });

    return {
      success: true,
      conversation: conversation as ConversationWithDetails,
    };
  } catch (error) {
    logError('Failed to create conversation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create conversation',
    };
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return { success: false, error: 'User not found in database' };
    }

    // Verify the user is part of this conversation
    const conversation = await database.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    if (conversation.buyerId !== dbUser.id && conversation.sellerId !== dbUser.id) {
      return { success: false, error: 'You are not authorized to access this conversation' };
    }

    // Mark all messages from other users as read
    await database.message.updateMany({
      where: {
        conversationId: conversationId,
        senderId: { not: dbUser.id },
        read: false,
      },
      data: { read: true },
    });

    return { success: true };
  } catch (error) {
    logError('Failed to mark messages as read:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark messages as read',
    };
  }
}

/**
 * Get conversations for a user
 */
export async function getUserConversations(
  userId: string
): Promise<{ success: boolean; conversations?: ConversationListItem[]; error?: string }> {
  try {
    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return { success: false, error: 'User not found in database' };
    }

    // Get conversations where user is buyer or seller
    const conversations = await database.conversation.findMany({
      where: {
        OR: [
          { buyerId: dbUser.id },
          { sellerId: dbUser.id },
        ],
        status: 'ACTIVE',
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
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              orderBy: { displayOrder: 'asc' },
              take: 1,
              select: { imageUrl: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: dbUser.id },
                read: false,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const conversationList: ConversationListItem[] = conversations.map((conv) => {
      const otherParticipant = conv.buyerId === dbUser.id ? conv.seller : conv.buyer;
      const lastMessage = conv.messages[0];
      const productImage = conv.product.images[0]?.imageUrl || '';

      return {
        id: conv.id,
        productId: conv.productId,
        productTitle: conv.product.title,
        productImage,
        productPrice: conv.product.price.toString(),
        otherParticipant: {
          id: otherParticipant.id,
          name: `${otherParticipant.firstName} ${otherParticipant.lastName}`.trim(),
          avatar: otherParticipant.imageUrl || undefined,
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isOwnMessage: lastMessage.senderId === dbUser.id,
        } : undefined,
        unreadCount: conv._count.messages,
        status: conv.status,
        updatedAt: conv.updatedAt,
      };
    });

    return { success: true, conversations: conversationList };
  } catch (error) {
    logError('Failed to get user conversations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get conversations',
    };
  }
}

/**
 * Archive a conversation
 */
export async function archiveConversation(
  conversationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return { success: false, error: 'User not found in database' };
    }

    // Verify the user is part of this conversation
    const conversation = await database.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    if (conversation.buyerId !== dbUser.id && conversation.sellerId !== dbUser.id) {
      return { success: false, error: 'You are not authorized to archive this conversation' };
    }

    // Update conversation status to archived
    await database.conversation.update({
      where: { id: conversationId },
      data: { status: 'ARCHIVED' },
    });

    log.info('Conversation archived', {
      conversationId,
      userId: dbUser.id,
    });

    return { success: true };
  } catch (error) {
    logError('Failed to archive conversation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive conversation',
    };
  }
}