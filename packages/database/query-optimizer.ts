import { database } from './index';
import type { Prisma, Condition } from './generated/client';

export class DatabaseOptimizer {
  // Optimized product queries
  static async getProductsWithCaching(options: {
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput[];
    take?: number;
    skip?: number;
    include?: Prisma.ProductInclude;
  }) {
    const { where, orderBy, take, skip, include } = options;

    return database.product.findMany({
      where,
      orderBy,
      take,
      skip,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
          take: 1,
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            location: true,
            averageRating: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
        ...include,
      },
    });
  }

  // Optimized trending products query
  static async getTrendingProducts(limit = 6) {
    return this.getProductsWithCaching({
      where: {
        status: 'AVAILABLE',
      },
      orderBy: [
        { views: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });
  }

  // Optimized new arrivals query
  static async getNewArrivals(limit = 8) {
    return this.getProductsWithCaching({
      where: {
        status: 'AVAILABLE',
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
      take: limit,
    });
  }

  // Optimized category products query
  static async getProductsByCategory(categoryId: string, options: {
    limit?: number;
    skip?: number;
    sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'most_viewed';
  } = {}) {
    const { limit = 20, skip = 0, sortBy = 'newest' } = options;

    const orderBy: Prisma.ProductOrderByWithRelationInput[] = (() => {
      switch (sortBy) {
        case 'oldest':
          return [{ createdAt: 'asc' }];
        case 'price_low':
          return [{ price: 'asc' }];
        case 'price_high':
          return [{ price: 'desc' }];
        case 'most_viewed':
          return [{ views: 'desc' }, { createdAt: 'desc' }];
        default:
          return [{ createdAt: 'desc' }];
      }
    })();

    return this.getProductsWithCaching({
      where: {
        categoryId,
        status: 'AVAILABLE',
      },
      orderBy,
      take: limit,
      skip,
    });
  }

  // Optimized search query
  static async searchProducts(query: string, options: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: Condition;
    limit?: number;
    skip?: number;
  } = {}) {
    const { categoryId, minPrice, maxPrice, condition, limit = 20, skip = 0 } = options;

    const where: Prisma.ProductWhereInput = {
      status: 'AVAILABLE',
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { brand: { contains: query } },
      ],
      ...(categoryId && { categoryId }),
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { lte: maxPrice } }),
      ...(condition && { condition }),
    };

    return this.getProductsWithCaching({
      where,
      orderBy: [
        { views: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip,
    });
  }

  // Optimized user conversations query
  static async getUserConversations(userId: string, type?: 'buying' | 'selling') {
    const where: Prisma.ConversationWhereInput = type === 'buying'
      ? { buyerId: userId }
      : type === 'selling'
      ? { sellerId: userId }
      : {
          OR: [
            { buyerId: userId },
            { sellerId: userId },
          ],
        };

    return database.conversation.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        product: {
          include: {
            images: {
              orderBy: { displayOrder: 'asc' },
              take: 1,
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                read: false,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Optimized user orders query
  static async getUserOrders(userId: string, type: 'buying' | 'selling') {
    const where: Prisma.OrderWhereInput = type === 'buying'
      ? { buyerId: userId }
      : { sellerId: userId };

    return database.order.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        product: {
          include: {
            images: {
              orderBy: { displayOrder: 'asc' },
              take: 1,
            },
          },
        },
        payment: true,
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Optimized user notifications query
  static async getUserNotifications(userId: string, limit = 20, unreadOnly = false) {
    return database.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Analytics and reporting queries
  static async getUserStats(userId: string) {
    const [
      totalListings,
      totalSales,
      totalPurchases,
      totalRevenue,
      averageRating,
    ] = await Promise.all([
      database.product.count({
        where: { sellerId: userId },
      }),
      database.order.count({
        where: { sellerId: userId, status: 'DELIVERED' },
      }),
      database.order.count({
        where: { buyerId: userId, status: 'DELIVERED' },
      }),
      database.order.aggregate({
        where: { sellerId: userId, status: 'DELIVERED' },
        _sum: { amount: true },
      }),
      database.review.aggregate({
        where: { reviewedId: userId },
        _avg: { rating: true },
      }),
    ]);

    return {
      totalListings,
      totalSales,
      totalPurchases,
      totalRevenue: totalRevenue._sum.amount || 0,
      averageRating: averageRating._avg.rating || 0,
    };
  }

  // Database health and performance queries
  static async getDatabaseStats() {
    const [
      totalProducts,
      totalUsers,
      totalOrders,
      totalConversations,
      totalMessages,
    ] = await Promise.all([
      database.product.count(),
      database.user.count(),
      database.order.count(),
      database.conversation.count(),
      database.message.count(),
    ]);

    return {
      totalProducts,
      totalUsers,
      totalOrders,
      totalConversations,
      totalMessages,
    };
  }
}

export { DatabaseOptimizer as db };