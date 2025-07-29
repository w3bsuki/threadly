import {
  Card,
  CardContent,
  CardHeader,
  Skeleton,
} from '@repo/ui/components';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header skeleton */}
          <div className="mb-8">
            <Skeleton className="mb-2 h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="grid h-[600px] grid-cols-1 gap-6 md:grid-cols-3">
            {/* Conversations List */}
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <Skeleton className="mb-4 h-6 w-32" />
                  <Skeleton className="h-10 w-full" />
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div className="border-b p-4" key={i}>
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-10 w-10 rounded-[var(--radius-full)]" />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-12" />
                            </div>
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2">
              <Card className="flex h-full flex-col">
                <CardContent className="flex flex-1 items-center justify-center">
                  <div className="space-y-4 text-center">
                    <Skeleton className="mx-auto h-16 w-16 rounded-[var(--radius-full)]" />
                    <Skeleton className="mx-auto h-6 w-48" />
                    <Skeleton className="mx-auto h-4 w-64" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
