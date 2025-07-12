import { ProductGridSkeleton } from '@repo/design-system/components';

export default function Loading(): React.JSX.Element {
  return (
    <div className="p-4">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}