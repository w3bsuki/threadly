import { cache } from '@repo/database';
import { database, OrderStatus } from '@repo/database';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  revenueGrowth: number;
  orderGrowth: number;
}

export async function getSellerDashboardStats(
  sellerId: string
): Promise<DashboardStats> {
  const cacheKey = `seller_dashboard_stats:${sellerId}`;

  return cache.remember(
    cacheKey,
    async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Use aggregation pipeline for efficient stats calculation
      const [currentStats, monthlyStats, lastMonthStats] = await Promise.all([
        // Overall stats
        database.order.aggregate({
          where: { sellerId },
          _sum: { amount: true },
          _count: true,
        }),

        // Current month stats
        database.order.aggregate({
          where: {
            sellerId,
            createdAt: { gte: startOfMonth },
          },
          _sum: { amount: true },
          _count: true,
        }),

        // Last month stats for growth calculation
        database.order.aggregate({
          where: {
            sellerId,
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
          },
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      // Status breakdown using groupBy
      const statusBreakdown = await database.order.groupBy({
        by: ['status'],
        where: { sellerId },
        _count: true,
      });

      const statusCounts = statusBreakdown.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>
      );

      const currentRevenue = Number(currentStats._sum.amount || 0);
      const monthlyRevenue = Number(monthlyStats._sum.amount || 0);
      const lastMonthRevenue = Number(lastMonthStats._sum.amount || 0);

      const monthlyOrders = monthlyStats._count;
      const lastMonthOrders = lastMonthStats._count;

      return {
        totalRevenue: currentRevenue,
        totalOrders: currentStats._count,
        pendingOrders: statusCounts[OrderStatus.PENDING] || 0,
        completedOrders: statusCounts[OrderStatus.DELIVERED] || 0,
        monthlyRevenue,
        monthlyOrders,
        revenueGrowth:
          lastMonthRevenue > 0
            ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0,
        orderGrowth:
          lastMonthOrders > 0
            ? ((monthlyOrders - lastMonthOrders) / lastMonthOrders) * 100
            : 0,
      };
    },
    cache.TTL.MEDIUM // 5 minute cache
  );
}

export async function getBuyerDashboardStats(userId: string) {
  const cacheKey = `buyer_dashboard_stats:${userId}`;

  return cache.remember(
    cacheKey,
    async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [orderStats, recentOrderStats, favoriteCount, cartCount] =
        await Promise.all([
          // Overall order stats
          database.order.aggregate({
            where: { buyerId: userId },
            _sum: { amount: true },
            _count: true,
          }),

          // Recent 30 days stats
          database.order.aggregate({
            where: {
              buyerId: userId,
              createdAt: { gte: thirtyDaysAgo },
            },
            _count: true,
          }),

          // Favorites count
          database.favorite.count({
            where: { userId },
          }),

          // Cart items count
          database.cartItem.count({
            where: { userId },
          }),
        ]);

      return {
        totalSpent: Number(orderStats._sum.amount || 0),
        totalOrders: orderStats._count,
        recentOrders: recentOrderStats._count,
        favoriteItems: favoriteCount,
        cartItems: cartCount,
      };
    },
    cache.TTL.MEDIUM
  );
}

export async function getProductStats(productId: string) {
  const cacheKey = `product_stats:${productId}`;

  return cache.remember(
    cacheKey,
    async () => {
      const [viewCount, favoriteCount, orderCount] = await Promise.all([
        // Get view count from product
        database.product.findUnique({
          where: { id: productId },
          select: { views: true },
        }),

        // Favorite count
        database.favorite.count({
          where: { productId },
        }),

        // Order count
        database.order.count({
          where: { productId },
        }),
      ]);

      return {
        views: viewCount?.views || 0,
        favorites: favoriteCount,
        orders: orderCount,
      };
    },
    cache.TTL.SHORT // 1 minute cache
  );
}
