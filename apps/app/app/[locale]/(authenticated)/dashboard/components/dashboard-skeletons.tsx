import {
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
} from '@repo/design-system/components';

export function DashboardHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="flex items-center gap-2">
        <Skeleton className="h-11 w-11 rounded-[var(--radius-lg)]" />
        <Skeleton className="h-11 w-11 rounded-[var(--radius-lg)]" />
        <Skeleton className="h-11 w-32 rounded-[var(--radius-lg)]" />
      </div>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card className="relative overflow-hidden" key={i}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-[var(--radius-xl)]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function QuickActionsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-20 rounded-[var(--radius-lg)]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              className="min-h-[80px] rounded-[var(--radius-lg)] border border-border bg-card p-4"
              key={i}
            >
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-[var(--radius-lg)]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentOrdersSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-20 rounded-[var(--radius-lg)]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              className="flex min-h-[72px] items-center gap-3 rounded-[var(--radius-lg)] p-3"
              key={i}
            >
              <div className="relative flex-shrink-0">
                <Skeleton className="h-12 w-12 rounded-[var(--radius-lg)]" />
                <Skeleton className="-bottom-1 -right-1 absolute h-5 w-5 rounded-[var(--radius-full)]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <Skeleton className="h-4 w-36" />
                    <div className="flex items-center gap-2">
                      <SkeletonAvatar size="sm" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="flex-shrink-0 space-y-1 text-right">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-16 rounded-[var(--radius-full)]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <DashboardHeaderSkeleton />
      <DashboardStatsSkeleton />
      <QuickActionsSkeleton />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrdersSkeleton />
        <div className="space-y-6">
          {/* Placeholder for additional widgets */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div className="flex items-center gap-3" key={i}>
                    <Skeleton className="h-10 w-10 rounded-[var(--radius-lg)]" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
