import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logError } from '@repo/observability/server';

// Schema for updating a message
const updateMessageSchema = z.object({
  read: z.boolean(),
});

// Helper function to check if user has access to a message
async function checkMessageAccess(messageId: string, userId: string) {
  const user = await database.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return { hasAccess: false, error: 'User not found', message: null, user: null };
  }

  const message = await database.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: {
        select: {
          buyerId: true,
          sellerId: true,
          status: true,
        },
      },
    },
  });

  if (!message) {
    return { hasAccess: false, error: 'Message not found', message: null, user: null };
  }

  // Check if user is participant in the conversation
  const isParticipant = 
    message.conversation.buyerId === user.id || 
    message.conversation.sellerId === user.id;

  if (!isParticipant) {
    return { hasAccess: false, error: 'Access denied', message: null, user: null };
  }

  return { hasAccess: true, message, user };
}

// PATCH /api/messages/[messageId] - Mark message as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
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
    const validatedData = updateMessageSchema.parse(body);
    const resolvedParams = await params;

    // Check access to message
    const accessCheck = await checkMessageAccess(resolvedParams.messageId, userId);
    if (!accessCheck.hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: accessCheck.error,
        },
        { status: accessCheck.error === 'Message not found' ? 404 : 403 }
      );
    }

    // Only the recipient can mark a message as read
    if (accessCheck.message!.senderId === accessCheck.user!.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot mark your own message as read',
        },
        { status: 400 }
      );
    }

    // Update message read status
    const updatedMessage = await database.message.update({
      where: { id: resolvedParams.messageId },
      data: {
        read: validatedData.read,
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

    return NextResponse.json({
      success: true,
      data: {
        message: {
          ...updatedMessage,
          isOwnMessage: updatedMessage.senderId === accessCheck.user!.id,
        },
      },
      message: `Message marked as ${validatedData.read ? 'read' : 'unread'}`,
    });
  } catch (error) {
    logError('Error updating message:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid update data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update message',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/[messageId] - Delete a message (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
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

    const resolvedParams = await params;
    
    // Check access to message
    const accessCheck = await checkMessageAccess(resolvedParams.messageId, userId);
    if (!accessCheck.hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: accessCheck.error,
        },
        { status: accessCheck.error === 'Message not found' ? 404 : 403 }
      );
    }

    // Only the sender can delete their own message
    if (accessCheck.message!.senderId !== accessCheck.user!.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'You can only delete your own messages',
        },
        { status: 403 }
      );
    }

    // Check if message was sent recently (within 5 minutes)
    const messageAge = Date.now() - accessCheck.message!.createdAt.getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (messageAge > fiveMinutes) {
      return NextResponse.json(
        {
          success: false,
          error: 'Messages can only be deleted within 5 minutes of sending',
        },
        { status: 400 }
      );
    }

    // Soft delete by updating content
    const deletedMessage = await database.message.update({
      where: { id: resolvedParams.messageId },
      data: {
        content: '[Message deleted]',
        imageUrl: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    logError('Error deleting message:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete message',
      },
      { status: 500 }
    );
  }
}