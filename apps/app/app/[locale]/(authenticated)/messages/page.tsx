import { currentUser } from '@repo/auth/server';
import { getCacheService } from '@repo/database';
import { database } from '@repo/database';
import { decimalToNumber } from '@repo/utils';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { MessagesContent } from './components/messages-content';

const paramsSchema = z.object({
  locale: z.string(),
});

const title = 'Messages';
const description = 'Chat with buyers and sellers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const rawParams = await params;
  paramsSchema.parse(rawParams);

  return {
    title,
    description,
  };
}

interface MessagesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    type?: 'buying' | 'selling';
    user?: string; // User ID to start conversation with
    product?: string; // Product ID for conversation context
  }>;
}

const MessagesPage = async ({ params, searchParams }: MessagesPageProps) => {
  const rawParams = await params;
  paramsSchema.parse(rawParams);
  const { type, user: targetUserId, product: productId } = await searchParams;
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const cache = getCacheService();

  // Get database user with just ID for performance
  const dbUser = await cache.remember(
    `user:${user.id}`,
    async () =>
      database.user.findUnique({
        where: { clerkId: user.id },
        select: { id: true },
      }),
    cache.TTL.MEDIUM,
    ['users']
  );

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Fetch user's conversations with optimized queries
  const conversations = await cache.remember(
    `conversations:${dbUser.id}:${type || 'all'}`,
    async () =>
      database.conversation.findMany({
        where: {
          OR: [{ buyerId: dbUser.id }, { sellerId: dbUser.id }],
          ...(type === 'buying' ? { buyerId: dbUser.id } : {}),
          ...(type === 'selling' ? { sellerId: dbUser.id } : {}),
        },
        include: {
          User_Conversation_buyerIdToUser: true,
          User_Conversation_sellerIdToUser: true,
          Product: {
            include: {
              images: {
                take: 1,
                orderBy: {
                  displayOrder: 'asc',
                },
              },
            },
          },
          Message: {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: {
              Message: {
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
      }),
    cache.TTL.SHORT,
    ['conversations']
  );

  // Handle starting new conversation
  let targetUser = null;
  let targetProduct = null;
  let existingConversation = null;

  if (targetUserId) {
    // Get target user details
    targetUser = await cache.remember(
      `user:profile:${targetUserId}`,
      async () =>
        database.user.findUnique({
          where: { id: targetUserId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        }),
      cache.TTL.MEDIUM,
      ['users']
    );

    // Get product details if provided
    if (productId) {
      targetProduct = await cache.remember(
        `product:${productId}`,
        async () =>
          database.product.findUnique({
            where: { id: productId },
            include: {
              images: {
                take: 1,
                orderBy: { displayOrder: 'asc' },
              },
            },
          }),
        cache.TTL.LONG,
        ['products']
      );

      // Check if conversation already exists for this product
      existingConversation = await cache.remember(
        `conversation:${productId}:${dbUser.id}:${targetUserId}`,
        async () =>
          database.conversation.findFirst({
            where: {
              productId,
              buyerId: dbUser.id,
              sellerId: targetUserId,
            },
          }),
        cache.TTL.SHORT,
        ['conversations']
      );
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-bold text-2xl">Messages</h1>
        <p className="text-muted-foreground text-sm">
          Chat with buyers and sellers about your transactions
        </p>
      </div>

      <MessagesContent
        conversations={conversations.map((conv) => ({
          ...conv,
          buyer: conv.User_Conversation_buyerIdToUser,
          seller: conv.User_Conversation_sellerIdToUser,
          messages: conv.Message,
          _count: {
            ...conv._count,
            messages: conv._count.Message,
          },
          product: {
            ...conv.Product,
            price: decimalToNumber(conv.Product.price),
          },
        }))}
        currentUserId={dbUser.id}
        existingConversation={existingConversation}
        filterType={type}
        targetProduct={
          targetProduct
            ? {
                ...targetProduct,
                price: decimalToNumber(targetProduct.price),
              }
            : targetProduct
        }
        targetUser={targetUser}
      />
    </div>
  );
};

export default MessagesPage;
