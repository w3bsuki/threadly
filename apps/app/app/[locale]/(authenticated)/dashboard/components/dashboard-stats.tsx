import { database } from '@repo/database';
import { logError } from '@repo/observability/server';
import { getCacheService } from '@repo/cache';
import type { Dictionary } from '@repo/internationalization';
import { getSellerDashboardStats, type DashboardStats } from '../../../../../lib/queries/dashboard-stats';

interface DashboardStatsProps {
  userId: string;
  dictionary: Dictionary;
}

async function getDashboardMetrics(userId: string): Promise<Partial<DashboardStats> & { unreadMessages: number }> {
  try {
    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!dbUser) {
      // Create user if doesn't exist
      const newUser = await database.user.create({
        data: {
          clerkId: userId,
          email: '', // Will be updated by webhook
          firstName: null,
          lastName: null,
        },
        select: { id: true }
      });
      
      // Return defaults for new user
      return {
        totalRevenue: 0,
        completedOrders: 0,
        totalOrders: 0,
        unreadMessages: 0,
      };
    }

    // Get optimized stats
    const stats = await getSellerDashboardStats(dbUser.id);
    
    // Get unread messages count
    const unreadMessages = await database.message.count({
      where: {
        recipientId: dbUser.id,
        read: false
      }
    });

    return {
      ...stats,
      unreadMessages,
    };
  } catch (error) {
    logError('Error fetching dashboard metrics', error);
    return {
      totalRevenue: 0,
      completedOrders: 0,
      totalOrders: 0,
      unreadMessages: 0,
    };
  }
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
            {metrics.completedOrders || 0}
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
            {metrics.totalOrders || 0}
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