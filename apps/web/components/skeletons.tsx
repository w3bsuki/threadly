import { cn } from '@repo/design-system/lib/utils';
import { Skeleton } from '@repo/design-system/components';

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 md:p-6">
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
        
        {/* Size selector skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-16" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-12" />
            ))}
          </div>
        </div>
        
        {/* Action buttons skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        
        {/* Seller info skeleton */}
        <div className="border-t pt-6 space-y-4">
          <Skeleton className="h-5 w-20" />
          <div className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-full" />
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

export function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-96 md:h-[500px] lg:h-[600px]">
      <Skeleton className="absolute inset-0 rounded-lg" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <Skeleton className="h-12 w-80 mx-auto" />
          <Skeleton className="h-6 w-64 mx-auto" />
          <Skeleton className="h-12 w-40 mx-auto" />
        </div>
      </div>
    </div>
  );
}

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

export function CartSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-8 w-32" />
      
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
            <Skeleton className="h-20 w-20 rounded-lg" />
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
      <div className="border-t pt-6 space-y-4">
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

export function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 md:p-6">
      {/* Order summary */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <Skeleton className="h-16 w-16 rounded-lg" />
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

// Page loading overlay
export function PageLoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Button loading state
export function LoadingButton({ 
  children, 
  loading, 
  loadingText = 'Loading...', 
  ...props 
}: { 
  children: React.ReactNode; 
  loading: boolean; 
  loadingText?: string;
  [key: string]: any;
}) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner size="sm" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}