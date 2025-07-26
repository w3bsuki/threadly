'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { getPusherServer } from '@repo/real-time/server';
import { getNotificationService } from '@repo/real-time/server';
import { sanitizeForDisplay } from '@repo/validation/sanitize';
// Email imports will be dynamically imported when needed
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

// Services will be initialized inside functions to avoid build-time issues

const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1).max(1000),
});

const createConversationSchema = z.object({
  productId: z.string().min(1),
  initialMessage: z.string().min(1).max(1000),
});

export async function sendMessage(input: z.infer<typeof sendMessageSchema>) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    // Validate input
    const validatedInput = sendMessageSchema.parse(input);

    // Verify the user is part of this conversation
    const conversation = await database.conversation.findUnique({
      where: {
        id: validatedInput.conversationId,
      },
      include: {
        Product: true,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.buyerId !== dbUser.id && conversation.sellerId !== dbUser.id) {
      throw new Error('You are not authorized to send messages in this conversation');
    }

    // Use transaction to ensure message creation and conversation update are atomic
    const message = await database.$transaction(async (tx) => {
      // Create the message with sanitized content
      const newMessage = await tx.message.create({
        data: {
          conversationId: validatedInput.conversationId,
          senderId: dbUser.id,
          content: sanitizeForDisplay(validatedInput.content),
          read: false,
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

      // Update conversation's lastMessageAt timestamp
      await tx.conversation.update({
        where: {
          id: validatedInput.conversationId,
        },
        data: {
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        },
      });
      
      return newMessage;
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

    // Send in-app notification to recipient
    const recipientId = conversation.buyerId === dbUser.id 
      ? conversation.sellerId 
      : conversation.buyerId;

    try {
      const notificationService = getNotificationService();
      await notificationService.notifyNewMessage(message, conversation);
    } catch (error) {
      logError('Failed to send in-app notification:', error);
    }

    // TODO: Implement email notifications for new messages

    return {
      success: true,
      message,
    };

  } catch (error) {
    logError('Failed to send message:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid message data',
        details: error.issues,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    };
  }
}

export async function createConversation(input: z.infer<typeof createConversationSchema>) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    // Validate input
    const validatedInput = createConversationSchema.parse(input);

    // Get the product and verify it exists
    const product = await database.product.findUnique({
      where: {
        id: validatedInput.productId,
        status: 'AVAILABLE',
      },
      include: {
        seller: true,
      },
    });

    if (!product) {
      throw new Error('Product not found or no longer available');
    }

    if (product.sellerId === dbUser.id) {
      throw new Error('You cannot start a conversation about your own product');
    }

    // Check if conversation already exists
    const existingConversation = await database.conversation.findFirst({
      where: {
        productId: validatedInput.productId,
        buyerId: dbUser.id,
        sellerId: product.sellerId,
      },
    });

    if (existingConversation) {
      // Use transaction to add the initial message to existing conversation
      await database.$transaction(async (tx) => {
        await tx.message.create({
          data: {
            conversationId: existingConversation.id,
            senderId: dbUser.id,
            content: sanitizeForDisplay(validatedInput.initialMessage),
            read: false,
          },
        });

        // Update conversation timestamps
        await tx.conversation.update({
          where: {
            id: existingConversation.id,
          },
          data: {
            lastMessageAt: new Date(),
            updatedAt: new Date(),
          },
        });
      });

      return {
        success: true,
        conversation: existingConversation,
      };
    }

    // Create new conversation with initial message
    const conversation = await database.conversation.create({
      data: {
        productId: validatedInput.productId,
        buyerId: dbUser.id,
        sellerId: product.sellerId,
        status: 'ACTIVE',
        lastMessageAt: new Date(),
        Message: {
          create: {
            senderId: dbUser.id,
            content: sanitizeForDisplay(validatedInput.initialMessage),
            read: false,
          },
        },
      },
      include: {
        buyer: true,
        seller: true,
        Product: true,
      },
    });

    // TODO: Send notification to seller about new conversation
    // TODO: Send email notification if seller has email notifications enabled

    return {
      success: true,
      conversation,
    };

  } catch (error) {
    logError('Failed to create conversation:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid conversation data',
        details: error.issues,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create conversation',
    };
  }
}

export async function markMessagesAsRead(conversationId: string) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    // Verify the user is part of this conversation
    const conversation = await database.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.buyerId !== dbUser.id && conversation.sellerId !== dbUser.id) {
      throw new Error('You are not authorized to access this conversation');
    }

    // Mark all messages from other users as read
    await database.message.updateMany({
      where: {
        conversationId: conversationId,
        senderId: { not: dbUser.id },
        read: false,
      },
      data: {
        read: true,
      },
    });

    return {
      success: true,
    };

  } catch (error) {
    logError('Failed to mark messages as read:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark messages as read',
    };
  }
}

export async function archiveConversation(conversationId: string) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    // Verify the user is part of this conversation
    const conversation = await database.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.buyerId !== dbUser.id && conversation.sellerId !== dbUser.id) {
      throw new Error('You are not authorized to archive this conversation');
    }

    // Update conversation status to archived
    await database.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        status: 'ARCHIVED',
      },
    });

    return {
      success: true,
    };

  } catch (error) {
    logError('Failed to archive conversation:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive conversation',
    };
  }
}