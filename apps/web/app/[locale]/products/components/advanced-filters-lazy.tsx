'use client';

import { Skeleton } from '@repo/ui/components';
import { lazy, Suspense } from 'react';

const AdvancedFilters = lazy(() =>
  import('./advanced-filters').then((module) => ({
    default: module.AdvancedFilters,
  }))
);

interface AdvancedFiltersLazyProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  currentFilters: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  onFiltersChange: (filters: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => void;
}

function AdvancedFiltersSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

export function AdvancedFiltersLazy(props: AdvancedFiltersLazyProps) {
  return (
    <Suspense fallback={<AdvancedFiltersSkeleton />}>
      <AdvancedFilters {...props} />
    </Suspense>
  );
}
