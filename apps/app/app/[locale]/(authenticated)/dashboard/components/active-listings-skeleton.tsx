import {
  Card,
  CardContent,
  CardHeader,
  Skeleton,
} from '@repo/ui/components';

export function ActiveListingsSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-background dark:border-gray-800 dark:bg-foreground">
      <CardHeader className="flex flex-row items-center justify-between border-border border-b px-4 pb-3 dark:border-gray-800">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-4 pb-4">
        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="w-40 flex-shrink-0 space-y-1.5 sm:w-44" key={i}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] bg-accent dark:bg-secondary-foreground">
                <Skeleton className="h-full w-full" />
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
