import { cn } from '@repo/design-system/lib/utils';
import { Skeleton } from '@repo/design-system/components';

export function MessageListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center justify-between mt-3">
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

// Enhanced Product Card Skeleton to match actual product card structure
export function ProductCardSkeleton() {
  return (
    <div className="group cursor-pointer rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-square relative bg-muted">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <Skeleton className="h-4 w-3/4" />
        
        {/* Seller name */}
        <Skeleton className="h-3 w-1/2" />
        
        {/* Badges */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        
        {/* Price and button */}
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-8 rounded-full" />
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

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/6" />
      </div>
      
      {/* Results grid skeleton */}
      <ProductGridSkeleton count={12} />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      {/* Image gallery skeleton */}
      <div className="space-y-4">
        <Skeleton className="aspect-square rounded-lg" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Product info skeleton */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
        </div>
        
        <Skeleton className="h-10 w-24" />
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-5 w-20" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-8 p-6">
      {/* Profile header */}
      <div className="flex items-start space-x-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex space-x-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-1">
            <Skeleton className="h-8 w-16 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>
      
      {/* Products grid */}
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              i % 3 === 0 ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "space-y-2 max-w-xs",
              i % 3 === 0 ? "items-end" : "items-start"
            )}>
              <Skeleton className="h-4 w-20" />
              <Skeleton className={cn(
                "h-10 rounded-lg",
                i % 3 === 0 ? "w-32" : "w-40"
              )} />
            </div>
          </div>
        ))}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6">
      {/* Welcome header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      
      {/* Recent activity */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading spinner component for inline loading states
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-black", sizeClasses[size])} />
  );
}

// Button loading state
export function ButtonLoading({ children, loading, ...props }: { 
  children: React.ReactNode; 
  loading: boolean; 
  [key: string]: any;
}) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Admin table skeleton
export function AdminTableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b p-4 bg-muted/50">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  {j === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Notification skeleton
export function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}