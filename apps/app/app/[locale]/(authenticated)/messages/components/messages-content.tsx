'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useChannel, useTypingIndicator } from '@repo/real-time/client';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components';
import { ScrollArea } from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Package, 
  Clock,
  CheckCheck,
  Check,
  PlusCircle,
  Filter
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { sendMessage, markMessagesAsRead } from '../actions/message-actions';

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

interface MessagesContentProps {
  conversations: Conversation[];
  currentUserId: string;
  filterType?: 'buying' | 'selling';
  targetUser?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  } | null;
  targetProduct?: {
    id: string;
    title: string;
    price: number;
    images: { imageUrl: string }[];
  } | null;
  existingConversation?: { id: string } | null;
}

export function MessagesContent({ 
  conversations, 
  currentUserId, 
  filterType,
  targetUser,
  targetProduct,
  existingConversation 
}: MessagesContentProps): React.JSX.Element {
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationsList, setConversationsList] = useState<Conversation[]>(conversations);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Real-time features for selected conversation
  const { bind: bindMessages } = useChannel(
    selectedConversation ? `private-conversation-${selectedConversation.id}` : ''
  );
  
  // User channel for notifications about new messages in any conversation
  const { bind: bindUserChannel } = useChannel(`private-user-${currentUserId}`);
  
  const { typingUsers, sendTyping } = useTypingIndicator(
    selectedConversation?.id || ''
  );

  // Update conversations list when props change
  useEffect(() => {
    setConversationsList(conversations);
  }, [conversations]);

  // Filter conversations based on search
  const filteredConversations = conversationsList.filter(conversation => {
    if (!searchQuery) return true;
    
    const otherUser = conversation.buyerId === currentUserId 
      ? conversation.seller 
      : conversation.buyer;
    
    const searchText = searchQuery.toLowerCase();
    return (
      conversation.product.title.toLowerCase().includes(searchText) ||
      `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase().includes(searchText)
    );
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  // Listen for real-time messages
  useEffect(() => {
    if (!selectedConversation || !bindMessages) return;

    const unsubscribe = bindMessages('new-message', (data: any) => {
      // Update the selected conversation with the new message
      if (data.conversationId === selectedConversation.id) {
        const newMessage: Message = {
          id: data.id,
          content: data.content,
          senderId: data.senderId,
          createdAt: new Date(data.createdAt),
          read: data.senderId === currentUserId ? true : false
        };

        // Update selected conversation
        setSelectedConversation(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, newMessage],
            updatedAt: new Date(data.createdAt)
          };
        });

        // Update conversations list
        setConversationsList(prevList => 
          prevList.map(conv => 
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  updatedAt: new Date(data.createdAt)
                }
              : conv
          )
        );

        // Mark as read if the message is from another user
        if (data.senderId !== currentUserId) {
          markMessagesAsRead(selectedConversation.id).catch(error => {
          });
        }
      }
    });

    return unsubscribe;
  }, [selectedConversation, bindMessages, currentUserId]);

  // Listen for new messages in all user conversations
  useEffect(() => {
    if (!bindUserChannel) return;

    const unsubscribe = bindUserChannel('new-message-notification', (data: any) => {
      // Update the conversation list with new message notification
      setConversationsList(prevList => {
        const updatedList = prevList.map(conv => {
          if (conv.id === data.conversationId) {
            // If this is the selected conversation, don't update here as it's handled above
            if (selectedConversation?.id === conv.id) return conv;
            
            // Update conversation's last message and timestamp
            return {
              ...conv,
              updatedAt: new Date(data.createdAt),
              _count: {
                ...conv._count,
                messages: conv._count.messages + 1
              }
            };
          }
          return conv;
        });
        
        // Sort conversations by most recent first
        return updatedList.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    });

    return unsubscribe;
  }, [bindUserChannel, selectedConversation?.id]);

  // Handle target user (from Message Seller button)
  useEffect(() => {
    if (targetUser && targetProduct) {
      if (existingConversation) {
        // Find and select existing conversation
        const existing = conversations.find(c => c.id === existingConversation.id);
        if (existing) {
          setSelectedConversation(existing);
        }
      } else {
        // Show new conversation interface
        setShowNewConversation(true);
      }
    }
  }, [targetUser, targetProduct, existingConversation, conversations]);

  // Handle typing indicator
  const handleTyping = (value: string) => {
    setMessageInput(value);
    
    if (!selectedConversation) return;

    // Send typing start
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      sendTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(false);
    }, 1000);
  };

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedConversation && selectedConversation._count.messages > 0) {
      markMessagesAsRead(selectedConversation.id).then(() => {
        router.refresh();
      });
    }
  }, [selectedConversation, router]);

  const handleCreateConversation = async (initialMessage: string) => {
    if (!targetUser || !targetProduct || !initialMessage.trim()) return;

    setIsCreatingConversation(true);
    try {
      const { createConversation } = await import('../actions/message-actions');
      const result = await createConversation({
        productId: targetProduct.id,
        initialMessage: initialMessage.trim(),
      });

      if (result.success) {
        // Refresh to get the new conversation
        router.refresh();
        setShowNewConversation(false);
      } else {
      }
    } catch (error) {
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageInput.trim()) return;

    setIsSending(true);
    try {
      const result = await sendMessage({
        conversationId: selectedConversation.id,
        content: messageInput.trim(),
      });

      if (result.success) {
        setMessageInput('');
        router.refresh();
      }
    } catch (error) {
    } finally {
      setIsSending(false);
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    return conversation.buyerId === currentUserId 
      ? conversation.seller 
      : conversation.buyer;
  };

  const getUserRole = (conversation: Conversation) => {
    return conversation.buyerId === currentUserId ? 'buying' : 'selling';
  };

  const getLastMessage = (conversation: Conversation) => {
    return conversation.messages[0] || null;
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE HH:mm');
    } else {
      return format(date, 'MMM d');
    }
  };

  if (conversations.length === 0 && !showNewConversation) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
          <p className="text-muted-foreground mb-6">
            Your conversations with buyers and sellers will appear here.
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild>
              <Link href="/browse">
                Browse Items
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/selling/new">
                Sell an Item
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Conversations List */}
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Badge variant="secondary">
                {filteredConversations.length}
              </Badge>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Tabs */}
            <Tabs value={filterType || 'all'} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" asChild>
                  <Link href="/messages">All</Link>
                </TabsTrigger>
                <TabsTrigger value="buying" asChild>
                  <Link href="/messages?type=buying">Buying</Link>
                </TabsTrigger>
                <TabsTrigger value="selling" asChild>
                  <Link href="/messages?type=selling">Selling</Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-4">
                {filteredConversations.map((conversation) => {
                  const otherUser = getOtherUser(conversation);
                  const role = getUserRole(conversation);
                  const lastMessage = getLastMessage(conversation);
                  const unreadCount = conversation._count.messages;
                  
                  return (
                    <div
                      key={conversation.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={otherUser.imageUrl || undefined} />
                        <AvatarFallback>
                          {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">
                            {otherUser.firstName} {otherUser.lastName}
                          </h4>
                          <div className="flex items-center gap-1">
                            {lastMessage && (
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(lastMessage.createdAt)}
                              </span>
                            )}
                            {unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.product.title}
                        </p>
                        
                        {lastMessage && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {lastMessage.content}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={role === 'buying' ? 'default' : 'secondary'} className="text-xs">
                            {role === 'buying' ? 'Buying' : 'Selling'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ${conversation.product.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2">
        {showNewConversation && targetUser && targetProduct ? (
          <NewConversationCard 
            targetUser={targetUser}
            targetProduct={targetProduct}
            onCreateConversation={handleCreateConversation}
            isCreating={isCreatingConversation}
            onCancel={() => setShowNewConversation(false)}
          />
        ) : selectedConversation ? (
          <Card className="h-full flex flex-col">
            {/* Chat Header */}
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getOtherUser(selectedConversation).imageUrl || undefined} />
                  <AvatarFallback>
                    {getOtherUser(selectedConversation).firstName?.[0]}
                    {getOtherUser(selectedConversation).lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {getOtherUser(selectedConversation).firstName} {getOtherUser(selectedConversation).lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getUserRole(selectedConversation) === 'buying' ? 'Seller' : 'Buyer'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {selectedConversation.status}
                  </Badge>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src={selectedConversation.product.images[0]?.imageUrl || '/placeholder.png'}
                    alt={selectedConversation.product.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{selectedConversation.product.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    ${selectedConversation.product.price.toFixed(2)}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/selling/listings/${selectedConversation.productId}`}>
                    View Item
                  </Link>
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    selectedConversation.messages.map((message) => {
                      const isFromCurrentUser = message.senderId === currentUserId;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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
                  
                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-muted px-4 py-2 rounded-lg">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-xs text-muted-foreground ml-2">
                            {getOtherUser(selectedConversation).firstName} is typing...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isSending}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSending}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start chatting
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface NewConversationCardProps {
  targetUser: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  targetProduct: {
    id: string;
    title: string;
    price: number;
    images: { imageUrl: string }[];
  };
  onCreateConversation: (message: string) => Promise<void>;
  isCreating: boolean;
  onCancel: () => void;
}

function NewConversationCard({ 
  targetUser, 
  targetProduct, 
  onCreateConversation, 
  isCreating,
  onCancel 
}: NewConversationCardProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      await onCreateConversation(message);
      setMessage('');
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={targetUser.imageUrl || undefined} />
              <AvatarFallback>
                {targetUser.firstName?.[0]}
                {targetUser.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {targetUser.firstName} {targetUser.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">Start a new conversation</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Product Info */}
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex gap-3">
            {targetProduct.images[0] && (
              <div className="relative w-16 h-16 rounded-md overflow-hidden">
                <Image
                  src={targetProduct.images[0].imageUrl}
                  alt={targetProduct.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-medium line-clamp-1">{targetProduct.title}</h4>
              <p className="text-lg font-bold">${targetProduct.price.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 mb-4">
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Your message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'm interested in your item..."
              className="w-full h-32 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
              required
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || !message.trim()}
              className="flex-1"
            >
              {isCreating ? 'Starting conversation...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}