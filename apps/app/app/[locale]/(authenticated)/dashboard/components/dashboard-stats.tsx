import { database } from '@repo/database';
import { logError } from '@repo/observability/server';
import { decimalToNumber } from '@repo/utils';
import { getCacheService } from '@repo/cache';
import type { Dictionary } from '@repo/internationalization';
import type { Prisma } from '@repo/database';

interface DashboardStatsProps {
  userId: string;
  dictionary: Dictionary;
}

interface DashboardMetrics {
  activeListings: number;
  totalRevenue: number;
  completedSales: number;
  unreadMessages: number;
}

async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const cache = getCacheService();
  const cacheKey = `dashboard:metrics:${userId}`;
  
  return await cache.remember(
    cacheKey,
    async () => {
      // Get or create database user
      let dbUser;
      try {
        dbUser = await database.user.findUnique({
          where: { clerkId: userId },
          select: { id: true }
        });

        if (!dbUser) {
          // Create user if doesn't exist
          dbUser = await database.user.create({
            data: {
              clerkId: userId,
              email: '', // Will be updated by webhook
              firstName: null,
              lastName: null,
            },
            select: { id: true }
          });
        }
      } catch (error) {
        logError('Database error during user creation/lookup', error);
        // Return default values on error
        return {
          activeListings: 0,
          totalRevenue: 0,
          completedSales: 0,
          unreadMessages: 0,
        };
      }

      // Define types for the query results
      type OrderAggregateResult = Prisma.GetOrderAggregateType<{
        _sum: { amount: true };
        _count: true;
      }>;

      let activeListings = 0;
      let totalSales: OrderAggregateResult = { _sum: { amount: null }, _count: 0 };
      let unreadMessages = 0;

      try {
        // Optimized parallel queries
        [activeListings, totalSales, unreadMessages] = await Promise.all([
          database.product.count({
            where: {
              sellerId: dbUser.id,
              status: 'AVAILABLE'
            }
          }),
          database.order.aggregate({
            where: {
              sellerId: dbUser.id,
              status: 'DELIVERED'
            },
            _sum: { amount: true },
            _count: true
          }),
          // TODO: Implement unread messages count
          Promise.resolve(0)
        ]);
      } catch (error) {
        logError('Error fetching dashboard metrics', error);
        // Return defaults on error
        return {
          activeListings: 0,
          totalRevenue: 0,
          completedSales: 0,
          unreadMessages: 0,
        };
      }

      return {
        activeListings,
        totalRevenue: decimalToNumber(totalSales?._sum?.amount),
        completedSales: totalSales?._count || 0,
        unreadMessages,
      };
    },
    300 // Cache for 5 minutes
  );
}

export async function DashboardStats({ userId, dictionary }: DashboardStatsProps) {
  const metrics = await getDashboardMetrics(userId);
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {dictionary.dashboard.dashboard.metrics.totalRevenue}
          </p>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold text-foreground">
            ${metrics.totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {dictionary.dashboard.dashboard.metrics.completedSales}
          </p>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold text-foreground">
            {metrics.completedSales}
          </p>
        </div>
      </div>

      <div className="border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {dictionary.dashboard.dashboard.metrics.activeListings}
          </p>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold text-foreground">
            {metrics.activeListings}
          </p>
        </div>
      </div>

      <div className="border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {dictionary.dashboard.dashboard.metrics.unreadMessages}
          </p>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold text-foreground">
            {metrics.unreadMessages}
          </p>
        </div>
      </div>
    </div>
  );
}