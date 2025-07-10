'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { 
  MessageCircle, 
  Search, 
  Send, 
  Package, 
  User,
  Clock,
  CheckCheck
} from 'lucide-react';

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

export function MessagesContent({ conversations, currentUserId }: MessagesContentProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Transform conversations to match the component's expected format
  const transformedConversations = conversations.map(conv => {
    const otherUser = conv.buyerId === currentUserId ? conv.seller : conv.buyer;
    const lastMessage = conv.messages[conv.messages.length - 1];
    const unreadCount = conv._count.messages;
    
    return {
      id: conv.id,
      otherUser: {
        id: otherUser.id,
        name: `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email,
        imageUrl: otherUser.imageUrl || undefined,
      },
      product: {
        id: conv.product.id,
        title: conv.product.title,
        imageUrl: conv.product.images[0]?.imageUrl,
        price: typeof conv.product.price === 'object' ? conv.product.price.toNumber() : conv.product.price,
      },
      lastMessage: lastMessage ? {
        content: lastMessage.content,
        timestamp: lastMessage.createdAt,
        isRead: lastMessage.read,
        senderId: lastMessage.senderId,
      } : null,
      unreadCount,
      rawConversation: conv,
    };
  });

  const filteredConversations = transformedConversations.filter(conversation =>
    conversation.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${Math.floor(hours)}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  const selectedConv = transformedConversations.find(c => c.id === selectedConversation);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Conversations List */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
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
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                      selectedConversation === conversation.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        {conversation.otherUser.imageUrl ? (
                          <img
                            src={conversation.otherUser.imageUrl}
                            alt={conversation.otherUser.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{conversation.otherUser.name}</h4>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatTime(new Date(conversation.lastMessage.timestamp))}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600 truncate">
                            {conversation.product.title}
                          </span>
                          <span className="text-xs text-gray-500">
                            ${conversation.product.price}
                          </span>
                        </div>
                        
                        {conversation.lastMessage && (
                          <p className={`text-sm truncate ${
                            !conversation.lastMessage.isRead && conversation.lastMessage.senderId !== currentUserId
                              ? 'font-medium text-gray-900'
                              : 'text-gray-500'
                          }`}>
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                      
                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2">
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
        <Card className="h-full flex flex-col">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedConv.otherUser.imageUrl ? (
                      <img
                        src={selectedConv.otherUser.imageUrl}
                        alt={selectedConv.otherUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {selectedConv.otherUser.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{selectedConv.otherUser.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="h-3 w-3" />
                      <span>{selectedConv.product.title}</span>
                      <span>•</span>
                      <span>${selectedConv.product.price}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/product/${selectedConv.product.id}`}>
                      View Item
                    </a>
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {selectedConv.rawConversation.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    selectedConv.rawConversation.messages.map((message) => {
                      const isSender = message.senderId === currentUserId;
                      return (
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 ${isSender ? 'justify-end' : ''}`}
                        >
                          {!isSender && (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {selectedConv.otherUser.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className={`flex-1 ${isSender ? 'text-right' : ''}`}>
                            <div className={`rounded-lg p-3 max-w-xs ${
                              isSender 
                                ? 'bg-blue-600 text-white ml-auto' 
                                : 'bg-gray-100'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 ${
                              isSender ? 'justify-end' : ''
                            }`}>
                              {isSender && message.read && (
                                <CheckCheck className="h-3 w-3 text-gray-400" />
                              )}
                              <span className="text-xs text-gray-500">
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
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newMessage.trim()) {
                        // TODO: Implement send message functionality
                        console.log('Send message:', newMessage);
                        setNewMessage('');
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    size="sm"
                    disabled={!newMessage.trim()}
                    onClick={() => {
                      if (newMessage.trim()) {
                        // TODO: Implement send message functionality
                        console.log('Send message:', newMessage);
                        setNewMessage('');
                      }
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the left to start chatting</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}