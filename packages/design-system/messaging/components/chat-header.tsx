'use client';

import { Button, CardHeader } from '@repo/ui/components';
import { Package } from 'lucide-react';
import type { ChatHeaderProps } from '../types';

export function ChatHeader({
  otherUser,
  product,
  onProductClick,
  className,
}: ChatHeaderProps) {
  return (
    <CardHeader
      className={`border-b px-3 py-3 sm:px-4 sm:py-4 ${className || ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] bg-accent">
          {otherUser.imageUrl ? (
            <img
              alt={otherUser.name}
              className="h-10 w-10 rounded-[var(--radius-full)]"
              src={otherUser.imageUrl}
            />
          ) : (
            <span className="font-medium text-muted-foreground text-sm">
              {otherUser.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-medium">{otherUser.name}</h3>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Package className="h-3 w-3" />
            <span>{product.title}</span>
            <span>•</span>
            <span>${product.price}</span>
          </div>
        </div>

        <Button
          className="hidden sm:flex"
          onClick={onProductClick}
          size="sm"
          variant="outline"
        >
          View Item
        </Button>
      </div>
    </CardHeader>
  );
}
