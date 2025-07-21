'use client';

import { Card, CardContent, CardHeader } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components';
import { ScrollArea } from '@repo/design-system/components';
import { MessageCircle, Check, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
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

export const ChatArea = memo(({
  conversation,
  currentUserId,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  isSending,
  typingUsers,
  messagesEndRef
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getOtherUser(conversation).imageUrl || undefined} />
            <AvatarFallback>
              {getOtherUser(conversation).firstName?.[0]}
              {getOtherUser(conversation).lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold">
              {getOtherUser(conversation).firstName} {getOtherUser(conversation).lastName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {getUserRole(conversation) === 'buying' ? 'Seller' : 'Buyer'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {conversation.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-[var(--radius-lg)]">
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={conversation.product.images[0]?.imageUrl || '/placeholder.png'}
              alt={conversation.product.title}
              fill
              className="object-cover rounded-[var(--radius-md)]"
            />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{conversation.product.title}</h4>
            <p className="text-sm text-muted-foreground">
              ${conversation.product.price.toFixed(2)}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
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
              <div className="text-center py-8">
                <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              conversation.messages.map((message) => {
                const isFromCurrentUser = message.senderId === currentUserId;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-[var(--radius-lg)] ${
                        isFromCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${
                        isFromCurrentUser ? 'justify-end' : 'justify-start'
                      }`}>
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
        value={messageInput}
        onChange={onMessageInputChange}
        onSend={onSendMessage}
        isSending={isSending}
      />
    </Card>
  );
});

ChatArea.displayName = 'ChatArea';