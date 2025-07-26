'use client';

import { lazy, Suspense } from 'react';
import { Skeleton } from '@repo/design-system/components';

const MessagesContent = lazy(() => import('./messages-content').then(module => ({ default: module.MessagesContent })));

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
  productId: string;
  buyerId: string;
  sellerId: string;
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

interface MessagesContentLazyProps {
  conversations: Conversation[];
  currentUserId: string;
}

function MessagesContentSkeleton() {
  return (
    <div className="flex h-[calc(100vh-200px)]">
      <div className="w-1/3 border-r">
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-[var(--radius-full)]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <Skeleton className={`h-10 ${i % 2 === 0 ? 'w-48' : 'w-32'} rounded-[var(--radius-lg)]`} />
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

export function MessagesContentLazy(props: MessagesContentLazyProps) {
  return (
    <Suspense fallback={<MessagesContentSkeleton />}>
      <MessagesContent {...props} />
    </Suspense>
  );
}