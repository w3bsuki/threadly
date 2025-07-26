'use client';

import {
  Card,
  CardContent,
  ErrorBoundary,
  MessagesSkeleton,
} from '@repo/design-system/components';
import { MessageCircle } from 'lucide-react';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useChannel, useTypingIndicator } from '@repo/real-time/client';
import type { 
  Conversation, 
  Message, 
  ConversationListItem,
  MessagesContentProps,
  NewMessageData,
  MessageNotificationData 
} from '../types';
import { ConversationList } from './conversation-list';
import { ChatHeader } from './chat-header';
import { MessageList } from './message-list';
import { MessageInputEnhanced } from './message-input-enhanced';
import { messageContentSchema } from '@repo/validation/schemas';

function MessagesContainerInner({
  conversations,
  currentUserId,
  filterType,
  targetUser,
  targetProduct,
  existingConversation,
}: MessagesContentProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    existingConversation?.id || null
  );
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
  
  const { typingUsers, sendTyping } = useTypingIndicator(selectedConversation || '');

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
  const transformedConversations: ConversationListItem[] = conversationsList.map((conv) => {
    const otherUser = conv.buyerId === currentUserId ? conv.seller : conv.buyer;
    const lastMessage = conv.messages[conv.messages.length - 1];
    const unreadCount = conv.messages.filter(m => !m.read && m.senderId !== currentUserId).length;

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

  // Filter conversations based on search and type
  const filteredConversations = transformedConversations.filter(conversation => {
    const matchesSearch = 
      conversation.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.product.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!filterType) return matchesSearch;
    
    const isBuying = conversation.rawConversation.buyerId === currentUserId;
    const isSelling = conversation.rawConversation.sellerId === currentUserId;
    
    return matchesSearch && (
      (filterType === 'buying' && isBuying) ||
      (filterType === 'selling' && isSelling)
    );
  });

  const selectedConv = transformedConversations.find(c => c.id === selectedConversation);
  const selectedFullConv = conversationsList.find(c => c.id === selectedConversation);

  // Listen for real-time messages in selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = bindConversationChannel('new-message', (data: NewMessageData) => {
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
          setRealTimeMessages(prev => [...prev, newMessage]);
        }

        // Update conversations list
        setConversationsList(prevList =>
          prevList.map(conv =>
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
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedConversation, bindConversationChannel, currentUserId]);

  // Listen for new messages in all user conversations
  useEffect(() => {
    if (!bindUserChannel) return;

    const unsubscribe = bindUserChannel('new-message-notification', (data: MessageNotificationData) => {
      setConversationsList(prevList => {
        const updatedList = prevList.map(conv => {
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
        
        return updatedList.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    });

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
    if (!messageText.trim() || !selectedConversation || isSubmitting) return;

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

    setOptimisticMessages(prev => [...prev, optimisticMessage]);
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
        setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
        // Update state instead of reloading
        setRealTimeMessages(prev => [...prev, data.message]);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
      setFailedMessages(prev => [...prev, optimisticMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const retryMessage = async (failedMessage: Message) => {
    setFailedMessages(prev => prev.filter(msg => msg.id !== failedMessage.id));
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
    <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
      {/* Conversations List */}
      <div className="lg:col-span-1 order-2 lg:order-1">
        <ConversationList
          conversations={filteredConversations}
          selectedConversationId={selectedConversation}
          onConversationSelect={(conv) => setSelectedConversation(conv.id)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentUserId={currentUserId}
          className="h-full lg:max-h-[calc(100vh-12rem)]"
        />
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2 order-1 lg:order-2">
        <Card className="flex h-[500px] lg:h-[calc(100vh-12rem)] flex-col">
          {selectedConv ? (
            <>
              <ChatHeader
                otherUser={selectedConv.otherUser}
                product={selectedConv.product}
                onProductClick={() => window.location.href = `/product/${selectedConv.product.id}`}
              />
              <MessageList
                messages={allMessages}
                currentUserId={currentUserId}
                otherUserName={selectedConv.otherUser.name}
                otherUserAvatar={selectedConv.otherUser.imageUrl}
                typingUsers={Array.from(typingUsers)}
                onRetry={retryMessage}
                optimisticMessageIds={optimisticMessages.map(m => m.id)}
                failedMessageIds={failedMessages.map(m => m.id)}
              />
              <div ref={messagesEndRef} />
              <MessageInputEnhanced
                onSend={sendMessage}
                onTyping={handleTyping}
                disabled={isSubmitting}
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
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4 p-6">
              <h3 className="font-semibold text-lg">Unable to Load Messages</h3>
              <p className="text-sm text-muted-foreground">
                There was an error loading your messages. Please try again.
              </p>
              <button
                onClick={reset}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
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