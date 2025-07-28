import {
  Card,
  CardContent,
  CardHeader,
  Skeleton,
} from '@repo/design-system/components';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';

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
          <Skeleton className="mb-1 h-8 w-24" />
          <Skeleton className="mb-4 h-3 w-28" />
          <div className="relative h-[120px]">
            {/* Chart area skeleton */}
            <div className="absolute inset-0 flex items-end justify-between gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div className="flex flex-1 flex-col justify-end" key={i}>
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
          <Skeleton className="mb-1 h-8 w-16" />
          <Skeleton className="mb-4 h-3 w-28" />
          <div className="relative h-[120px]">
            {/* Bar chart skeleton */}
            <div className="absolute inset-0 flex items-end justify-between gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div className="flex flex-1 flex-col justify-end" key={i}>
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
          <Skeleton className="mb-1 h-8 w-20" />
          <Skeleton className="mb-4 h-3 w-28" />
          <div className="relative h-[120px]">
            {/* Line chart skeleton */}
            <div className="absolute inset-0">
              <svg className="h-full w-full">
                <path
                  className="text-muted-foreground/20"
                  d={`M 0 ${60 + Math.random() * 40} 
                      Q ${100 / 6} ${40 + Math.random() * 40} ${200 / 6} ${50 + Math.random() * 40}
                      T ${300 / 6} ${45 + Math.random() * 40}
                      T ${400 / 6} ${55 + Math.random() * 40}
                      T ${500 / 6} ${40 + Math.random() * 40}
                      T ${600 / 6} ${50 + Math.random() * 40}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
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
