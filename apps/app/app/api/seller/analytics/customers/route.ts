import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { ensureUserExists } from '@repo/auth/sync';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await ensureUserExists();
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get seller's products for filtering
    const sellerProducts = await database.product.findMany({
      where: { sellerId: dbUser.id },
      select: { id: true }
    });

    const productIds = sellerProducts.map(p => p.id);

    if (productIds.length === 0) {
      return NextResponse.json({
        overview: {
          totalCustomers: 0,
          returningCustomers: 0,
          averageOrderValue: 0,
          customerLifetimeValue: 0,
          totalInteractions: 0,
          favoritesCount: 0,
        },
        segments: [],
        purchasePatterns: [],
        topCustomers: [],
        behaviorInsights: {
          topCategories: [],
          avgTimeToPurchase: 0,
          conversionRate: 0,
          repeatPurchaseRate: 0,
        }
      });
    }

    // Get customer data from orders
    const orders = await database.order.findMany({
      where: {
        productId: { in: productIds },
        createdAt: { gte: startDate }
      },
      include: {
        User_Order_buyerIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // TODO: Add UserInteraction model to database schema
    const interactions: any[] = [];

    // Get favorites
    const favorites = await database.favorite.findMany({
      where: {
        productId: { in: productIds },
        createdAt: { gte: startDate }
      }
    });

    // Calculate overview metrics
    const uniqueCustomers = new Set(orders.map(o => o.buyerId));
    const totalCustomers = uniqueCustomers.size;
    
    const customerOrderCounts = new Map<string, number>();
    orders.forEach(order => {
      const current = customerOrderCounts.get(order.buyerId) || 0;
      customerOrderCounts.set(order.buyerId, current + 1);
    });
    
    const returningCustomers = Array.from(customerOrderCounts.values()).filter(count => count > 1).length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.amount), 0);
    const averageOrderValue = totalCustomers > 0 ? totalRevenue / orders.length : 0;
    const customerLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    // Customer segmentation based on spending
    const customerSpending = new Map<string, number>();
    orders.forEach(order => {
      const current = customerSpending.get(order.buyerId) || 0;
      customerSpending.set(order.buyerId, current + Number(order.amount));
    });

    const spendingAmounts = Array.from(customerSpending.values());
    const avgSpending = spendingAmounts.reduce((sum, amount) => sum + amount, 0) / spendingAmounts.length || 0;

    const segments = [
      {
        name: 'High Spenders',
        count: spendingAmounts.filter(amount => amount > avgSpending * 2).length,
        percentage: 0,
        avgSpend: spendingAmounts.filter(amount => amount > avgSpending * 2).reduce((sum, amount) => sum + amount, 0) / Math.max(1, spendingAmounts.filter(amount => amount > avgSpending * 2).length),
        color: '#10b981'
      },
      {
        name: 'Medium Spenders',
        count: spendingAmounts.filter(amount => amount > avgSpending && amount <= avgSpending * 2).length,
        percentage: 0,
        avgSpend: spendingAmounts.filter(amount => amount > avgSpending && amount <= avgSpending * 2).reduce((sum, amount) => sum + amount, 0) / Math.max(1, spendingAmounts.filter(amount => amount > avgSpending && amount <= avgSpending * 2).length),
        color: '#3b82f6'
      },
      {
        name: 'Low Spenders',
        count: spendingAmounts.filter(amount => amount <= avgSpending).length,
        percentage: 0,
        avgSpend: spendingAmounts.filter(amount => amount <= avgSpending).reduce((sum, amount) => sum + amount, 0) / Math.max(1, spendingAmounts.filter(amount => amount <= avgSpending).length),
        color: '#f59e0b'
      }
    ];

    // Calculate percentages
    segments.forEach(segment => {
      segment.percentage = totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0;
    });

    // Purchase patterns (weekly data)
    const purchasePatterns = [];
    const weeks = Math.ceil((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    for (let i = 0; i < Math.min(weeks, 12); i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekOrders = orders.filter(order => 
        order.createdAt >= weekStart && order.createdAt < weekEnd
      );
      
      const weekCustomers = new Set(weekOrders.map(o => o.buyerId));
      const newCustomers = weekOrders.filter(order => {
        const customerFirstOrder = orders
          .filter(o => o.buyerId === order.buyerId)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
        return customerFirstOrder?.id === order.id;
      }).length;
      
      const returningCustomersWeek = weekCustomers.size - newCustomers;
      const weekRevenue = weekOrders.reduce((sum, order) => sum + Number(order.amount), 0);
      
      purchasePatterns.unshift({
        period: `Week ${i + 1}`,
        newCustomers,
        returningCustomers: returningCustomersWeek,
        totalRevenue: weekRevenue
      });
    }

    // Top customers by lifetime value
    const topCustomers = Array.from(customerSpending.entries())
      .map(([buyerId, totalSpent]) => {
        const customer = orders.find(o => o.buyerId === buyerId)?.User_Order_buyerIdToUser;
        const customerOrders = orders.filter(o => o.buyerId === buyerId);
        const lastPurchase = Math.max(...customerOrders.map(o => o.createdAt.getTime()));
        
        return {
          id: buyerId,
          name: customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email : 'Unknown',
          totalSpent,
          ordersCount: customerOrders.length,
          lastPurchase: new Date(lastPurchase).toISOString(),
          lifetimeValue: totalSpent
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 20);

    // Behavior insights
    const categoryInteractions = new Map<string, number>();
    interactions.forEach(interaction => {
      const categoryName = interaction.product.category.name;
      const current = categoryInteractions.get(categoryName) || 0;
      categoryInteractions.set(categoryName, current + 1);
    });

    const topCategories = Array.from(categoryInteractions.entries())
      .map(([name, interactions]) => ({ name, interactions }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 10);

    // Calculate time to purchase (simplified)
    const avgTimeToPurchase = 72; // 3 days average (simplified calculation)
    
    const uniqueVisitors = new Set(interactions.map(i => i.userId));
    const conversionRate = uniqueVisitors.size > 0 ? totalCustomers / uniqueVisitors.size : 0;
    const repeatPurchaseRate = totalCustomers > 0 ? returningCustomers / totalCustomers : 0;

    return NextResponse.json({
      overview: {
        totalCustomers,
        returningCustomers,
        averageOrderValue,
        customerLifetimeValue,
        totalInteractions: interactions.length,
        favoritesCount: favorites.length,
      },
      segments,
      purchasePatterns,
      topCustomers,
      behaviorInsights: {
        topCategories,
        avgTimeToPurchase,
        conversionRate,
        repeatPurchaseRate,
      }
    });

  } catch (error) {
    console.error('Customer analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}