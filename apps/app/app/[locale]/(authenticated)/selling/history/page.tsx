import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { SalesHistoryContent } from './components/sales-history-content';
import { decimalToNumber } from '@repo/utils';

const title = 'Sales History';
const description = 'Track your sales performance and earnings';

export const metadata: Metadata = {
  title,
  description,
};

const SalesHistoryPage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get database user with just ID for performance
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true }
  });

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Fetch sales data for the seller
  const [salesData, recentOrders] = await Promise.all([
    // Get aggregated sales data
    database.order.aggregate({
      where: {
        sellerId: dbUser.id,
        status: 'DELIVERED',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),

    // Get recent orders with details
    database.order.findMany({
      where: {
        sellerId: dbUser.id,
      },
      include: {
        User_Order_buyerIdToUser: true,
        Product: {
          include: {
            images: {
              take: 1,
              orderBy: {
                displayOrder: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to recent orders
    }),
  ]);

  // Calculate monthly sales for the last 12 months (simplified for SQLite)
  const currentDate = new Date();
  const oneYearAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
  
  const monthlyOrders = await database.order.findMany({
    where: {
      sellerId: dbUser.id,
      status: 'DELIVERED',
      createdAt: {
        gte: oneYearAgo,
      },
    },
    select: {
      amount: true,
      createdAt: true,
    },
  });

  // Group by month manually
  const monthlyStats = monthlyOrders.reduce((acc, order) => {
    const month = order.createdAt.toISOString().substring(0, 7); // YYYY-MM format
    if (!acc[month]) {
      acc[month] = { month, total_sales: BigInt(0), order_count: BigInt(0) };
    }
    acc[month].total_sales += BigInt(Math.round(decimalToNumber(order.amount)));
    acc[month].order_count += BigInt(1);
    return acc;
  }, {} as Record<string, { month: string; total_sales: bigint; order_count: bigint }>);

  const monthlyStatsArray = Object.values(monthlyStats).sort((a, b) => b.month.localeCompare(a.month));

  // Get product performance data
  const topProducts = await database.order.groupBy({
    by: ['productId'],
    where: {
      sellerId: dbUser.id,
      status: 'DELIVERED',
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
    take: 10,
  });

  // Get product details for top performers
  const topProductsWithDetails = await database.product.findMany({
    where: {
      id: {
        in: topProducts.map(p => p.productId),
      },
    },
    include: {
      images: {
        take: 1,
        orderBy: {
          displayOrder: 'asc',
        },
      },
    },
  });

  // Combine top products with sales data
  const enrichedTopProducts = topProducts.map(productSales => {
    const productDetails = topProductsWithDetails.find(
      p => p.id === productSales.productId
    );
    return {
      ...productSales,
      product: productDetails,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales History & Analytics</h1>
        <p className="text-muted-foreground">
          Track your sales performance, earnings, and top-selling products
        </p>
      </div>
      
      <SalesHistoryContent 
        salesData={{
          _sum: { amount: decimalToNumber(salesData._sum?.amount) },
          _count: salesData._count || 0
        }}
        recentOrders={recentOrders.map(order => ({
          ...order,
          amount: decimalToNumber(order.amount),
          buyer: order.User_Order_buyerIdToUser,
          product: order.Product
        }))}
        monthlyStats={monthlyStatsArray}
        topProducts={enrichedTopProducts.map(product => ({
          ...product,
          _sum: { amount: decimalToNumber(product._sum?.amount) },
          product: product.product ? {
            ...product.product,
            price: decimalToNumber(product.product.price)
          } : undefined
        }))}
      />
    </div>
  );
};

export default SalesHistoryPage;