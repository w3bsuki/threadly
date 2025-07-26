import { Card, CardContent, CardHeader } from '@repo/design-system/components';
import { Skeleton } from '@repo/design-system/components';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';

export function AnalyticsChartsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Revenue Chart Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-32" />
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-3 w-28 mb-4" />
          <div className="h-[120px] relative">
            {/* Chart area skeleton */}
            <div className="absolute inset-0 flex items-end justify-between gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <Skeleton 
                    className="w-full" 
                    style={{ height: `${Math.random() * 60 + 40}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Chart Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-28" />
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-28 mb-4" />
          <div className="h-[120px] relative">
            {/* Bar chart skeleton */}
            <div className="absolute inset-0 flex items-end justify-between gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <Skeleton 
                    className="w-full rounded-t-sm" 
                    style={{ height: `${Math.random() * 60 + 40}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Views Chart Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-28" />
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-28 mb-4" />
          <div className="h-[120px] relative">
            {/* Line chart skeleton */}
            <div className="absolute inset-0">
              <svg className="w-full h-full">
                <path
                  d={`M 0 ${60 + Math.random() * 40} 
                      Q ${100 / 6} ${40 + Math.random() * 40} ${200 / 6} ${50 + Math.random() * 40}
                      T ${300 / 6} ${45 + Math.random() * 40}
                      T ${400 / 6} ${55 + Math.random() * 40}
                      T ${500 / 6} ${40 + Math.random() * 40}
                      T ${600 / 6} ${50 + Math.random() * 40}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground/20"
                  transform="scale(3.5, 1)"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}