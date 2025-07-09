import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getDictionary } from '@repo/internationalization';
import { currentUser } from '@repo/auth/server';
import { DashboardHeader } from './components/dashboard-header';
import { DashboardStats } from './components/dashboard-stats';
import { RecentOrders } from './components/recent-orders';
import { QuickActions } from './components/quick-actions';
import { DashboardStatsLoading } from './components/loading-states';
import { RecentOrdersLoading } from './components/loading-states';
import { requireOnboarding } from '../components/onboarding-check';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  
  return {
    title: dictionary.dashboard.metadata.dashboard.title,
    description: dictionary.dashboard.metadata.dashboard.description,
  };
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    return null; // This should be handled by the layout auth check
  }

  // Check if user has completed onboarding
  await requireOnboarding();

  return (
    <div className="space-y-6">
      <DashboardHeader user={user} dictionary={dictionary} />
      
      {/* Dashboard Stats - Load with Suspense */}
      <Suspense fallback={<DashboardStatsLoading />}>
        <DashboardStats userId={user.id} dictionary={dictionary} />
      </Suspense>

      {/* Quick Actions - Client Component */}
      <QuickActions dictionary={dictionary} />

      {/* Recent Orders - Load with Suspense */}
      <Suspense fallback={<RecentOrdersLoading />}>
        <RecentOrders userId={user.id} dictionary={dictionary} />
      </Suspense>
    </div>
  );
}