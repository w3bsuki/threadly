'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useChannel, useTypingIndicator } from '@repo/real-time/client';
import { Card, CardContent } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { sendMessage, markMessagesAsRead } from '../actions/message-actions';
import { ErrorBoundary } from '@/components/error-boundary';
import { ConversationList } from './conversation-list';
import { ChatArea } from './chat-area';
import { NewConversationCard } from './new-conversation-card';

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

interface NewMessageData {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
}

interface MessageNotificationData {
  conversationId: string;
  createdAt: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null!);
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

    const unsubscribe = bindMessages('new-message', (data: NewMessageData) => {
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

    const unsubscribe = bindUserChannel('new-message-notification', (data: MessageNotificationData) => {
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
    <ErrorBoundary>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        <div className="lg:col-span-1">
          <ConversationList
            conversations={conversationsList}
            currentUserId={currentUserId}
            selectedConversationId={selectedConversation?.id}
            onSelectConversation={setSelectedConversation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
          />
        </div>

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
            <ChatArea
              conversation={selectedConversation}
              currentUserId={currentUserId}
              messageInput={messageInput}
              onMessageInputChange={handleTyping}
              onSendMessage={handleSendMessage}
              isSending={isSending}
              typingUsers={typingUsers}
              messagesEndRef={messagesEndRef}
            />
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
    </ErrorBoundary>
  );
}