'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  ScrollArea,
} from '@repo/design-system/components';
import { format } from 'date-fns';
import { Check, CheckCheck, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import { MessageInput } from './message-input';
import { TypingIndicator } from './typing-indicator';

interface User {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  email: string;
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
  buyerId: string;
  sellerId: string;
  productId: string;
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

interface ChatAreaProps {
  conversation: Conversation;
  currentUserId: string;
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => Promise<void>;
  isSending: boolean;
  typingUsers: string[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatArea = memo(
  ({
    conversation,
    currentUserId,
    messageInput,
    onMessageInputChange,
    onSendMessage,
    isSending,
    typingUsers,
    messagesEndRef,
  }: ChatAreaProps) => {
    const getOtherUser = (conversation: Conversation) => {
      return conversation.buyerId === currentUserId
        ? conversation.seller
        : conversation.buyer;
    };

    const getUserRole = (conversation: Conversation) => {
      return conversation.buyerId === currentUserId ? 'buying' : 'selling';
    };

    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={getOtherUser(conversation).imageUrl || undefined}
              />
              <AvatarFallback>
                {getOtherUser(conversation).firstName?.[0]}
                {getOtherUser(conversation).lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h3 className="font-semibold">
                {getOtherUser(conversation).firstName}{' '}
                {getOtherUser(conversation).lastName}
              </h3>
              <p className="text-muted-foreground text-sm">
                {getUserRole(conversation) === 'buying' ? 'Seller' : 'Buyer'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">{conversation.status}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-muted/50 p-3">
            <div className="relative h-12 w-12 flex-shrink-0">
              <Image
                alt={conversation.product.title}
                className="rounded-[var(--radius-md)] object-cover"
                fill
                src={
                  conversation.product.images[0]?.imageUrl || '/placeholder.png'
                }
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">
                {conversation.product.title}
              </h4>
              <p className="text-muted-foreground text-sm">
                ${conversation.product.price.toFixed(2)}
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={`/selling/listings/${conversation.productId}`}>
                View Item
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {conversation.messages.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-sm">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                conversation.messages.map((message) => {
                  const isFromCurrentUser = message.senderId === currentUserId;

                  return (
                    <div
                      className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                      key={message.id}
                    >
                      <div
                        className={`max-w-xs rounded-[var(--radius-lg)] px-4 py-2 lg:max-w-md ${
                          isFromCurrentUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div
                          className={`mt-1 flex items-center gap-1 ${
                            isFromCurrentUser ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span className="text-xs opacity-70">
                            {format(message.createdAt, 'HH:mm')}
                          </span>
                          {isFromCurrentUser && (
                            <div className="text-xs opacity-70">
                              {message.read ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {typingUsers.length > 0 && (
                <TypingIndicator
                  userName={getOtherUser(conversation).firstName || 'User'}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <MessageInput
          isSending={isSending}
          onChange={onMessageInputChange}
          onSend={onSendMessage}
          value={messageInput}
        />
      </Card>
    );
  }
);

ChatArea.displayName = 'ChatArea';
