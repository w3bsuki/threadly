import { ProductGridSkeleton } from '@repo/design-system/components';
import { Skeleton } from '@repo/design-system/components';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters skeleton */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
      </div>
      
      {/* Products grid skeleton */}
      <ProductGridSkeleton count={12} />
    </div>
  );
}