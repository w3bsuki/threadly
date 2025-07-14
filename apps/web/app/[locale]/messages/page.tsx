import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { MessagesContent } from './components/messages-content';
import { database } from '@repo/database';

export const metadata: Metadata = {
  title: 'Messages - Threadly',
  description: 'Chat with sellers and buyers on Threadly marketplace',
};

export default async function MessagesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Ensure user exists in database
  const dbUser = await database.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    redirect('/onboarding');
  }

  // Fetch user's conversations
  const conversations = await database.conversation.findMany({
    where: {
      OR: [
        { buyerId: dbUser.id },
        { sellerId: dbUser.id },
      ],
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
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-2">
              Chat with sellers and buyers about your items
            </p>
          </div>
          
          <MessagesContent 
            conversations={conversations.map(conv => ({
              ...conv,
              buyer: conv.User_Conversation_buyerIdToUser,
              seller: conv.User_Conversation_sellerIdToUser,
              product: conv.Product,
              messages: conv.Message,
              _count: {
                messages: conv._count.Message
              }
            }))}
            currentUserId={dbUser.id}
          />
        </div>
      </div>
    </div>
  );
}