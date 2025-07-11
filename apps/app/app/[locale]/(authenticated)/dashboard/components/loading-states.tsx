import { DashboardStatsSkeleton, RecentOrdersSkeleton } from './dashboard-skeletons';

export function DashboardStatsLoading() {
  return <DashboardStatsSkeleton />;
}

export function RecentOrdersLoading() {
  return <RecentOrdersSkeleton />;
}