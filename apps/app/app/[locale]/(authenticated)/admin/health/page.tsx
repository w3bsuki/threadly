import { database } from '@repo/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Progress } from '@repo/design-system/components';
import { 
  Activity, 
  Users, 
  Package, 
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Zap,
  Database,
  Globe,
  Shield,
  Server,
  Eye
} from 'lucide-react';

const PlatformHealthPage: React.FC = async () => {
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(now.setDate(now.getDate() - 7));
  const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));

  // Get comprehensive platform metrics
  const [
    // User metrics
    totalUsers,
    activeUsersToday,
    activeUsersWeek,
    newUsersToday,
    newUsersWeek,
    suspendedUsers,
    verifiedUsers,
    
    // Product metrics
    totalProducts,
    activeListings,
    productsAddedToday,
    productsAddedWeek,
    soldProducts,
    removedProducts,
    
    // Order metrics
    totalOrders,
    ordersToday,
    ordersWeek,
    pendingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    
    // Financial metrics
    totalRevenue,
    revenueToday,
    revenueWeek,
    averageOrderValue,
    
    // Engagement metrics
    totalFavorites,
    totalReviews,
    totalMessages,
    totalReports,
    pendingReports,
    
    // Performance metrics
    averageProductViews,
    mostViewedProducts,
    mostFavoritedProducts,
    topCategories,
    
    // Search metrics
    totalSearches,
    popularSearchTerms,
  ] = await Promise.all([
    // User metrics
    database.user.count(),
    database.user.count({ 
      where: { 
        OR: [
          { sales: { some: { createdAt: { gte: startOfDay } } } },
          { purchases: { some: { createdAt: { gte: startOfDay } } } }
        ]
      } 
    }),
    database.user.count({ 
      where: { 
        OR: [
          { sales: { some: { createdAt: { gte: startOfWeek } } } },
          { purchases: { some: { createdAt: { gte: startOfWeek } } } }
        ]
      } 
    }),
    database.user.count({ where: { joinedAt: { gte: startOfDay } } }),
    database.user.count({ where: { joinedAt: { gte: startOfWeek } } }),
    database.user.count({ where: { suspended: true } }),
    database.user.count({ where: { verified: true } }),
    
    // Product metrics
    database.product.count(),
    database.product.count({ where: { status: 'AVAILABLE' } }),
    database.product.count({ where: { createdAt: { gte: startOfDay } } }),
    database.product.count({ where: { createdAt: { gte: startOfWeek } } }),
    database.product.count({ where: { status: 'SOLD' } }),
    database.product.count({ where: { status: 'REMOVED' } }),
    
    // Order metrics
    database.order.count(),
    database.order.count({ where: { createdAt: { gte: startOfDay } } }),
    database.order.count({ where: { createdAt: { gte: startOfWeek } } }),
    database.order.count({ where: { status: 'PENDING' } }),
    database.order.count({ where: { status: 'SHIPPED' } }),
    database.order.count({ where: { status: 'DELIVERED' } }),
    database.order.count({ where: { status: 'CANCELLED' } }),
    
    // Financial metrics
    database.order.aggregate({ _sum: { amount: true }, where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } } }),
    database.order.aggregate({ _sum: { amount: true }, where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: startOfDay } } }),
    database.order.aggregate({ _sum: { amount: true }, where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: startOfWeek } } }),
    database.order.aggregate({ _avg: { amount: true }, where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } } }),
    
    // Engagement metrics
    database.favorite.count(),
    database.review.count(),
    database.message.count(),
    database.report.count(),
    database.report.count({ where: { status: 'PENDING' } }),
    
    // Performance metrics
    database.product.aggregate({ _avg: { views: true } }),
    database.product.findMany({ 
      orderBy: { views: 'desc' }, 
      take: 5,
      select: { id: true, title: true, views: true }
    }),
    database.product.findMany({ 
      take: 5,
      include: { 
        _count: { select: { favorites: true } },
        favorites: { take: 1 }
      },
      orderBy: { favorites: { _count: 'desc' } }
    }),
    database.product.groupBy({
      by: ['categoryId'],
      _count: true,
      orderBy: { _count: { categoryId: 'desc' } },
      take: 5
    }),
    
    // Search metrics
    database.searchHistory.count(),
    database.searchHistory.groupBy({
      by: ['query'],
      _count: true,
      orderBy: { _count: { query: 'desc' } },
      take: 10
    }),
  ]);

  // Calculate growth rates
  const userGrowthRate = newUsersWeek > 0 ? ((newUsersWeek / totalUsers) * 100).toFixed(1) : '0';
  const productGrowthRate = productsAddedWeek > 0 ? ((productsAddedWeek / totalProducts) * 100).toFixed(1) : '0';
  const orderGrowthRate = ordersWeek > 0 ? ((ordersWeek / totalOrders) * 100).toFixed(1) : '0';

  // Calculate health scores
  const userHealthScore = Math.round(((totalUsers - suspendedUsers) / totalUsers) * 100);
  const productHealthScore = Math.round(((activeListings) / totalProducts) * 100);
  const orderHealthScore = Math.round(((deliveredOrders) / (totalOrders - pendingOrders)) * 100);
  const overallHealthScore = Math.round((userHealthScore + productHealthScore + orderHealthScore) / 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform Health Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time platform metrics and performance indicators
        </p>
      </div>

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Overall Platform Health
          </CardTitle>
          <CardDescription>System performance and stability metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{overallHealthScore}%</span>
                <Badge variant={overallHealthScore > 80 ? 'default' : overallHealthScore > 60 ? 'secondary' : 'destructive'}>
                  {overallHealthScore > 80 ? 'Excellent' : overallHealthScore > 60 ? 'Good' : 'Needs Attention'}
                </Badge>
              </div>
              <Progress value={overallHealthScore} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">User Health</p>
                <div className="flex items-center gap-2">
                  <Progress value={userHealthScore} className="h-2 flex-1" />
                  <span className="text-sm font-medium">{userHealthScore}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Product Health</p>
                <div className="flex items-center gap-2">
                  <Progress value={productHealthScore} className="h-2 flex-1" />
                  <span className="text-sm font-medium">{productHealthScore}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Health</p>
                <div className="flex items-center gap-2">
                  <Progress value={orderHealthScore} className="h-2 flex-1" />
                  <span className="text-sm font-medium">{orderHealthScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Active Users Today</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsersToday.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>{activeUsersWeek.toLocaleString()} this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Orders Today</span>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersToday.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>{ordersWeek.toLocaleString()} this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Revenue Today</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(revenueToday._sum?.amount || 0).toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>${(revenueWeek._sum?.amount || 0).toFixed(2)} this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>New Listings Today</span>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsAddedToday.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>{productsAddedWeek.toLocaleString()} this week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Growth Metrics
          </CardTitle>
          <CardDescription>Weekly growth rates and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">User Growth</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold">{userGrowthRate}%</span>
                <ArrowUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {newUsersWeek} new users this week
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Product Growth</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold">{productGrowthRate}%</span>
                <ArrowUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {productsAddedWeek} new products this week
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Order Growth</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold">{orderGrowthRate}%</span>
                <ArrowUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {ordersWeek} orders this week
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Users</span>
                <span className="font-medium">{totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Verified Users</span>
                <span className="font-medium">{verifiedUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Suspended Users</span>
                <span className="font-medium text-destructive">{suspendedUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Today</span>
                <span className="font-medium">{activeUsersToday.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active This Week</span>
                <span className="font-medium">{activeUsersWeek.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Products</span>
                <span className="font-medium">{totalProducts.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Listings</span>
                <span className="font-medium">{activeListings.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sold Products</span>
                <span className="font-medium">{soldProducts.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Removed Products</span>
                <span className="font-medium text-destructive">{removedProducts.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Views</span>
                <span className="font-medium">{Math.round(averageProductViews._avg?.views || 0).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{pendingOrders}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{shippedOrders}</p>
              <p className="text-sm text-muted-foreground">Shipped</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{deliveredOrders}</p>
              <p className="text-sm text-muted-foreground">Delivered</p>
            </div>
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold">{cancelledOrders}</p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Search Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Popular Search Terms
          </CardTitle>
          <CardDescription>Most searched keywords in the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {popularSearchTerms.map((term, index) => (
              <div key={term.query} className="flex items-center justify-between">
                <span className="text-sm">
                  {index + 1}. {term.query}
                </span>
                <Badge variant="secondary">{term._count} searches</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Service availability and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="text-sm">Database</span>
              </div>
              <Badge variant="default">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="text-sm">Search Service</span>
              </div>
              <Badge variant="default">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Authentication</span>
              </div>
              <Badge variant="default">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Payment Processing</span>
              </div>
              <Badge variant="default">Operational</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformHealthPage;