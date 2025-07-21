import { Card, CardContent, CardHeader } from '@repo/design-system/components';
import { SkeletonShimmer, SkeletonText, SkeletonAvatar } from '@repo/design-system/components';

export function OrdersListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <SkeletonShimmer className="h-5 w-32" />
                <SkeletonShimmer className="h-4 w-24" />
              </div>
              <div className="text-right space-y-2">
                <SkeletonShimmer className="h-6 w-20 rounded-[var(--radius-full)]" />
                <SkeletonShimmer className="h-5 w-16" />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex gap-3 mb-4">
              <SkeletonShimmer className="w-16 h-16 rounded-[var(--radius-md)]" />
              <div className="flex-1 space-y-2">
                <SkeletonText lines={2} />
                <div className="flex items-center justify-between">
                  <SkeletonShimmer className="h-3 w-24" />
                  <SkeletonShimmer className="h-4 w-16" />
                </div>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <SkeletonShimmer className="h-3 w-20" />
                  <SkeletonShimmer className="h-3 w-16" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
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
    <div className="grid gap-4 md:grid-cols-4 mt-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <SkeletonShimmer className="h-8 w-12 mx-auto rounded-[var(--radius-md)]" />
              <SkeletonShimmer className="h-4 w-20 mx-auto" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}