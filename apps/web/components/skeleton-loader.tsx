'use client';

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--radius-md)] bg-accent',
        className
      )}
    />
  );
}

export function ProductCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ 
  count = 12, 
  isCompact = false 
}: { 
  count?: number; 
  isCompact?: boolean; 
}) {
  const gridClass = isCompact
    ? 'grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7'
    : 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ProductListSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <Skeleton className="h-32 w-24 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}