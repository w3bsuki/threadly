'use server';

import { prisma } from '@repo/database';
import { getPusherServer } from '@repo/real-time/server';
import {
  ActionError,
  cacheInvalidation,
  cacheTags,
  createServerAction,
  idSchema,
  sanitizeString,
  withOptions,
} from '@repo/server-actions/server';
import { z } from 'zod';

// Define schemas with our utilities
const sendMessageSchema = z.object({
  conversationId: idSchema,
  content: z.string().min(1).max(1000).transform(sanitizeString),
});

const createConversationSchema = z.object({
  productId: idSchema,
  initialMessage: z.string().min(1).max(1000).transform(sanitizeString),
});

// Refactored sendMessage action
export const sendMessage = createServerAction(
  sendMessageSchema,
  async (input, context) => {
    // Check if user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: input.conversationId },
      include: {
        buyer: true,
        seller: true,
        Product: {
          select: { id: true, title: true },
        },
      },
    });

    if (!conversation) {
      throw ActionError.notFound('Conversation');
    }

    if (
      conversation.buyerId !== context.userId &&
      conversation.sellerId !== context.userId
    ) {
      throw ActionError.forbidden('You are not part of this conversation');
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId: input.conversationId,
        senderId: context.userId!,
        content: input.content,
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

    // Update conversation's last message timestamp
    await prisma.conversation.update({
      where: { id: input.conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Send real-time update
    const pusher = getPusherServer();
    await pusher.trigger(
      `conversation-${input.conversationId}`,
      'new-message',
      {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt,
        user: message.User,
      }
    );

    // Send notification to recipient
    const recipientId =
      conversation.buyerId === context.userId
        ? conversation.sellerId
        : conversation.buyerId;

    await pusher.trigger(`user-${recipientId}`, 'notification', {
      type: 'NEW_MESSAGE',
      title: 'New message',
      message: `${message.User.firstName} sent you a message`,
      conversationId: input.conversationId,
    });

    return message;
  },
  {
    auth: { required: true },
    rateLimit: { limit: 30, window: 60_000 }, // 30 messages per minute
    auditLog: true,
  }
);

// Add cache invalidation and revalidation
export const sendMessageWithRevalidation = withOptions(sendMessage, {
  revalidateTags: (input) => [
    cacheTags.byId('conversation', input.conversationId),
    cacheTags.byUser('messages', input.conversationId),
  ],
});

// Refactored createConversation action
export const createConversation = createServerAction(
  createConversationSchema,
  async (input, context) => {
    // Check if product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      include: {
        seller: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!product) {
      throw ActionError.notFound('Product');
    }

    if (product.status !== 'AVAILABLE') {
      throw ActionError.conflict('Product is not available');
    }

    if (product.sellerId === context.userId) {
      throw ActionError.conflict('You cannot message yourself');
    }

    // Check for existing conversation
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        buyerId_sellerId_productId: {
          buyerId: context.userId!,
          sellerId: product.sellerId,
          productId: input.productId,
        },
      },
    });

    if (existingConversation) {
      // Send message to existing conversation
      await sendMessage({
        conversationId: existingConversation.id,
        content: input.initialMessage,
      });

      return existingConversation;
    }

    // Create new conversation with initial message
    const conversation = await prisma.conversation.create({
      data: {
        buyerId: context.userId!,
        sellerId: product.sellerId,
        productId: input.productId,
        lastMessageAt: new Date(),
        Message: {
          create: {
            senderId: context.userId!,
            content: input.initialMessage,
          },
        },
      },
      include: {
        Message: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Send notifications
    const pusher = getPusherServer();
    await pusher.trigger(`user-${product.sellerId}`, 'notification', {
      type: 'NEW_CONVERSATION',
      title: 'New conversation',
      message: `Someone is interested in your ${product.title}`,
      conversationId: conversation.id,
    });

    // Invalidate relevant caches
    await cacheInvalidation.invalidateRelated([
      cacheTags.byUser('conversations', context.userId!),
      cacheTags.byUser('conversations', product.sellerId),
    ]);

    return conversation;
  },
  {
    auth: { required: true },
    rateLimit: { limit: 10, window: 3_600_000 }, // 10 new conversations per hour
  }
);

// Mark messages as read
export const markMessagesAsRead = createServerAction(
  z.object({ conversationId: idSchema }),
  async (input, context) => {
    // Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: input.conversationId },
      select: { buyerId: true, sellerId: true },
    });

    if (!conversation) {
      throw ActionError.notFound('Conversation');
    }

    if (
      conversation.buyerId !== context.userId &&
      conversation.sellerId !== context.userId
    ) {
      throw ActionError.forbidden();
    }

    // Mark all unread messages as read
    const result = await prisma.message.updateMany({
      where: {
        conversationId: input.conversationId,
        senderId: { not: context.userId },
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    // Send read receipt via Pusher
    if (result.count > 0) {
      const pusher = getPusherServer();
      await pusher.trigger(
        `conversation-${input.conversationId}`,
        'messages-read',
        {
          userId: context.userId,
          timestamp: new Date(),
        }
      );
    }

    return { count: result.count };
  },
  {
    auth: { required: true },
  }
);
