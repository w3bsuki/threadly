import {
  FiltersSkeleton,
  HeaderSkeleton,
  ProductGridSkeleton,
} from '../components/loading-skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Spacer for mobile navigation */}
      <div className="h-32 md:hidden" />

      <div className="mx-auto max-w-7xl px-4 pt-6 pb-6">
        {/* Header skeleton */}
        <HeaderSkeleton />

        {/* Main Layout - Sidebar + Grid */}
        <div className="lg:flex lg:gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden w-64 lg:block">
            <div className="sticky top-24">
              <FiltersSkeleton />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="min-w-0 flex-1">
            <ProductGridSkeleton count={12} />
          </main>
        </div>
      </div>
    </div>
  );
}
