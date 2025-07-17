import { Card, CardContent, CardHeader } from '@repo/design-system/components';
import { Skeleton } from '@repo/design-system/components';

export function ActiveListingsSkeleton() {
  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 border-b border-gray-200 dark:border-gray-800">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5 flex-shrink-0 w-40 sm:w-44">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
                <Skeleton className="w-full h-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}