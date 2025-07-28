import { ActiveListingsSkeleton } from './active-listings-skeleton';
import { RecentOrdersSkeleton } from './dashboard-skeletons';

export function DashboardStatsLoading() {
  return <ActiveListingsSkeleton />;
}

export function RecentOrdersLoading() {
  return <RecentOrdersSkeleton />;
}
