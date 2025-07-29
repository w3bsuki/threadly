import { CACHE_KEYS, getCacheService } from '@repo/cache';
import { database } from '@repo/database';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';

const AdminDashboard: React.FC = async () => {
  const cache = getCacheService();

  // Get cached admin statistics
  const adminData = await cache.remember(
    CACHE_KEYS.ADMIN_STATS,
    async () => {
      const [
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        activeProducts,
        pendingReports,
        recentOrders,
        topSellers,
      ] = await Promise.all([
        database.user.count(),
        database.product.count(),
        database.order.count(),
        database.order.aggregate({
          _sum: { amount: true },
          where: { status: 'PAID' },
        }),
        database.product.count({ where: { status: 'AVAILABLE' } }),
        database.product.count({ where: { status: 'REMOVED' } }), // Assuming removed = reported
        database.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            buyer: {
              select: { firstName: true, lastName: true },
            },
            Product: { select: { title: true, price: true } },
          },
        }),
        database.user.findMany({
          take: 5,
          orderBy: { totalSales: 'desc' },
          where: { totalSales: { gt: 0 } },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            totalSales: true,
            imageUrl: true,
          },
        }),
      ]);

      return {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        activeProducts,
        pendingReports,
        recentOrders,
        topSellers,
      };
    },
    5 * 60, // 5 minutes TTL
    ['users', 'products', 'orders']
  );

  const {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    activeProducts,
    pendingReports,
    recentOrders,
    topSellers,
  } = adminData;

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: Users,
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Total Products',
      value: totalProducts.toLocaleString(),
      icon: Package,
      change: '+8%',
      changeType: 'positive',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: '+23%',
      changeType: 'positive',
    },
    {
      title: 'Total Revenue',
      value: `$${(totalRevenue._sum?.amount || 0).toFixed(2)}`,
      icon: DollarSign,
      change: '+15%',
      changeType: 'positive',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor and manage your marketplace
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-medium text-muted-foreground text-sm">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{stat.value}</div>
              <p
                className={`mt-1 text-xs ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change} from last month
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between rounded-[var(--radius-lg)] border p-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">Pending Reports</p>
                  <p className="text-muted-foreground text-sm">
                    {pendingReports} items need review
                  </p>
                </div>
              </div>
              <a
                className="text-primary text-sm hover:underline"
                href="/admin/reports"
              >
                Review
              </a>
            </div>

            <div className="flex items-center justify-between rounded-[var(--radius-lg)] border p-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Active Listings</p>
                  <p className="text-muted-foreground text-sm">
                    {activeProducts} products available
                  </p>
                </div>
              </div>
              <a
                className="text-primary text-sm hover:underline"
                href="/admin/products"
              >
                Manage
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  className="flex items-center justify-between text-sm"
                  key={order.id}
                >
                  <div>
                    <p className="font-medium">{order.Product.title}</p>
                    <p className="text-muted-foreground">
                      {order.buyer.firstName}{' '}
                      {order.buyer.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${order.amount.toFixed()}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Sellers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Sellers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topSellers.map((seller, index) => (
              <div
                className="flex items-center justify-between"
                key={seller.id}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-muted-foreground text-sm">
                    #{index + 1}
                  </span>
                  {seller.imageUrl ? (
                    <img
                      alt={`${seller.firstName} ${seller.lastName}`}
                      className="h-8 w-8 rounded-[var(--radius-full)] object-cover"
                      src={seller.imageUrl}
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-full)] bg-muted">
                      <Users className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {seller.firstName} {seller.lastName}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {seller.totalSales} sales
                    </p>
                  </div>
                </div>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
