export function DashboardStatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-border rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentOrdersLoading() {
  return (
    <div className="border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-muted rounded-lg animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-12 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}