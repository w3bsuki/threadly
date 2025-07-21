import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MessagesContentLazy } from './components/messages-content-lazy';
import { RealTimeWrapper } from '../../../components/real-time-wrapper';
import { AuthPrompt } from '../../../components/auth-prompt';

export const metadata: Metadata = {
  title: 'Messages - Threadly',
  description: 'Chat with sellers and buyers on Threadly marketplace',
};

interface MessagesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function MessagesPage({ params }: MessagesPageProps) {
  const { locale } = await params;
  const { userId } = await auth();

  if (!userId) {
    return (
      <AuthPrompt
        title="Sign in to access messages"
        description="You need to be signed in to send and receive messages from other users on Threadly."
        locale={locale}
      />
    );
  }

  // Ensure user exists in database
  const dbUser = await database.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    redirect(`/${locale}/onboarding`);
  }

  // Fetch user's conversations
  const conversations = await database.conversation.findMany({
    where: {
      OR: [{ buyerId: dbUser.id }, { sellerId: dbUser.id }],
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
    <RealTimeWrapper>
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h1 className="font-bold text-3xl text-foreground">Messages</h1>
              <p className="mt-2 text-muted-foreground">
                Chat with sellers and buyers about your items
              </p>
            </div>

            <MessagesContentLazy
              conversations={conversations.map((conv) => ({
                ...conv,
                buyer: conv.User_Conversation_buyerIdToUser,
                seller: conv.User_Conversation_sellerIdToUser,
                product: conv.Product,
                messages: conv.Message,
                _count: {
                  messages: conv._count.Message,
                },
              }))}
              currentUserId={dbUser.id}
            />
          </div>
        </div>
      </div>
    </RealTimeWrapper>
  );
}
