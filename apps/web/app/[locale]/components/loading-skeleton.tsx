'use client';

import { cn } from '@repo/design-system/lib/utils';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-md)] bg-accent',
        animate && 'animate-pulse',
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductQuickViewSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function ProductListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div className="flex space-x-4" key={i}>
          <Skeleton className="h-24 w-24 rounded-[var(--radius-md)]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between p-4">
      <Skeleton className="h-8 w-32" />
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-[var(--radius-full)]" />
        <Skeleton className="h-8 w-8 rounded-[var(--radius-full)]" />
      </div>
    </div>
  );
}

export function FiltersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton className="h-8" key={i} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton className="h-8" key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          className="flex items-center space-x-4 rounded-[var(--radius-lg)] border p-4"
          key={i}
        >
          <Skeleton className="h-16 w-16 rounded-[var(--radius-md)]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-1/4" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
}
