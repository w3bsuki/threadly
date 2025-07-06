import { SearchResultsSkeleton } from '@repo/design-system/components';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SearchResultsSkeleton />
    </div>
  );
}