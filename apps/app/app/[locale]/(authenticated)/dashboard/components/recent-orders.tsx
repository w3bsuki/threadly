import Link from 'next/link';
import Image from 'next/image';
import { database } from '@repo/database';
import { logError } from '@repo/observability/server';
import { decimalToNumber } from '@repo/utils';
import { getCacheService } from '@repo/cache';
import type { Dictionary } from '@repo/internationalization';

interface RecentOrdersProps {
  userId: string;
  dictionary: Dictionary;
}

interface OrderWithProduct {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  Product: {
    id: string;
    title: string;
    images: Array<{
      imageUrl: string;
    }>;
  };
}

async function getRecentOrders(userId: string): Promise<OrderWithProduct[]> {
  const cache = getCacheService();
  const cacheKey = `dashboard:recent-orders:${userId}`;
  
  return await cache.remember(
    cacheKey,
    async () => {
      try {
        // Get database user
        const dbUser = await database.user.findUnique({
          where: { clerkId: userId },
          select: { id: true }
        });

        if (!dbUser) {
          return [];
        }

        // Optimized query for recent orders
        const orders = await database.order.findMany({
          where: {
            buyerId: dbUser.id
          },
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            Product: {
              select: {
                id: true,
                title: true,
                images: {
                  take: 1,
                  orderBy: { displayOrder: 'asc' },
                  select: {
                    imageUrl: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 3
        });

        // Serialize data for client
        return orders.map(order => ({
          ...order,
          amount: order.amount ? decimalToNumber(order.amount) : 0,
          createdAt: order.createdAt.toISOString(),
        }));
      } catch (error) {
        logError('Error fetching recent orders', error);
        return [];
      }
    },
    180 // Cache for 3 minutes
  );
}

export async function RecentOrders({ userId, dictionary }: RecentOrdersProps) {
  const orders = await getRecentOrders(userId);

  if (orders.length === 0) {
    return (
      <div className="border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {dictionary.dashboard.dashboard.recentOrders.title}
        </h2>
        <p className="text-muted-foreground text-center py-8">
          {dictionary.dashboard.dashboard.recentOrders.noOrdersDescription || 'No recent orders found'}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {dictionary.dashboard.dashboard.recentOrders.title}
        </h2>
        <Link
          href="/buying/orders"
          className="text-sm text-primary hover:underline"
        >
          {dictionary.dashboard.dashboard.recentOrders.viewAllOrders || 'View all'}
        </Link>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center space-x-4">
            <div className="relative h-12 w-12 rounded-lg overflow-hidden">
              {order.Product.images[0]?.imageUrl ? (
                <Image
                  src={order.Product.images[0].imageUrl}
                  alt={order.Product.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">No Image</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <Link
                href={`/product/${order.Product.id}`}
                className="font-medium text-foreground hover:underline truncate block"
              >
                {order.Product.title}
              </Link>
              <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-right">
              <p className="font-medium text-foreground">
                ${order.amount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                {order.status.toLowerCase()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}