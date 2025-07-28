'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { memo, useRef } from 'react';

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

export const ConversationList = memo(
  ({
    conversations,
    currentUserId,
    selectedConversationId,
    onSelectConversation,
    searchQuery,
    onSearchChange,
    filterType,
    enableVirtualization = false,
    containerHeight = 400,
  }: ConversationListProps) => {
    const filteredConversations = conversations.filter((conversation) => {
      if (!searchQuery) return true;

      const otherUser =
        conversation.buyerId === currentUserId
          ? conversation.seller
          : conversation.buyer;

      const searchText = searchQuery.toLowerCase();
      return (
        conversation.product.title.toLowerCase().includes(searchText) ||
        `${otherUser.firstName} ${otherUser.lastName}`
          .toLowerCase()
          .includes(searchText)
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
      const diffInHours =
        Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return format(date, 'HH:mm');
      }
      if (diffInHours < 168) {
        // 7 days
        return format(date, 'EEE HH:mm');
      }
      return format(date, 'MMM d');
    };

    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Conversations</CardTitle>
            <Badge variant="secondary">{filteredConversations.length}</Badge>
          </div>

          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
            <Input
              className="pl-10"
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations..."
              value={searchQuery}
            />
          </div>

          <Tabs className="w-full" value={filterType || 'all'}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger asChild value="all">
                <Link href="/messages">All</Link>
              </TabsTrigger>
              <TabsTrigger asChild value="buying">
                <Link href="/messages?type=buying">Buying</Link>
              </TabsTrigger>
              <TabsTrigger asChild value="selling">
                <Link href="/messages?type=selling">Selling</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          {!enableVirtualization || filteredConversations.length < 100 ? (
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
                      className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-lg)] p-3 transition-colors hover:bg-muted/50 ${
                        selectedConversationId === conversation.id
                          ? 'bg-muted'
                          : ''
                      }`}
                      key={conversation.id}
                      onClick={() => onSelectConversation(conversation)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={otherUser.imageUrl || undefined} />
                        <AvatarFallback>
                          {otherUser.firstName?.[0]}
                          {otherUser.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="truncate font-medium text-sm">
                            {otherUser.firstName} {otherUser.lastName}
                          </h4>
                          <div className="flex items-center gap-1">
                            {lastMessage && (
                              <span className="text-muted-foreground text-xs">
                                {formatMessageTime(lastMessage.createdAt)}
                              </span>
                            )}
                            {unreadCount > 0 && (
                              <Badge
                                className="h-5 w-5 p-0 text-xs"
                                variant="destructive"
                              >
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="truncate text-muted-foreground text-xs">
                          {conversation.product.title}
                        </p>

                        {lastMessage && (
                          <p className="mt-1 truncate text-muted-foreground text-xs">
                            {lastMessage.content}
                          </p>
                        )}

                        <div className="mt-1 flex items-center gap-2">
                          <Badge
                            className="text-xs"
                            variant={
                              role === 'buying' ? 'default' : 'secondary'
                            }
                          >
                            {role === 'buying' ? 'Buying' : 'Selling'}
                          </Badge>
                          <span className="text-muted-foreground text-xs">
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
              className="w-full"
              ref={parentRef}
              style={{ height: `${containerHeight}px`, overflow: 'auto' }}
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
                          className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-lg)] p-3 transition-colors hover:bg-muted/50 ${
                            selectedConversationId === conversation.id
                              ? 'bg-muted'
                              : ''
                          }`}
                          onClick={() => onSelectConversation(conversation)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={otherUser.imageUrl || undefined}
                            />
                            <AvatarFallback>
                              {otherUser.firstName?.[0]}
                              {otherUser.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="truncate font-medium text-sm">
                                {otherUser.firstName} {otherUser.lastName}
                              </h4>
                              <div className="flex items-center gap-1">
                                {lastMessage && (
                                  <span className="text-muted-foreground text-xs">
                                    {formatMessageTime(lastMessage.createdAt)}
                                  </span>
                                )}
                                {unreadCount > 0 && (
                                  <Badge
                                    className="h-5 w-5 p-0 text-xs"
                                    variant="destructive"
                                  >
                                    {unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <p className="truncate text-muted-foreground text-xs">
                              {conversation.product.title}
                            </p>

                            {lastMessage && (
                              <p className="mt-1 truncate text-muted-foreground text-xs">
                                {lastMessage.content}
                              </p>
                            )}

                            <div className="mt-1 flex items-center gap-2">
                              <Badge
                                className="text-xs"
                                variant={
                                  role === 'buying' ? 'default' : 'secondary'
                                }
                              >
                                {role === 'buying' ? 'Buying' : 'Selling'}
                              </Badge>
                              <span className="text-muted-foreground text-xs">
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
  }
);

ConversationList.displayName = 'ConversationList';
