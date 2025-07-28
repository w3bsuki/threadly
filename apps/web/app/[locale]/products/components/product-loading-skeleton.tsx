import { Card, CardContent } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';

// Custom Skeleton component
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--radius-md)] bg-accent/80',
        className
      )}
      {...props}
    />
  );
}

interface ProductLoadingSkeletonProps {
  count?: number;
}

function ProductCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden border-0 bg-background shadow-sm">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/5] bg-secondary sm:aspect-[3/4]">
        <Skeleton className="absolute inset-0" />

        {/* Condition Badge Skeleton */}
        <div className="absolute top-2 left-2">
          <Skeleton className="h-5 w-16 rounded-[var(--radius-full)]" />
        </div>

        {/* Favorites Skeleton */}
        <div className="absolute top-2 right-2">
          <Skeleton className="h-6 w-12 rounded-[var(--radius-full)]" />
        </div>
      </div>

      {/* Content Skeleton */}
      <CardContent className="p-3 sm:p-4">
        {/* Brand */}
        <Skeleton className="mb-2 h-3 w-16" />

        {/* Title */}
        <div className="mb-3 space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Price and Seller */}
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>

        {/* Category */}
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

export function ProductLoadingSkeleton({
  count = 12,
}: ProductLoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Header skeleton for the products page
export function ProductHeaderSkeleton() {
  return (
    <div className="mb-6 sm:mb-8">
      {/* Title and Description */}
      <div className="mb-4 sm:mb-6">
        <Skeleton className="mb-2 h-8 w-64 sm:h-10 lg:h-12" />
        <Skeleton className="h-4 w-48 sm:h-5" />
      </div>

      {/* Mobile Filter and Sort Bar */}
      <div className="lg:hidden">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>

      {/* Desktop Sort Bar */}
      <div className="hidden lg:flex lg:items-center lg:justify-between">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-9 w-48" />
      </div>
    </div>
  );
}

// Filter sidebar skeleton
export function ProductFiltersSkeleton() {
  return (
    <div className="space-y-6 rounded-[var(--radius-lg)] border border-border bg-background p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>

      {/* Filter Sections */}
      <div className="space-y-4">
        {/* Category Section */}
        <div>
          <Skeleton className="mb-3 h-5 w-20" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="flex items-center gap-3" key={index}>
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Price Section */}
        <div>
          <Skeleton className="mb-3 h-5 w-24" />
          <Skeleton className="mb-3 h-6 w-full" />
          <div className="mb-3 grid grid-cols-2 gap-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>

        {/* Condition Section */}
        <div>
          <Skeleton className="mb-3 h-5 w-20" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="flex items-center gap-3" key={index}>
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
