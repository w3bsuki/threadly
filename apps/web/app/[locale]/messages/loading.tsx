import { Card, CardContent, CardHeader } from '@repo/design-system/components';
import { Skeleton } from '@repo/design-system/components';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header skeleton */}
          <div className="mb-8">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="p-4 border-b">
                        <div className="flex items-start gap-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
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
              <Card className="h-full flex flex-col">
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                    <Skeleton className="h-6 w-48 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto" />
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