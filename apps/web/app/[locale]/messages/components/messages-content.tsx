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

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  product: {
    id: string;
    title: string;
    imageUrl?: string;
    price: number;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
}

// Mock data - replace with real API calls
const mockConversations: Conversation[] = [
  {
    id: '1',
    otherUser: {
      id: 'user1',
      name: 'Sarah Johnson',
      imageUrl: undefined,
    },
    product: {
      id: 'prod1',
      title: 'Vintage Leather Jacket',
      imageUrl: undefined,
      price: 89.99,
    },
    lastMessage: {
      content: 'Is this still available? I\'m very interested!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      senderId: 'user1',
    },
    unreadCount: 2,
  },
  {
    id: '2',
    otherUser: {
      id: 'user2',
      name: 'Mike Chen',
      imageUrl: undefined,
    },
    product: {
      id: 'prod2',
      title: 'Designer Sneakers',
      imageUrl: undefined,
      price: 125.00,
    },
    lastMessage: {
      content: 'Great! I can ship it out tomorrow.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
      senderId: 'currentUser',
    },
    unreadCount: 0,
  },
];

export function MessagesContent() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const filteredConversations = mockConversations.filter(conversation =>
    conversation.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    const days = diff / (1000 * 60 * 60 * 24);

    if (days >= 1) {
      return date.toLocaleDateString();
    } else if (hours >= 1) {
      return `${Math.floor(hours)}h ago`;
    } else {
      return `${Math.floor(diff / (1000 * 60))}m ago`;
    }
  };

  const selectedConv = filteredConversations.find(c => c.id === selectedConversation);

  if (mockConversations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-600 mb-6">
            Start buying or selling to connect with other users
          </p>
          <Button asChild>
            <a href="/browse">Browse Items</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </CardTitle>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 border-b transition-colors ${
                    selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {conversation.otherUser.imageUrl ? (
                        <img
                          src={conversation.otherUser.imageUrl}
                          alt={conversation.otherUser.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {conversation.otherUser.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {conversation.otherUser.name}
                        </h4>
                        <div className="flex items-center gap-1">
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2 truncate">
                        {conversation.product.title} • ${conversation.product.price}
                      </p>
                      
                      <p className={`text-xs truncate ${
                        !conversation.lastMessage.isRead && conversation.lastMessage.senderId !== 'currentUser'
                          ? 'font-medium text-gray-900'
                          : 'text-gray-500'
                      }`}>
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
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
                  {/* Sample messages */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {selectedConv.otherUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm">Hi! I'm interested in this item. Is it still available?</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 justify-end">
                    <div className="flex-1 text-right">
                      <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs ml-auto">
                        <p className="text-sm">Yes, it's still available! Would you like more photos?</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <CheckCheck className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">1 hour ago</span>
                      </div>
                    </div>
                  </div>
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
                        // Handle send message
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
                        // Handle send message
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