'use client';

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@repo/design-system/components';
import { MessageCircle, Package, Search, User } from 'lucide-react';
import type { ConversationListProps } from '../types';

export function ConversationList({
  conversations,
  selectedConversationId,
  onConversationSelect,
  searchQuery,
  onSearchChange,
  currentUserId,
  className,
}: ConversationListProps) {
  // Conversations are already filtered by the parent component

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

  return (
    <Card className={className}>
      <CardHeader className="px-3 sm:px-4">
        <CardTitle className="text-base sm:text-lg">Conversations</CardTitle>
        <div className="relative mt-2">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground/70" />
          <Input
            className="pl-9"
            maxLength={100}
            onChange={(e) => {
              const sanitizedValue = e.target.value.replace(/<[^>]*>/g, '');
              onSearchChange(sanitizedValue);
            }}
            placeholder="Search messages..."
            value={searchQuery}
          />
        </div>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto p-0 lg:max-h-[calc(100vh-20rem)]">
        <div className="divide-y">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                className={`touch-target w-full p-3 text-left transition-colors hover:bg-muted sm:p-4 ${
                  selectedConversationId === conversation.id ? 'bg-muted' : ''
                }`}
                key={conversation.id}
                onClick={() => onConversationSelect(conversation)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-accent">
                    {conversation.otherUser.imageUrl ? (
                      <img
                        alt={conversation.otherUser.name}
                        className="h-10 w-10 rounded-[var(--radius-full)]"
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
                          conversation.lastMessage.senderId !== currentUserId
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
  );
}
