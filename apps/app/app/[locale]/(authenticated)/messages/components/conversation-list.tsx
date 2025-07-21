'use client';

import { Badge } from '@repo/design-system/components';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { ScrollArea } from '@repo/design-system/components';
import { Tabs, TabsList, TabsTrigger } from '@repo/design-system/components';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { memo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

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

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  selectedConversationId?: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType?: 'buying' | 'selling';
  enableVirtualization?: boolean;
  containerHeight?: number;
}

export const ConversationList = memo(({
  conversations,
  currentUserId,
  selectedConversationId,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  filterType,
  enableVirtualization = false,
  containerHeight = 400
}: ConversationListProps) => {
  const filteredConversations = conversations.filter(conversation => {
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

  // Setup virtualization for long conversation lists
  const parentRef = useRef<HTMLDivElement>(null);
  const estimatedItemHeight = 80; // Approximate height per conversation item
  
  const virtualizer = useVirtualizer({
    count: filteredConversations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedItemHeight,
    overscan: 5,
  });

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Conversations</CardTitle>
          <Badge variant="secondary">
            {filteredConversations.length}
          </Badge>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

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
        {(!enableVirtualization || filteredConversations.length < 100) ? (
          // Non-virtualized version for smaller lists
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
                    className={`flex items-center gap-3 p-3 rounded-[var(--radius-lg)] cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedConversationId === conversation.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => onSelectConversation(conversation)}
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
        ) : (
          // Virtualized version for larger lists
          <div
            ref={parentRef}
            style={{ height: `${containerHeight}px`, overflow: 'auto' }}
            className="w-full"
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const conversation = filteredConversations[virtualItem.index];
                const otherUser = getOtherUser(conversation);
                const role = getUserRole(conversation);
                const lastMessage = getLastMessage(conversation);
                const unreadCount = conversation._count.messages;

                return (
                  <div
                    key={conversation.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <div className="p-4">
                      <div
                        className={`flex items-center gap-3 p-3 rounded-[var(--radius-lg)] cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedConversationId === conversation.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => onSelectConversation(conversation)}
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ConversationList.displayName = 'ConversationList';