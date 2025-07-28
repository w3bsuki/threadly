'use client';

import {
  Card,
  CardContent,
  ErrorBoundary,
  MessagesSkeleton,
} from '@repo/design-system/components';
import { useChannel, useTypingIndicator } from '@repo/real-time/client';
import { messageContentSchema } from '@repo/validation/schemas';
import { MessageCircle } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import type {
  Conversation,
  ConversationListItem,
  Message,
  MessageNotificationData,
  MessagesContentProps,
  NewMessageData,
} from '../types';
import { ChatHeader } from './chat-header';
import { ConversationList } from './conversation-list';
import { MessageInputEnhanced } from './message-input-enhanced';
import { MessageList } from './message-list';

function MessagesContainerInner({
  conversations,
  currentUserId,
  filterType,
  targetUser,
  targetProduct,
  existingConversation,
}: MessagesContentProps) {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(existingConversation?.id || null);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [realTimeMessages, setRealTimeMessages] = useState<Message[]>([]);
  const [failedMessages, setFailedMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationsList, setConversationsList] = useState(conversations);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { bind: bindConversationChannel } = useChannel(
    selectedConversation ? `private-conversation-${selectedConversation}` : ''
  );

  const { bind: bindUserChannel } = useChannel(`private-user-${currentUserId}`);

  const { typingUsers, sendTyping } = useTypingIndicator(
    selectedConversation || ''
  );

  // Update conversations list when props change
  useEffect(() => {
    setConversationsList(conversations);
  }, [conversations]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, optimisticMessages, realTimeMessages]);

  // Transform conversations to match the ConversationListItem format
  const transformedConversations: ConversationListItem[] =
    conversationsList.map((conv) => {
      const otherUser =
        conv.buyerId === currentUserId ? conv.seller : conv.buyer;
      const lastMessage = conv.messages[conv.messages.length - 1];
      const unreadCount = conv.messages.filter(
        (m) => !m.read && m.senderId !== currentUserId
      ).length;

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

  // Filter conversations based on search and type
  const filteredConversations = transformedConversations.filter(
    (conversation) => {
      const matchesSearch =
        conversation.otherUser.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        conversation.product.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      if (!filterType) return matchesSearch;

      const isBuying = conversation.rawConversation.buyerId === currentUserId;
      const isSelling = conversation.rawConversation.sellerId === currentUserId;

      return (
        matchesSearch &&
        ((filterType === 'buying' && isBuying) ||
          (filterType === 'selling' && isSelling))
      );
    }
  );

  const selectedConv = transformedConversations.find(
    (c) => c.id === selectedConversation
  );
  const selectedFullConv = conversationsList.find(
    (c) => c.id === selectedConversation
  );

  // Listen for real-time messages in selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = bindConversationChannel(
      'new-message',
      (data: NewMessageData) => {
        if (data.conversationId === selectedConversation) {
          const newMessage: Message = {
            id: data.id,
            content: data.content,
            senderId: data.senderId,
            createdAt: new Date(data.createdAt),
            read: data.senderId === currentUserId,
          };

          // Update real-time messages
          if (data.senderId !== currentUserId) {
            setRealTimeMessages((prev) => [...prev, newMessage]);
          }

          // Update conversations list
          setConversationsList((prevList) =>
            prevList.map((conv) =>
              conv.id === selectedConversation
                ? {
                    ...conv,
                    messages: [...conv.messages, newMessage],
                    updatedAt: new Date(data.createdAt),
                  }
                : conv
            )
          );
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedConversation, bindConversationChannel, currentUserId]);

  // Listen for new messages in all user conversations
  useEffect(() => {
    if (!bindUserChannel) return;

    const unsubscribe = bindUserChannel(
      'new-message-notification',
      (data: MessageNotificationData) => {
        setConversationsList((prevList) => {
          const updatedList = prevList.map((conv) => {
            if (conv.id === data.conversationId) {
              if (selectedConversation === conv.id) return conv;

              return {
                ...conv,
                updatedAt: new Date(data.createdAt),
                _count: {
                  ...conv._count,
                  messages: conv._count.messages + 1,
                },
              };
            }
            return conv;
          });

          return updatedList.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
      }
    );

    return unsubscribe;
  }, [bindUserChannel, selectedConversation]);

  useEffect(() => {
    if (!selectedConversation) {
      setRealTimeMessages([]);
      setOptimisticMessages([]);
      setFailedMessages([]);
    }
  }, [selectedConversation]);

  const handleTyping = (value: string) => {
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

  const sendMessage = async (messageText: string) => {
    if (!(messageText.trim() && selectedConversation) || isSubmitting) return;

    // Validate message content
    const validationResult = messageContentSchema.safeParse(messageText.trim());
    if (!validationResult.success) {
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
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: validationResult.data,
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
      setFailedMessages((prev) => [...prev, optimisticMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const retryMessage = async (failedMessage: Message) => {
    setFailedMessages((prev) =>
      prev.filter((msg) => msg.id !== failedMessage.id)
    );
    await sendMessage(failedMessage.content);
  };

  // Combine all messages
  const allMessages: Message[] = [
    ...(selectedFullConv?.messages || []),
    ...realTimeMessages,
    ...optimisticMessages,
    ...failedMessages,
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
      {/* Conversations List */}
      <div className="order-2 lg:order-1 lg:col-span-1">
        <ConversationList
          className="h-full lg:max-h-[calc(100vh-12rem)]"
          conversations={filteredConversations}
          currentUserId={currentUserId}
          onConversationSelect={(conv) => setSelectedConversation(conv.id)}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          selectedConversationId={selectedConversation}
        />
      </div>

      {/* Chat Area */}
      <div className="order-1 lg:order-2 lg:col-span-2">
        <Card className="flex h-[500px] flex-col lg:h-[calc(100vh-12rem)]">
          {selectedConv ? (
            <>
              <ChatHeader
                onProductClick={() =>
                  (window.location.href = `/product/${selectedConv.product.id}`)
                }
                otherUser={selectedConv.otherUser}
                product={selectedConv.product}
              />
              <MessageList
                currentUserId={currentUserId}
                failedMessageIds={failedMessages.map((m) => m.id)}
                messages={allMessages}
                onRetry={retryMessage}
                optimisticMessageIds={optimisticMessages.map((m) => m.id)}
                otherUserAvatar={selectedConv.otherUser.imageUrl}
                otherUserName={selectedConv.otherUser.name}
                typingUsers={Array.from(typingUsers)}
              />
              <div ref={messagesEndRef} />
              <MessageInputEnhanced
                disabled={isSubmitting}
                onSend={sendMessage}
                onTyping={handleTyping}
              />
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

export function MessagesContainer(props: MessagesContentProps) {
  return (
    <ErrorBoundary
      fallback={({ reset }) => (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4 p-6">
              <h3 className="font-semibold text-lg">Unable to Load Messages</h3>
              <p className="text-muted-foreground text-sm">
                There was an error loading your messages. Please try again.
              </p>
              <button
                className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                onClick={reset}
              >
                Try Again
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    >
      <Suspense fallback={<MessagesSkeleton />}>
        <MessagesContainerInner {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
