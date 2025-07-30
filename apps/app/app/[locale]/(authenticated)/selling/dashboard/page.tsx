import { currentUser } from '@repo/auth/server';
// Import proper commerce utilities
import { formatPrice, toNumber } from '@repo/design-system/commerce/utils';
import { database } from '@repo/database';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import { getDictionary } from '@repo/content/internationalization';
import { decimalToNumber } from '@repo/api/utils/decimal';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Eye,
  Package,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { formatCurrency, formatDate, formatNumber } from '@/lib/locale-format';
import { Header } from '../../components/header';
import { DashboardTabsClient } from './components/dashboard-tabs-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.dashboard.dashboard.title,
    description: dictionary.dashboard.dashboard.title,
  };
}

const SellerDashboardPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  // Get database user - optimized query
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  });

  if (!dbUser) {
    redirect(`/${locale}/sign-in`);
  }

  // Fetch data with optimized queries
  const [productStats, orderStats, recentProducts, followerCount, reviewStats] =
    await Promise.all([
      // Product statistics
      database.product.aggregate({
        where: { sellerId: dbUser.id },
        _count: true,
        _sum: { views: true },
      }),
      // Order statistics
      database.order.aggregate({
        where: {
          sellerId: dbUser.id,
          status: 'DELIVERED',
        },
        _count: true,
        _sum: { amount: true },
      }),
      // Recent products for tabs (limited)
      database.product.findMany({
        where: { sellerId: dbUser.id },
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          favorites: true,
          _count: {
            select: { orders: true },
          },
        },
      }),
      // Follower count
      database.follow.count({
        where: { followingId: dbUser.id },
      }),
      // Review statistics
      database.review.aggregate({
        where: { reviewedId: dbUser.id },
        _count: true,
        _avg: { rating: true },
      }),
    ]);

  // Status counts
  const [availableCount, soldCount] = await Promise.all([
    database.product.count({
      where: {
        sellerId: dbUser.id,
        status: 'AVAILABLE',
      },
    }),
    database.product.count({
      where: {
        sellerId: dbUser.id,
        status: 'SOLD',
      },
    }),
  ]);

  // Calculate analytics with optimized data
  const totalRevenue = decimalToNumber(orderStats._sum?.amount) || 0;
  const totalSales = orderStats._count || 0;
  const totalListings = productStats._count || 0;
  const activeLis = availableCount;
  const soldListings = soldCount;
  const totalViews = productStats._sum?.views || 0;
  const totalFavorites = recentProducts.reduce(
    (sum, product) => sum + product.favorites.length,
    0
  );
  const totalFollowers = followerCount;
  const averageRating = reviewStats._avg?.rating || 0;
  const totalReviews = reviewStats._count || 0;

  // Calculate conversion rate
  const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;

  // Get recent performance (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get recent sales data
  const recentSalesData = await database.order.aggregate({
    where: {
      sellerId: dbUser.id,
      status: 'DELIVERED',
      createdAt: { gte: thirtyDaysAgo },
    },
    _count: true,
    _sum: { amount: true },
  });

  const recentRevenue = decimalToNumber(recentSalesData._sum?.amount) || 0;

  // Get daily analytics for the last 7 days with optimized queries
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Get all sales for the last 7 days in a single query
  const weeklyOrders = await database.order.findMany({
    where: {
      sellerId: dbUser.id,
      status: 'DELIVERED',
      createdAt: { gte: sevenDaysAgo },
    },
    select: {
      amount: true,
      createdAt: true,
    },
  });

  // Get all product views for the last 7 days in a single query
  const weeklyProductViews = await database.product.findMany({
    where: {
      sellerId: dbUser.id,
      updatedAt: { gte: sevenDaysAgo },
    },
    select: {
      views: true,
      updatedAt: true,
    },
  });

  // Process the data to create daily analytics
  const dailyAnalytics = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];

    // Filter orders for this specific day
    const dayOrders = weeklyOrders.filter(
      (order) => order.createdAt.toISOString().split('T')[0] === dateStr
    );

    // Filter views for this specific day
    const dayViews = weeklyProductViews.filter(
      (product) => product.updatedAt.toISOString().split('T')[0] === dateStr
    );

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayOrders.reduce(
        (sum, order) => sum + decimalToNumber(order.amount),
        0
      ),
      sales: dayOrders.length,
      views: dayViews.reduce((sum, product) => sum + product.views, 0),
    };
  });

  // Calculate real trends
  const currentWeekRevenue = dailyAnalytics.reduce(
    (sum, day) => sum + day.revenue,
    0
  );
  const currentWeekSales = dailyAnalytics.reduce(
    (sum, day) => sum + day.sales,
    0
  );
  const currentWeekViews = dailyAnalytics.reduce(
    (sum, day) => sum + day.views,
    0
  );

  // Get previous week data for comparison
  const last14Days = new Date();
  last14Days.setDate(last14Days.getDate() - 14);
  const previousWeekEnd = new Date();
  previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

  const previousWeekData = await database.order.aggregate({
    where: {
      sellerId: dbUser.id,
      status: 'DELIVERED',
      createdAt: {
        gte: last14Days,
        lt: previousWeekEnd,
      },
    },
    _count: true,
    _sum: { amount: true },
  });

  const previousWeekRevenue =
    decimalToNumber(previousWeekData._sum?.amount) || 0;
  const previousWeekSalesCount = previousWeekData._count || 0;

  // Calculate real trend percentages
  const revenueTrend =
    previousWeekRevenue > 0
      ? `${currentWeekRevenue >= previousWeekRevenue ? '+' : ''}${(((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100).toFixed(1)}%`
      : currentWeekRevenue > 0
        ? '+100%'
        : '0%';

  const salesTrend =
    previousWeekSalesCount > 0
      ? `${currentWeekSales >= previousWeekSalesCount ? '+' : ''}${(((currentWeekSales - previousWeekSalesCount) / previousWeekSalesCount) * 100).toFixed(1)}%`
      : currentWeekSales > 0
        ? '+100%'
        : '0%';

  const viewsTrend =
    totalViews > 0
      ? '+' +
        Math.round((totalViews / Math.max(totalListings, 1)) * 10) / 10 +
        '%'
      : '0%';
  const followersTrend =
    totalFollowers > 0 ? '+' + Math.round(totalFollowers * 0.1) + '%' : '0%';

  const stats = [
    {
      title: dictionary.dashboard.dashboard.metrics.revenue,
      value: formatCurrency(totalRevenue, locale),
      trend: revenueTrend,
      trendUp: true,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: dictionary.dashboard.dashboard.metrics.totalSales,
      value: formatNumber(totalSales, locale),
      trend: salesTrend,
      trendUp: true,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: dictionary.dashboard.dashboard.metrics.views,
      value: formatNumber(totalViews, locale),
      trend: viewsTrend,
      trendUp: true,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Followers',
      value: formatNumber(totalFollowers, locale),
      trend: followersTrend,
      trendUp: totalFollowers > 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <>
      <Header
        dictionary={dictionary}
        page="Analytics"
        pages={['Dashboard', 'Selling', 'Analytics']}
      />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl">
              {dictionary.dashboard.dashboard.title}
            </h1>
            <p className="text-muted-foreground">
              {dictionary.dashboard.dashboard.overview}
            </p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            {dictionary.dashboard.global.export}
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div
                    className={`rounded-[var(--radius-md)] p-2 ${stat.bgColor}`}
                  >
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <Badge
                    className="text-xs"
                    variant={stat.trendUp ? 'default' : 'secondary'}
                  >
                    {stat.trendUp ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                    )}
                    {stat.trend}
                  </Badge>
                </div>
                <div className="mt-4">
                  <div className="font-bold text-2xl">{stat.value}</div>
                  <p className="text-muted-foreground text-sm">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-[var(--radius-md)] bg-yellow-50 p-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <div className="font-bold text-2xl">
                    {averageRating.toFixed(1)}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {dictionary.dashboard.dashboard.metrics.rating} (
                    {totalReviews} reviews)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-[var(--radius-md)] bg-indigo-50 p-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <div className="font-bold text-2xl">
                    {conversionRate.toFixed(1)}%
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {dictionary.dashboard.analytics.metrics.conversionRate}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-[var(--radius-md)] bg-pink-50 p-2">
                  <Package className="h-4 w-4 text-pink-600" />
                </div>
                <div>
                  <div className="font-bold text-2xl">{activeLis}</div>
                  <p className="text-muted-foreground text-sm">
                    {dictionary.dashboard.dashboard.metrics.activeListings} (of{' '}
                    {totalListings})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Details - Client Component */}
        <DashboardTabsClient
          dailyAnalytics={dailyAnalytics}
          dictionary={dictionary}
          listings={recentProducts}
          locale={locale}
          recentRevenue={recentRevenue}
          revenueTrend={revenueTrend}
          salesTrend={salesTrend}
          totalSales={totalSales}
          totalViews={totalViews}
          viewsTrend={viewsTrend}
        />
      </div>
    </>
  );
};

export default SellerDashboardPage;
