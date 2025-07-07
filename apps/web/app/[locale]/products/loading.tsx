import { ProductGridSkeleton, FiltersSkeleton, HeaderSkeleton } from '../components/loading-skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Spacer for mobile navigation */}
      <div className="h-32 md:hidden" />
      
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-6">
        {/* Header skeleton */}
        <HeaderSkeleton />
        
        {/* Main Layout - Sidebar + Grid */}
        <div className="lg:flex lg:gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64">
            <div className="sticky top-24">
              <FiltersSkeleton />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            <ProductGridSkeleton count={12} />
          </main>
        </div>
      </div>
    </div>
  );
}