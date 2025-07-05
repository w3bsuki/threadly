import { AdminTableSkeleton } from '@/components/skeletons';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Skeleton } from '@repo/design-system/components';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-72 mt-2" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-[300px]" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdminTableSkeleton rows={8} cols={7} />
        </CardContent>
      </Card>
    </div>
  );
}