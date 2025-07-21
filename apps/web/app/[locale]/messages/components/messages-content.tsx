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
import { useState, useEffect, useRef } from 'react';
import { useChannel, useTypingIndicator } from '@repo/real-time/client';
import { AvatarImage } from '../../components/optimized-image';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [realTimeMessages, setRealTimeMessages] = useState<Message[]>([]);
  const [failedMessages, setFailedMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { bind: bindConversationChannel } = useChannel(
    selectedConversation ? `private-conversation-${selectedConversation}` : ''
  );
  
  const { typingUsers, sendTyping } = useTypingIndicator(selectedConversation || '');

  // Transform conversations to match the component's expected format
  const transformedConversations = conversations.map((conv) => {
    const otherUser = conv.buyerId === currentUserId ? conv.seller : conv.buyer;
    const lastMessage = conv.messages[conv.messages.length - 1];
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

  const formatDateGroup = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const dateKey = formatDateGroup(new Date(message.createdAt));
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const selectedConv = transformedConversations.find(
    (c) => c.id === selectedConversation
  );

  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = bindConversationChannel('new-message', (data: any) => {
      if (data.message.senderId !== currentUserId) {
        setRealTimeMessages(prev => [...prev, data.message]);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedConversation, bindConversationChannel, currentUserId]);

  useEffect(() => {
    if (!selectedConversation) {
      setRealTimeMessages([]);
      setOptimisticMessages([]);
      setFailedMessages([]);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [realTimeMessages, optimisticMessages]);

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (selectedConversation) {
      sendTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 1000);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSubmitting) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: newMessage.trim(),
      senderId: currentUserId,
      createdAt: new Date(),
      read: false,
    };

    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: messageText,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
        window.location.reload();
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
      setFailedMessages(prev => [...prev, { ...optimisticMessage, id: tempId }]);
      setNewMessage(messageText);
    } finally {
      setIsSubmitting(false);
    }
  };

  const retryMessage = async (failedMessage: Message) => {
    setFailedMessages(prev => prev.filter(msg => msg.id !== failedMessage.id));
    
    const tempId = `temp-${Date.now()}`;
    const retryMessage: Message = {
      ...failedMessage,
      id: tempId,
      createdAt: new Date(),
    };

    setOptimisticMessages(prev => [...prev, retryMessage]);
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: failedMessage.content,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
        window.location.reload();
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error retrying message:', error);
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
      setFailedMessages(prev => [...prev, failedMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Conversations List */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <div className="relative mt-2">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground/70" />
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
                <div className="p-6 text-center text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    className={`w-full p-4 text-left transition-colors hover:bg-muted ${
                      selectedConversation === conversation.id
                        ? 'bg-muted'
                        : ''
                    }`}
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-accent">
                        {conversation.otherUser.imageUrl ? (
                          <AvatarImage
                            alt={conversation.otherUser.name}
                            className="h-10 w-10"
                            src={conversation.otherUser.imageUrl}
                            size={40}
                          />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <h4 className="font-medium text-sm">
                            {conversation.otherUser.name}
                          </h4>
                          {conversation.lastMessage && (
                            <span className="text-muted-foreground text-xs">
                              {formatTime(
                                new Date(conversation.lastMessage.timestamp)
                              )}
                            </span>
                          )}
                        </div>

                        <div className="mb-1 flex items-center gap-2">
                          <Package className="h-3 w-3 text-muted-foreground/70" />
                          <span className="truncate text-muted-foreground text-xs">
                            {conversation.product.title}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            ${conversation.product.price}
                          </span>
                        </div>

                        {conversation.lastMessage && (
                          <p
                            className={`truncate text-sm ${
                              !conversation.lastMessage.isRead &&
                              conversation.lastMessage.senderId !==
                                currentUserId
                                ? 'font-medium text-foreground'
                                : 'text-muted-foreground'
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] bg-accent">
                    {selectedConv.otherUser.imageUrl ? (
                      <AvatarImage
                        alt={selectedConv.otherUser.name}
                        className="h-10 w-10"
                        src={selectedConv.otherUser.imageUrl}
                        size={40}
                      />
                    ) : (
                      <span className="font-medium text-muted-foreground text-sm">
                        {selectedConv.otherUser.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium">
                      {selectedConv.otherUser.name}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
                  {selectedConv.rawConversation.messages.length === 0 && optimisticMessages.length === 0 && realTimeMessages.length === 0 && failedMessages.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    (() => {
                      const allMessages = [...selectedConv.rawConversation.messages, ...realTimeMessages, ...optimisticMessages, ...failedMessages];
                      const groupedMessages = groupMessagesByDate(allMessages);
                      
                      return Object.entries(groupedMessages).map(([dateGroup, messages]) => (
                        <div key={dateGroup}>
                          <div className="my-4 text-center">
                            <span className="rounded-[var(--radius-full)] bg-secondary px-3 py-1 text-xs text-muted-foreground">
                              {dateGroup}
                            </span>
                          </div>
                          {messages.map((message) => {
                            const isSender = message.senderId === currentUserId;
                            const isOptimistic = message.id.startsWith('temp-');
                            const isFailed = failedMessages.some(msg => msg.id === message.id);
                            return (
                              <div
                                className={`flex items-start gap-3 ${isSender ? 'justify-end' : ''}`}
                                key={message.id}
                              >
                          {!isSender && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-full)] bg-accent">
                              <span className="font-medium text-muted-foreground text-xs">
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
                              className={`max-w-xs rounded-[var(--radius-lg)] p-3 ${
                                isSender
                                  ? `ml-auto ${
                                      isFailed
                                        ? 'bg-red-600 text-background'
                                        : isOptimistic
                                        ? 'bg-blue-600 text-background opacity-70'
                                        : 'bg-blue-600 text-background'
                                    }`
                                  : 'bg-secondary'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              {isFailed && (
                                <button
                                  onClick={() => retryMessage(message)}
                                  className="mt-2 text-xs text-background underline hover:no-underline"
                                >
                                  Retry
                                </button>
                              )}
                            </div>
                            <div
                              className={`mt-1 flex items-center gap-1 ${
                                isSender ? 'justify-end' : ''
                              }`}
                            >
                              {isSender && !isOptimistic && !isFailed && message.read && (
                                <CheckCheck className="h-3 w-3 text-muted-foreground/70" />
                              )}
                              {isOptimistic && (
                                <span className="text-muted-foreground/70 text-xs">Sending...</span>
                              )}
                              {isFailed && (
                                <span className="text-red-500 text-xs">Failed</span>
                              )}
                              {!isOptimistic && !isFailed && (
                                <span className="text-muted-foreground text-xs">
                                  {formatTime(new Date(message.createdAt))}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                              );
                            })}
                        </div>
                      ));
                    })()
                  )}
                  
                  {/* Typing indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-full)] bg-accent">
                        <span className="font-medium text-muted-foreground text-xs">
                          {selectedConv?.otherUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="max-w-xs rounded-[var(--radius-lg)] bg-secondary p-3">
                          <div className="flex space-x-1">
                            <div className="animate-pulse h-2 w-2 rounded-[var(--radius-full)] bg-muted-foreground/20"></div>
                            <div className="animate-pulse h-2 w-2 rounded-[var(--radius-full)] bg-muted-foreground/20 delay-75"></div>
                            <div className="animate-pulse h-2 w-2 rounded-[var(--radius-full)] bg-muted-foreground/20 delay-150"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newMessage.trim()) {
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    value={newMessage}
                  />
                  <Button
                    disabled={!newMessage.trim() || isSubmitting}
                    onClick={sendMessage}
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
                <MessageCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground/70" />
                <h3 className="mb-2 font-medium text-foreground text-lg">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground">
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
