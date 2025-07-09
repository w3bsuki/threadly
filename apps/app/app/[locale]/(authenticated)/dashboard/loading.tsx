import { DashboardStatsLoading, RecentOrdersLoading } from './components/loading-states';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header loading */}
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-48 mb-2"></div>
        <div className="h-4 bg-muted rounded w-64"></div>
      </div>

      {/* Stats loading */}
      <DashboardStatsLoading />

      {/* Quick actions loading */}
      <div className="border border-border rounded-lg p-6">
        <div className="h-6 bg-muted rounded w-32 mb-4 animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-20 bg-muted rounded animate-pulse"></div>
          <div className="h-20 bg-muted rounded animate-pulse"></div>
        </div>
      </div>

      {/* Recent orders loading */}
      <RecentOrdersLoading />
    </div>
  );
}