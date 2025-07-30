import { currentUser } from '@repo/auth/server';
import { getCacheService } from '@repo/database';
import { database } from '@repo/database';
import { getDictionary } from '@repo/content/internationalization';
import { logError } from '@repo/tooling/observability/server';
import { decimalToNumber } from '@repo/api/utils';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { z } from 'zod';
import { requireOnboarding } from '../components/onboarding-check';
import { ActiveListings } from './components/active-listings';
import { ActivePurchases } from './components/active-purchases';
import { DashboardBanner } from './components/dashboard-banner';
import { DashboardStatsLoading } from './components/loading-states';

const paramsSchema = z.object({
  locale: z.string(),
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const rawParams = await params;
  const { locale } = paramsSchema.parse(rawParams);
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
        const [activeListings, totalSales, totalPurchases, unreadMessages] =
          await Promise.all([
            // Selling metrics
            database.product.count({
              where: {
                sellerId: dbUserId,
                status: 'AVAILABLE',
              },
            }),
            database.order.aggregate({
              where: {
                sellerId: dbUserId,
                status: 'DELIVERED',
              },
              _sum: { amount: true },
              _count: true,
            }),
            // Buying metrics
            database.order.aggregate({
              where: {
                buyerId: dbUserId,
                status: { in: ['SHIPPED', 'DELIVERED'] },
              },
              _sum: { amount: true },
              _count: true,
            }),
            // Messages
            database.message.count({
              where: {
                read: false,
                senderId: {
                  not: dbUserId,
                },
                Conversation: {
                  OR: [{ buyerId: dbUserId }, { sellerId: dbUserId }],
                },
              },
            }),
          ]);

        return {
          // Selling metrics
          activeListings,
          totalRevenue: decimalToNumber(totalSales?._sum?.amount),
          completedSales: totalSales?._count || 0,
          // Buying metrics
          totalSpent: decimalToNumber(totalPurchases?._sum?.amount),
          totalPurchases: totalPurchases?._count || 0,
          // General
          unreadMessages,
        };
      } catch (error) {
        logError('Error fetching dashboard metrics', error);
        return {
          activeListings: 0,
          totalRevenue: 0,
          completedSales: 0,
          totalSpent: 0,
          totalPurchases: 0,
          unreadMessages: 0,
        };
      }
    },
    300 // Cache for 5 minutes
  );
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const rawParams = await params;
  const { locale } = paramsSchema.parse(rawParams);
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    return null;
  }

  await requireOnboarding();

  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  });

  if (!dbUser) {
    return null;
  }

  const metrics = await getDashboardMetrics(dbUser.id);

  return (
    <div className="min-h-screen space-y-3 pb-20 lg:pb-6">
      {/* Combined Header & Stats Banner */}
      <DashboardBanner dictionary={dictionary} metrics={metrics} user={user} />

      {/* Active Listings */}
      <Suspense fallback={<DashboardStatsLoading />}>
        <ActiveListings dictionary={dictionary} userId={dbUser.id} />
      </Suspense>

      {/* Active Purchases */}
      <Suspense fallback={<DashboardStatsLoading />}>
        <ActivePurchases dictionary={dictionary} userId={dbUser.id} />
      </Suspense>
    </div>
  );
}
