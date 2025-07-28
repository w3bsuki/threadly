'use client';

import { MessagesContainer } from '@repo/messaging/components';
import type {
  ConversationWithDetails,
  MessageWithSender,
} from '@repo/messaging/types';

interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

interface Product {
  id: string;
  title: string;
  price: number;
  status: string;
  images: Array<{
    id: string;
    imageUrl: string;
    alt?: string | null;
  }>;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  buyer: User;
  seller: User;
  product: Product;
  messages: Message[];
  _count: {
    messages: number;
  };
}

interface MessagesContentProps {
  conversations: Conversation[];
  currentUserId: string;
}

export function MessagesContent({
  conversations,
  currentUserId,
}: MessagesContentProps) {
  // Transform the conversations to match the expected type
  const transformedConversations: ConversationWithDetails[] = conversations.map(
    (conv) => ({
      ...conv,
      messages: conv.messages.map(
        (msg): MessageWithSender => ({
          ...msg,
          sender: {
            id: msg.senderId,
            firstName: null,
            lastName: null,
            imageUrl: null,
          },
        })
      ),
    })
  );

  return (
    <MessagesContainer
      conversations={transformedConversations}
      currentUserId={currentUserId}
    />
  );
}
