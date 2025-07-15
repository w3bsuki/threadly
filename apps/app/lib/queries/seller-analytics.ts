import { database } from "@repo/database";
import { cache } from "@repo/cache";
import { ProductStatus } from "@repo/database";

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  productCount: number;
  totalViews: number;
  totalSales: number;
  revenue: number;
}

export interface TopProduct {
  id: string;
  title: string;
  imageUrl: string | null;
  views: number;
  sales: number;
  revenue: number;
}

export interface SellerAnalytics {
  totalProducts: number;
  activeProducts: number;
  totalViews: number;
  totalSales: number;
  conversionRate: number;
  averageOrderValue: number;
  categoryBreakdown: CategoryBreakdown[];
  topProducts: TopProduct[];
  viewsOverTime: Array<{ date: string; views: number }>;
  salesOverTime: Array<{ date: string; sales: number; revenue: number }>;
}

export async function getSellerAnalytics(
  sellerId: string,
  startDate: Date,
  endDate: Date
): Promise<SellerAnalytics> {
  const cacheKey = `seller_analytics:${sellerId}:${startDate.toISOString()}:${endDate.toISOString()}`;
  
  return cache.remember(
    cacheKey,
    async () => {
      // Get basic product stats
      const [productStats, activeProductCount] = await Promise.all([
        database.product.aggregate({
          where: { sellerId },
          _count: true,
          _sum: { views: true }
        }),
        database.product.count({
          where: { 
            sellerId,
            status: ProductStatus.AVAILABLE
          }
        })
      ]);

      // Get sales stats
      const salesStats = await database.order.aggregate({
        where: {
          sellerId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: true,
        _sum: { amount: true }
      });

      // Get category breakdown with proper batching
      const categoryData = await database.$queryRaw<CategoryBreakdown[]>`
        SELECT 
          c.id as "categoryId",
          c.name as "categoryName",
          COUNT(DISTINCT p.id) as "productCount",
          COALESCE(SUM(p.views), 0) as "totalViews",
          COUNT(DISTINCT o.id) as "totalSales",
          COALESCE(SUM(o.amount), 0) as "revenue"
        FROM "Category" c
        INNER JOIN "Product" p ON p."categoryId" = c.id
        LEFT JOIN "Order" o ON o."productId" = p.id 
          AND o."createdAt" >= ${startDate}
          AND o."createdAt" <= ${endDate}
        WHERE p."sellerId" = ${sellerId}
        GROUP BY c.id, c.name
        ORDER BY "revenue" DESC
      `;

      // Get top products efficiently
      const topProducts = await database.$queryRaw<TopProduct[]>`
        SELECT 
          p.id,
          p.title,
          pi."imageUrl",
          p.views,
          COUNT(DISTINCT o.id) as sales,
          COALESCE(SUM(o.amount), 0) as revenue
        FROM "Product" p
        LEFT JOIN "Order" o ON o."productId" = p.id
          AND o."createdAt" >= ${startDate}
          AND o."createdAt" <= ${endDate}
        LEFT JOIN LATERAL (
          SELECT "imageUrl" 
          FROM "ProductImage" 
          WHERE "productId" = p.id 
          ORDER BY "displayOrder" 
          LIMIT 1
        ) pi ON true
        WHERE p."sellerId" = ${sellerId}
        GROUP BY p.id, p.title, p.views, pi."imageUrl"
        ORDER BY revenue DESC
        LIMIT 10
      `;

      // Get views over time (daily aggregation)
      const viewsOverTime = await database.$queryRaw<Array<{ date: string; views: number }>>`
        SELECT 
          DATE(ua."createdAt") as date,
          COUNT(*) as views
        FROM "UserInteraction" ua
        INNER JOIN "Product" p ON p.id = ua."productId"
        WHERE p."sellerId" = ${sellerId}
          AND ua.type = 'VIEW'
          AND ua."createdAt" >= ${startDate}
          AND ua."createdAt" <= ${endDate}
        GROUP BY DATE(ua."createdAt")
        ORDER BY date
      `;

      // Get sales over time (daily aggregation)
      const salesOverTime = await database.$queryRaw<Array<{ date: string; sales: number; revenue: number }>>`
        SELECT 
          DATE(o."createdAt") as date,
          COUNT(*) as sales,
          SUM(o.amount) as revenue
        FROM "Order" o
        WHERE o."sellerId" = ${sellerId}
          AND o."createdAt" >= ${startDate}
          AND o."createdAt" <= ${endDate}
        GROUP BY DATE(o."createdAt")
        ORDER BY date
      `;

      const totalViews = Number(productStats._sum.views || 0);
      const totalSales = salesStats._count;
      const totalRevenue = Number(salesStats._sum.amount || 0);
      const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      return {
        totalProducts: productStats._count,
        activeProducts: activeProductCount,
        totalViews,
        totalSales,
        conversionRate,
        averageOrderValue,
        categoryBreakdown: categoryData.map(cat => ({
          ...cat,
          productCount: Number(cat.productCount),
          totalViews: Number(cat.totalViews),
          totalSales: Number(cat.totalSales),
          revenue: Number(cat.revenue)
        })),
        topProducts: topProducts.map(prod => ({
          ...prod,
          sales: Number(prod.sales),
          revenue: Number(prod.revenue)
        })),
        viewsOverTime: viewsOverTime.map(v => ({
          date: v.date.toString(),
          views: Number(v.views)
        })),
        salesOverTime: salesOverTime.map(s => ({
          date: s.date.toString(),
          sales: Number(s.sales),
          revenue: Number(s.revenue)
        }))
      };
    },
    cache.TTL.LONG // 30 minute cache
  );
}

export async function getProductAnalytics(productId: string) {
  const cacheKey = `product_analytics:${productId}`;
  
  return cache.remember(
    cacheKey,
    async () => {
      // Use existing ProductAnalytics model if available
      const analytics = await database.productAnalytics.findUnique({
        where: { productId }
      });

      if (analytics && 
          analytics.updatedAt.getTime() > Date.now() - cache.TTL.MEDIUM) {
        return analytics;
      }

      // Calculate fresh analytics
      const [interactions, orderStats, favoriteCount] = await Promise.all([
        // Get interaction breakdown
        database.userInteraction.groupBy({
          by: ['type'],
          where: { productId },
          _count: true
        }),
        
        // Get order stats
        database.order.aggregate({
          where: { productId },
          _count: true,
          _sum: { amount: true }
        }),
        
        // Get favorite count
        database.favorite.count({
          where: { productId }
        })
      ]);

      const interactionCounts = interactions.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>);

      const analyticsData = {
        productId,
        totalViews: interactionCounts.VIEW || 0,
        uniqueViews: interactionCounts.VIEW || 0, // Would need session tracking for true unique
        cartAdds: interactionCounts.CART_ADD || 0,
        favoriteCount,
        salesCount: orderStats._count,
        revenue: Number(orderStats._sum.amount || 0),
        conversionRate: interactionCounts.VIEW > 0 
          ? (orderStats._count / interactionCounts.VIEW) * 100 
          : 0,
        updatedAt: new Date()
      };

      // Update or create analytics record
      await database.productAnalytics.upsert({
        where: { productId },
        create: analyticsData,
        update: analyticsData
      });

      return analyticsData;
    },
    cache.TTL.SHORT
  );
}