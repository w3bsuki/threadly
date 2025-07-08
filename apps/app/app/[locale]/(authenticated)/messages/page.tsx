import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { MessagesContent } from './components/messages-content';

const title = 'Messages';
const description = 'Chat with buyers and sellers';

export const metadata: Metadata = {
  title,
  description,
};

interface MessagesPageProps {
  searchParams: Promise<{
    type?: 'buying' | 'selling';
    user?: string; // User ID to start conversation with
    product?: string; // Product ID for conversation context
  }>;
}

const MessagesPage = async ({ searchParams }: MessagesPageProps) => {
  const { type, user: targetUserId, product: productId } = await searchParams;
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get database user with just ID for performance
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true }
  });

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Fetch user's conversations with optimized queries
  const conversations = await database.conversation.findMany({
    where: {
      OR: [
        { buyerId: dbUser.id },
        { sellerId: dbUser.id },
      ],
      ...(type === 'buying' ? { buyerId: dbUser.id } : {}),
      ...(type === 'selling' ? { sellerId: dbUser.id } : {}),
    },
    include: {
      buyer: true,
      seller: true,
      product: {
        include: {
          images: {
            take: 1,
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
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
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // Handle starting new conversation
  let targetUser = null;
  let targetProduct = null;
  let existingConversation = null;

  if (targetUserId) {
    // Get target user details
    targetUser = await database.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
      },
    });

    // Get product details if provided
    if (productId) {
      targetProduct = await database.product.findUnique({
        where: { id: productId },
        include: {
          images: {
            take: 1,
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      // Check if conversation already exists for this product
      existingConversation = await database.conversation.findFirst({
        where: {
          productId: productId,
          buyerId: dbUser.id,
          sellerId: targetUserId,
        },
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Chat with buyers and sellers about your transactions
        </p>
      </div>
      
      <MessagesContent 
        conversations={conversations.map(conv => ({
          ...conv,
          product: {
            ...conv.product,
            price: conv.product.price.toNumber()
          }
        }))}
        currentUserId={dbUser.id}
        filterType={type}
        targetUser={targetUser}
        targetProduct={targetProduct ? {
          ...targetProduct,
          price: targetProduct.price.toNumber()
        } : targetProduct}
        existingConversation={existingConversation}
      />
    </div>
  );
};

export default MessagesPage;