import {
  Card,
  CardContent,
  CardHeader,
  SkeletonAvatar,
  SkeletonShimmer,
  SkeletonText,
} from '@repo/design-system/components';

export function OrdersListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card className="overflow-hidden" key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <SkeletonShimmer className="h-5 w-32" />
                <SkeletonShimmer className="h-4 w-24" />
              </div>
              <div className="space-y-2 text-right">
                <SkeletonShimmer className="h-6 w-20 rounded-[var(--radius-full)]" />
                <SkeletonShimmer className="h-5 w-16" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-4 flex gap-3">
              <SkeletonShimmer className="h-16 w-16 rounded-[var(--radius-md)]" />
              <div className="flex-1 space-y-2">
                <SkeletonText lines={2} />
                <div className="flex items-center justify-between">
                  <SkeletonShimmer className="h-3 w-24" />
                  <SkeletonShimmer className="h-4 w-16" />
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <SkeletonShimmer className="h-3 w-20" />
                  <SkeletonShimmer className="h-3 w-16" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t pt-3">
              <SkeletonShimmer className="h-8 w-24 rounded-[var(--radius-md)]" />
              <SkeletonShimmer className="h-8 w-28 rounded-[var(--radius-md)]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function OrdersStatsSkeleton() {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card className="overflow-hidden" key={i}>
          <CardContent className="p-4">
            <div className="space-y-2 text-center">
              <SkeletonShimmer className="mx-auto h-8 w-12 rounded-[var(--radius-md)]" />
              <SkeletonShimmer className="mx-auto h-4 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
