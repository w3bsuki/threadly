'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@repo/design-system/components';
import {
  CheckCheck,
  MessageCircle,
  Package,
  Search,
  Send,
  User,
} from 'lucide-react';
import { useState } from 'react';

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
  price: any; // Decimal type from Prisma
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

interface MessagesContentProps {
  conversations: Conversation[];
  currentUserId: string;
}

export function MessagesContent({
  conversations,
  currentUserId,
}: MessagesContentProps) {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Transform conversations to match the component's expected format
  const transformedConversations = conversations.map((conv) => {
    const otherUser = conv.buyerId === currentUserId ? conv.seller : conv.buyer;
    const lastMessage = conv.messages.at(-1);
    const unreadCount = conv._count.messages;

    return {
      id: conv.id,
      otherUser: {
        id: otherUser.id,
        name:
          `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() ||
          otherUser.email,
        imageUrl: otherUser.imageUrl || undefined,
      },
      product: {
        id: conv.product.id,
        title: conv.product.title,
        imageUrl: conv.product.images[0]?.imageUrl,
        price:
          typeof conv.product.price === 'object'
            ? conv.product.price.toNumber()
            : conv.product.price,
      },
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            timestamp: lastMessage.createdAt,
            isRead: lastMessage.read,
            senderId: lastMessage.senderId,
          }
        : null,
      unreadCount,
      rawConversation: conv,
    };
  });

  const filteredConversations = transformedConversations.filter(
    (conversation) =>
      conversation.otherUser.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conversation.product.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${Math.floor(hours)}h ago`;
    }
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const selectedConv = transformedConversations.find(
    (c) => c.id === selectedConversation
  );

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Conversations List */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <div className="relative mt-2">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                value={searchQuery}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No conversations yet
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    className={`w-full p-4 text-left transition-colors hover:bg-gray-50 ${
                      selectedConversation === conversation.id
                        ? 'bg-gray-50'
                        : ''
                    }`}
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                        {conversation.otherUser.imageUrl ? (
                          <img
                            alt={conversation.otherUser.name}
                            className="h-10 w-10 rounded-full object-cover"
                            src={conversation.otherUser.imageUrl}
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-600" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <h4 className="font-medium text-sm">
                            {conversation.otherUser.name}
                          </h4>
                          {conversation.lastMessage && (
                            <span className="text-gray-500 text-xs">
                              {formatTime(
                                new Date(conversation.lastMessage.timestamp)
                              )}
                            </span>
                          )}
                        </div>

                        <div className="mb-1 flex items-center gap-2">
                          <Package className="h-3 w-3 text-gray-400" />
                          <span className="truncate text-gray-600 text-xs">
                            {conversation.product.title}
                          </span>
                          <span className="text-gray-500 text-xs">
                            ${conversation.product.price}
                          </span>
                        </div>

                        {conversation.lastMessage && (
                          <p
                            className={`truncate text-sm ${
                              !conversation.lastMessage.isRead &&
                              conversation.lastMessage.senderId !==
                                currentUserId
                                ? 'font-medium text-gray-900'
                                : 'text-gray-500'
                            }`}
                          >
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>

                      {conversation.unreadCount > 0 && (
                        <Badge className="ml-2" variant="default">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="md:col-span-2">
        <Card className="flex h-full flex-col">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                    {selectedConv.otherUser.imageUrl ? (
                      <img
                        alt={selectedConv.otherUser.name}
                        className="h-10 w-10 rounded-full object-cover"
                        src={selectedConv.otherUser.imageUrl}
                      />
                    ) : (
                      <span className="font-medium text-gray-600 text-sm">
                        {selectedConv.otherUser.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium">
                      {selectedConv.otherUser.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Package className="h-3 w-3" />
                      <span>{selectedConv.product.title}</span>
                      <span>•</span>
                      <span>${selectedConv.product.price}</span>
                    </div>
                  </div>

                  <Button asChild size="sm" variant="outline">
                    <a href={`/product/${selectedConv.product.id}`}>
                      View Item
                    </a>
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {selectedConv.rawConversation.messages.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    selectedConv.rawConversation.messages.map((message) => {
                      const isSender = message.senderId === currentUserId;
                      return (
                        <div
                          className={`flex items-start gap-3 ${isSender ? 'justify-end' : ''}`}
                          key={message.id}
                        >
                          {!isSender && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                              <span className="font-medium text-gray-600 text-xs">
                                {selectedConv.otherUser.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div
                            className={`flex-1 ${isSender ? 'text-right' : ''}`}
                          >
                            <div
                              className={`max-w-xs rounded-lg p-3 ${
                                isSender
                                  ? 'ml-auto bg-blue-600 text-white'
                                  : 'bg-gray-100'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <div
                              className={`mt-1 flex items-center gap-1 ${
                                isSender ? 'justify-end' : ''
                              }`}
                            >
                              {isSender && message.read && (
                                <CheckCheck className="h-3 w-3 text-gray-400" />
                              )}
                              <span className="text-gray-500 text-xs">
                                {formatTime(new Date(message.createdAt))}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newMessage.trim()) {
                        // TODO: Implement send message functionality
                        setNewMessage('');
                      }
                    }}
                    placeholder="Type a message..."
                    value={newMessage}
                  />
                  <Button
                    disabled={!newMessage.trim()}
                    onClick={() => {
                      if (newMessage.trim()) {
                        // TODO: Implement send message functionality
                        setNewMessage('');
                      }
                    }}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <MessageCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 font-medium text-gray-900 text-lg">
                  Select a conversation
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the left to start chatting
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
