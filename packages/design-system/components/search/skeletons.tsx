import { Skeleton } from '../ui/skeleton';
import { ProductGridSkeleton } from '../commerce/skeletons';

// Search results skeleton
export function SearchResultsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/6" />
      </div>
      
      {/* Filters skeleton */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Results grid skeleton */}
      <ProductGridSkeleton count={12} />
    </div>
  );
}

// Search input skeleton
export function SearchInputSkeleton() {
  return (
    <div className="relative">
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
}

// Search suggestions skeleton
export function SearchSuggestionsSkeleton() {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

// Search filters skeleton
export function SearchFiltersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Category filter */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Price filter */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-16" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      
      {/* Size filter */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-12" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
      </div>
    </div>
  );
}