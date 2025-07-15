import { database } from "@repo/database";
import { cache } from "@repo/cache";
import { OrderStatus } from "@repo/database";

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  averageOrderValue: number;
}

export async function getBuyerOrderStats(userId: string): Promise<OrderStats> {
  const cacheKey = `buyer_order_stats:${userId}`;
  
  return cache.remember(
    cacheKey,
    async () => {
      // Use groupBy for efficient status counting
      const statusCounts = await database.order.groupBy({
        by: ['status'],
        where: { buyerId: userId },
        _count: true,
        _sum: { amount: true }
      });

      const stats = statusCounts.reduce((acc, item) => {
        const count = item._count;
        const sum = Number(item._sum.amount || 0);
        
        acc.totalOrders += count;
        acc.totalSpent += sum;
        
        switch (item.status) {
          case OrderStatus.PENDING:
            acc.pendingOrders = count;
            break;
          case OrderStatus.SHIPPED:
            acc.shippedOrders = count;
            break;
          case OrderStatus.DELIVERED:
            acc.deliveredOrders = count;
            break;
          case OrderStatus.CANCELLED:
            acc.cancelledOrders = count;
            break;
        }
        
        return acc;
      }, {
        totalOrders: 0,
        pendingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0
      });

      stats.averageOrderValue = stats.totalOrders > 0 
        ? stats.totalSpent / stats.totalOrders 
        : 0;

      return stats;
    },
    cache.TTL.MEDIUM
  );
}

export async function getOrderHistory(
  userId: string,
  page: number = 1,
  limit: number = 10,
  status?: OrderStatus
) {
  const cacheKey = `order_history:${userId}:${page}:${limit}:${status || 'all'}`;
  
  return cache.remember(
    cacheKey,
    async () => {
      const where = {
        buyerId: userId,
        ...(status && { status })
      };

      const [orders, total] = await Promise.all([
        database.order.findMany({
          where,
          include: {
            Product: {
              select: {
                id: true,
                title: true,
                images: {
                  select: { imageUrl: true },
                  orderBy: { displayOrder: 'asc' },
                  take: 1
                }
              }
            },
            User_Order_sellerIdToUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            Payment: {
              select: {
                status: true
              }
            },
            Review: {
              select: {
                id: true,
                rating: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        database.order.count({ where })
      ]);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    },
    cache.TTL.SHORT
  );
}

export async function getSellerOrderStats(sellerId: string) {
  const cacheKey = `seller_order_stats:${sellerId}`;
  
  return cache.remember(
    cacheKey,
    async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [statusCounts, recentOrders] = await Promise.all([
        // Get order counts by status
        database.order.groupBy({
          by: ['status'],
          where: { sellerId },
          _count: true,
          _sum: { amount: true }
        }),
        
        // Get recent order trends
        database.order.groupBy({
          by: ['status'],
          where: {
            sellerId,
            createdAt: { gte: thirtyDaysAgo }
          },
          _count: true
        })
      ]);

      const stats = statusCounts.reduce((acc, item) => {
        acc[item.status.toLowerCase()] = {
          count: item._count,
          revenue: Number(item._sum.amount || 0)
        };
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);

      const recentStats = recentOrders.reduce((acc, item) => {
        acc[item.status.toLowerCase()] = item._count;
        return acc;
      }, {} as Record<string, number>);

      return {
        all: stats,
        recent: recentStats,
        pendingCount: stats.pending?.count || 0,
        toShipCount: stats.pending?.count || 0,
        shippedCount: stats.shipped?.count || 0,
        completedCount: stats.delivered?.count || 0
      };
    },
    cache.TTL.MEDIUM
  );
}