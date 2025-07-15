import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { logError } from '@repo/observability/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for updating conversation
const updateConversationSchema = z.object({
  status: z.enum(['ACTIVE', 'ARCHIVED']),
});

// Helper function to check if user is participant in conversation
async function checkConversationAccess(conversationId: string, userId: string) {
  const conversation = await database.conversation.findUnique({
    where: { id: conversationId },
    include: {
      User_Conversation_buyerIdToUser: true,
      User_Conversation_sellerIdToUser: true,
    },
  });

  if (!conversation) {
    return {
      hasAccess: false,
      conversation: null,
      error: 'Conversation not found',
    };
  }

  const user = await database.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return { hasAccess: false, conversation: null, error: 'User not found' };
  }

  const isParticipant =
    conversation.buyerId === user.id || conversation.sellerId === user.id;

  if (!isParticipant) {
    return { hasAccess: false, conversation: null, error: 'Access denied' };
  }

  return { hasAccess: true, conversation, user };
}

// GET /api/messages/conversations/[conversationId] - Get conversation details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
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

    // Check access to conversation
    const accessCheck = await checkConversationAccess(
      resolvedParams.conversationId,
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

    // Get full conversation details
    const conversation = await database.conversation.findUnique({
      where: { id: resolvedParams.conversationId },
      include: {
        User_Conversation_buyerIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            bio: true,
            location: true,
            verified: true,
            averageRating: true,
            totalSales: true,
            joinedAt: true,
          },
        },
        User_Conversation_sellerIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            bio: true,
            location: true,
            verified: true,
            averageRating: true,
            totalSales: true,
            joinedAt: true,
          },
        },
        Product: {
          include: {
            category: true,
            images: {
              orderBy: {
                displayOrder: 'asc',
              },
            },
          },
        },
        _count: {
          select: {
            Message: true,
          },
        },
      },
    });

    // Mark messages as read if user is the recipient
    const otherUserId =
      conversation?.buyerId === accessCheck.user?.id
        ? conversation?.sellerId
        : conversation?.buyerId;

    await database.message.updateMany({
      where: {
        conversationId: resolvedParams.conversationId,
        senderId: otherUserId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        conversation: {
          ...conversation,
          isUserBuyer: conversation?.buyerId === accessCheck.user?.id,
        },
      },
    });
  } catch (error) {
    logError('Error fetching conversation:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conversation',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/messages/conversations/[conversationId] - Update conversation status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
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
    const validatedData = updateConversationSchema.parse(body);
    const resolvedParams = await params;

    // Check access to conversation
    const accessCheck = await checkConversationAccess(
      resolvedParams.conversationId,
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

    // Update conversation status
    const updatedConversation = await database.conversation.update({
      where: { id: resolvedParams.conversationId },
      data: {
        status: validatedData.status,
      },
      include: {
        User_Conversation_buyerIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        User_Conversation_sellerIdToUser: {
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
      },
    });

    return NextResponse.json({
      success: true,
      data: { conversation: updatedConversation },
      message: `Conversation ${validatedData.status === 'ARCHIVED' ? 'archived' : 'reactivated'} successfully`,
    });
  } catch (error) {
    logError('Error updating conversation:', error);

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
        error: 'Failed to update conversation',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/conversations/[conversationId] - Soft delete conversation
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
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

    // Check access to conversation
    const accessCheck = await checkConversationAccess(
      resolvedParams.conversationId,
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

    // Soft delete by archiving the conversation
    await database.conversation.update({
      where: { id: resolvedParams.conversationId },
      data: {
        status: 'ARCHIVED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    logError('Error deleting conversation:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete conversation',
      },
      { status: 500 }
    );
  }
}
