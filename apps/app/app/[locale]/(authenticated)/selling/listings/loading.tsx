import { ProductGridSkeleton } from '@repo/ui/components';

export default function Loading(): React.JSX.Element {
  return (
    <div className="p-4">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-accent" />
        <div className="h-4 w-64 animate-pulse rounded bg-accent" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}
