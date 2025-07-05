import { database } from '@repo/database';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { 
  Users, 
  Package, 
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default async function AdminDashboard() {
  // Get stats
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    activeProducts,
    pendingReports,
    recentOrders,
    topSellers
  ] = await Promise.all([
    database.user.count(),
    database.product.count(),
    database.order.count(),
    database.order.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' }
    }),
    database.product.count({ where: { status: 'AVAILABLE' } }),
    database.product.count({ where: { status: 'REMOVED' } }), // Assuming removed = reported
    database.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { firstName: true, lastName: true } },
        product: { select: { title: true, price: true } }
      }
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
        imageUrl: true
      }
    })
  ]);

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: Users,
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Products',
      value: totalProducts.toLocaleString(),
      icon: Package,
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: '+23%',
      changeType: 'positive'
    },
    {
      title: 'Total Revenue',
      value: `$${(totalRevenue._sum?.amount || 0).toFixed(2)}`,
      icon: DollarSign,
      change: '+15%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage your marketplace
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs mt-1 ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change} from last month
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">Pending Reports</p>
                  <p className="text-sm text-muted-foreground">
                    {pendingReports} items need review
                  </p>
                </div>
              </div>
              <a href="/admin/reports" className="text-sm text-primary hover:underline">
                Review
              </a>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Active Listings</p>
                  <p className="text-sm text-muted-foreground">
                    {activeProducts} products available
                  </p>
                </div>
              </div>
              <a href="/admin/products" className="text-sm text-primary hover:underline">
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
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{order.product.title}</p>
                    <p className="text-muted-foreground">
                      {order.buyer.firstName} {order.buyer.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.product.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
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
              <div key={seller.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  {seller.imageUrl ? (
                    <img 
                      src={seller.imageUrl} 
                      alt={`${seller.firstName} ${seller.lastName}`}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {seller.firstName} {seller.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
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
}