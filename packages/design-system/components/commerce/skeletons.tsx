import { cn } from '../../lib/utils';
import { Skeleton } from '../ui/skeleton';

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="group cursor-pointer overflow-hidden rounded-[var(--radius-xl)] border bg-card text-card-foreground shadow-sm">
      {/* Image skeleton */}
      <div className="relative aspect-square bg-muted">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-2 p-3">
        {/* Title */}
        <Skeleton className="h-4 w-3/4" />

        {/* Seller name or secondary info */}
        <Skeleton className="h-3 w-1/2" />

        {/* Badges or tags */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-5 w-12 rounded-[var(--radius-full)]" />
          <Skeleton className="h-5 w-16 rounded-[var(--radius-full)]" />
        </div>

        {/* Price and action */}
        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-8 rounded-[var(--radius-full)]" />
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// Product grid skeleton
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Product detail skeleton
export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 p-4 md:p-6 lg:grid-cols-2">
      {/* Image gallery skeleton */}
      <div className="space-y-4">
        <Skeleton className="aspect-square rounded-[var(--radius-lg)]" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              className="aspect-square rounded-[var(--radius-lg)]"
              key={i}
            />
          ))}
        </div>
      </div>

      {/* Product info skeleton */}
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Size/variant selector skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-16" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton className="h-10 w-12" key={i} />
            ))}
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>

        {/* Seller info skeleton */}
        <div className="space-y-4 border-t pt-6">
          <Skeleton className="h-5 w-20" />
          <div className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-[var(--radius-full)]" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cart skeleton
export function CartSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-8 w-32" />

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            className="flex items-start space-x-4 rounded-[var(--radius-lg)] border border-border p-4"
            key={i}
          >
            <Skeleton className="h-20 w-20 rounded-[var(--radius-lg)]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout section */}
      <div className="space-y-4 border-t pt-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

// Checkout skeleton
export function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 p-4 md:p-6 lg:grid-cols-2">
      {/* Order summary */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />

        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              className="flex items-center space-x-4 rounded-[var(--radius-lg)] border border-border p-4"
              key={i}
            >
              <Skeleton className="h-16 w-16 rounded-[var(--radius-lg)]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>

      {/* Payment form */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-40" />

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

// Order list skeleton
export function OrderListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          className="rounded-[var(--radius-lg)] border border-border p-4"
          key={i}
        >
          <div className="flex items-start space-x-4">
            <Skeleton className="h-16 w-16 rounded-[var(--radius-lg)]" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-24" />
              <div className="mt-3 flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Category grid skeleton
export function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="space-y-3" key={i}>
          <Skeleton className="aspect-square rounded-[var(--radius-lg)]" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// Trending products skeleton
export function TrendingProductsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-20" />
      </div>
      <ProductGridSkeleton count={4} />
    </div>
  );
}

// Hero skeleton
export function HeroSkeleton() {
  return (
    <div className="relative h-96 md:h-[500px] lg:h-[600px]">
      <Skeleton className="absolute inset-0 rounded-[var(--radius-lg)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-md space-y-4 text-center">
          <Skeleton className="mx-auto h-12 w-80" />
          <Skeleton className="mx-auto h-6 w-64" />
          <Skeleton className="mx-auto h-12 w-40" />
        </div>
      </div>
    </div>
  );
}
