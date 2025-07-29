'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorBoundary,
  Input,
  MessagesSkeleton,
} from '@repo/ui/components';
import { useChannel, useTypingIndicator } from '@repo/notifications/client';
import {
  createMessageSchema,
  messageContentSchema,
} from '@repo/validation/schemas';
import {
  CheckCheck,
  MessageCircle,
  Package,
  Search,
  Send,
  User,
} from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
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
}

function MessagesContentInner({
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

  const { typingUsers, sendTyping } = useTypingIndicator(
    selectedConversation || ''
  );

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

  const formatTime = (date: Date | string) => {
    const now = new Date();
    const dateObj = date instanceof Date ? date : new Date(date);
    const diff = now.getTime() - dateObj.getTime();
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

  const formatDateGroup = (date: Date | string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateObj = date instanceof Date ? date : new Date(date);
    const messageDate = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate()
    );

    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    }
    if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }
    return messageDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
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

    const unsubscribe = bindConversationChannel(
      'new-message',
      (data: { message: Message }) => {
        if (data.message.senderId !== currentUserId) {
          setRealTimeMessages((prev) => [...prev, data.message]);
        }
      }
    );

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
    // Basic input sanitization to prevent XSS
    const sanitizedValue = value.replace(/<[^>]*>/g, '');
    setNewMessage(sanitizedValue);

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
    if (!(newMessage.trim() && selectedConversation) || isSubmitting) return;

    // Validate message content
    const validationResult = messageContentSchema.safeParse(newMessage.trim());
    if (!validationResult.success) {
      // Handle validation error
      alert(
        validationResult.error.errors[0]?.message || 'Invalid message content'
      );
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: validationResult.data,
      senderId: currentUserId,
      createdAt: new Date(),
      read: false,
    };

    setOptimisticMessages((prev) => [...prev, optimisticMessage]);
    const messageText = validationResult.data;
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
        setOptimisticMessages((prev) =>
          prev.filter((msg) => msg.id !== tempId)
        );
        // Update state instead of reloading
        setRealTimeMessages((prev) => [...prev, data.message]);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      setOptimisticMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setFailedMessages((prev) => [
        ...prev,
        { ...optimisticMessage, id: tempId },
      ]);
      setNewMessage(messageText);
    } finally {
      setIsSubmitting(false);
    }
  };

  const retryMessage = async (failedMessage: Message) => {
    setFailedMessages((prev) =>
      prev.filter((msg) => msg.id !== failedMessage.id)
    );

    // Validate message content before retry
    const validationResult = messageContentSchema.safeParse(
      failedMessage.content
    );
    if (!validationResult.success) {
      setFailedMessages((prev) => [...prev, failedMessage]);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const retryMessage: Message = {
      ...failedMessage,
      id: tempId,
      createdAt: new Date(),
    };

    setOptimisticMessages((prev) => [...prev, retryMessage]);
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
        setOptimisticMessages((prev) =>
          prev.filter((msg) => msg.id !== tempId)
        );
        // Update state instead of reloading
        setRealTimeMessages((prev) => [...prev, data.message]);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      setOptimisticMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setFailedMessages((prev) => [...prev, failedMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
      {/* Conversations List */}
      <div className="order-2 lg:order-1 lg:col-span-1">
        <Card className="h-full lg:max-h-[calc(100vh-12rem)]">
          <CardHeader className="px-3 sm:px-4">
            <CardTitle className="text-base sm:text-lg">
              Conversations
            </CardTitle>
            <div className="relative mt-2">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground/70" />
              <Input
                className="pl-9"
                maxLength={100}
                onChange={(e) => {
                  // Sanitize search input
                  const sanitizedValue = e.target.value.replace(/<[^>]*>/g, '');
                  setSearchQuery(sanitizedValue);
                }}
                placeholder="Search messages..."
                value={searchQuery}
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto p-0 lg:max-h-[calc(100vh-20rem)]">
            <div className="divide-y">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    className={`touch-target w-full p-3 text-left transition-colors hover:bg-muted sm:p-4 ${
                      selectedConversation === conversation.id ? 'bg-muted' : ''
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
                            size={40}
                            src={conversation.otherUser.imageUrl}
                          />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <h4 className="line-clamp-1 font-medium text-sm">
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
      <div className="order-1 lg:order-2 lg:col-span-2">
        <Card className="flex h-[500px] flex-col lg:h-[calc(100vh-12rem)]">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b px-3 py-3 sm:px-4 sm:py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] bg-accent">
                    {selectedConv.otherUser.imageUrl ? (
                      <AvatarImage
                        alt={selectedConv.otherUser.name}
                        className="h-10 w-10"
                        size={40}
                        src={selectedConv.otherUser.imageUrl}
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

                  <Button
                    asChild
                    className="hidden sm:flex"
                    size="sm"
                    variant="outline"
                  >
                    <a href={`/product/${selectedConv.product.id}`}>
                      View Item
                    </a>
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {selectedConv.rawConversation.messages.length === 0 &&
                  optimisticMessages.length === 0 &&
                  realTimeMessages.length === 0 &&
                  failedMessages.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    (() => {
                      const allMessages = [
                        ...selectedConv.rawConversation.messages,
                        ...realTimeMessages,
                        ...optimisticMessages,
                        ...failedMessages,
                      ];
                      const groupedMessages = groupMessagesByDate(allMessages);

                      return Object.entries(groupedMessages).map(
                        ([dateGroup, messages]) => (
                          <div key={dateGroup}>
                            <div className="my-4 text-center">
                              <span className="rounded-[var(--radius-full)] bg-secondary px-3 py-1 text-muted-foreground text-xs">
                                {dateGroup}
                              </span>
                            </div>
                            {messages.map((message) => {
                              const isSender =
                                message.senderId === currentUserId;
                              const isOptimistic =
                                message.id.startsWith('temp-');
                              const isFailed = failedMessages.some(
                                (msg) => msg.id === message.id
                              );
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
                                      <p className="text-sm">
                                        {message.content}
                                      </p>
                                      {isFailed && (
                                        <button
                                          className="mt-2 text-background text-xs underline hover:no-underline"
                                          onClick={() => retryMessage(message)}
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
                                      {isSender &&
                                        !isOptimistic &&
                                        !isFailed &&
                                        message.read && (
                                          <CheckCheck className="h-3 w-3 text-muted-foreground/70" />
                                        )}
                                      {isOptimistic && (
                                        <span className="text-muted-foreground/70 text-xs">
                                          Sending...
                                        </span>
                                      )}
                                      {isFailed && (
                                        <span className="text-red-500 text-xs">
                                          Failed
                                        </span>
                                      )}
                                      {!(isOptimistic || isFailed) && (
                                        <span className="text-muted-foreground text-xs">
                                          {formatTime(
                                            new Date(message.createdAt)
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )
                      );
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
                            <div className="h-2 w-2 animate-pulse rounded-[var(--radius-full)] bg-muted-foreground/20" />
                            <div className="h-2 w-2 animate-pulse rounded-[var(--radius-full)] bg-muted-foreground/20 delay-75" />
                            <div className="h-2 w-2 animate-pulse rounded-[var(--radius-full)] bg-muted-foreground/20 delay-150" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="safe-area-pb border-t p-3 sm:p-4">
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
                    className="touch-target"
                    disabled={!newMessage.trim() || isSubmitting}
                    onClick={sendMessage}
                    size="icon"
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

export function MessagesContent(props: MessagesContentProps) {
  return (
    <ErrorBoundary
      fallback={({ reset }) => (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Unable to Load Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                There was an error loading your messages. Please try again.
              </p>
              <Button className="w-full" onClick={reset}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    >
      <Suspense fallback={<MessagesSkeleton />}>
        <MessagesContentInner {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
