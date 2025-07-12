import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getDictionary } from '@repo/internationalization';
import { currentUser } from '@repo/auth/server';
import { ModernDashboardHeader } from './components/modern-dashboard-header';
import { DashboardStats } from './components/dashboard-stats';
import { ModernDashboardStats } from './components/modern-dashboard-stats';
import { ModernRecentOrders } from './components/modern-recent-orders';
import { ModernQuickActions } from './components/modern-quick-actions';
import { DashboardStatsLoading } from './components/loading-states';
import { RecentOrdersLoading } from './components/loading-states';
import { requireOnboarding } from '../components/onboarding-check';
import { getCacheService } from '@repo/cache';
import { database } from '@repo/database';
import { decimalToNumber } from '@repo/utils';
import { logError } from '@repo/observability/server';

// PPR: Static header component that can be prerendered
function StaticDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 lg:space-y-6">
      {children}
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  
  return {
    title: dictionary.dashboard.metadata.dashboard.title,
    description: dictionary.dashboard.metadata.dashboard.description,
  };
}

async function getDashboardMetrics(dbUserId: string) {
  const cache = getCacheService();
  const cacheKey = `dashboard:metrics:${dbUserId}`;
  
  return await cache.remember(
    cacheKey,
    async () => {
      try {
        const [activeListings, totalSales, unreadMessages] = await Promise.all([
          database.product.count({
            where: {
              sellerId: dbUserId,
              status: 'AVAILABLE'
            }
          }),
          database.order.aggregate({
            where: {
              sellerId: dbUserId,
              status: 'DELIVERED'
            },
            _sum: { amount: true },
            _count: true
          }),
          Promise.resolve(0) // TODO: Implement unread messages
        ]);

        return {
          activeListings,
          totalRevenue: decimalToNumber(totalSales?._sum?.amount),
          completedSales: totalSales?._count || 0,
          unreadMessages,
        };
      } catch (error) {
        logError('Error fetching dashboard metrics', error);
        return {
          activeListings: 0,
          totalRevenue: 0,
          completedSales: 0,
          unreadMessages: 0,
        };
      }
    },
    300 // Cache for 5 minutes
  );
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

  // Get database user (single query, then pass to metrics)
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true }
  });

  if (!dbUser) {
    return null;
  }

  // Get metrics for modern dashboard using db user ID
  const metrics = await getDashboardMetrics(dbUser.id);

  return (
    <StaticDashboardShell>
      {/* PPR: Static header can be prerendered */}
      <Suspense fallback={<div className="h-20 bg-muted/20 animate-pulse rounded-lg" />}>
        <ModernDashboardHeader user={user} dictionary={dictionary} />
      </Suspense>
      
      {/* PPR: Dynamic stats with loading state */}
      <Suspense fallback={<DashboardStatsLoading />}>
        <ModernDashboardStats metrics={metrics} dictionary={dictionary} />
      </Suspense>

      {/* PPR: Static quick actions can be prerendered */}
      <ModernQuickActions dictionary={dictionary} />

      {/* PPR: Dynamic content with proper suspense boundaries */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<RecentOrdersLoading />}>
            <ModernRecentOrders userId={dbUser.id} dictionary={dictionary} />
          </Suspense>
        </div>

        {/* Additional dashboard content can go here */}
        <div className="space-y-4 lg:space-y-6">
          {/* Placeholder for additional widgets */}
        </div>
      </div>
    </StaticDashboardShell>
  );
}