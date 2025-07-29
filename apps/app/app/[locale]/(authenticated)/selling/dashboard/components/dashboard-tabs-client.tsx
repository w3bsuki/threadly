'use client';

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components';
import { decimalToNumber } from '@repo/utils/decimal';
import dynamic from 'next/dynamic';
import { AnalyticsErrorBoundary } from '@/components/error-boundaries';
import { formatCurrency, formatNumber } from '@/lib/locale-format';

// Dynamic import for charts (heavy recharts library) - Next-Forge pattern with ssr: false
const AnalyticsCharts = dynamic(
  () =>
    import('./analytics-charts').then((mod) => ({
      default: mod.AnalyticsCharts,
    })),
  {
    loading: () => (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            className="rounded-[var(--radius-lg)] border bg-card p-6"
            key={i}
          >
            <div className="h-32 animate-pulse rounded bg-accent" />
          </div>
        ))}
      </div>
    ),
    ssr: false, // Next-Forge pattern for chart components
  }
);

interface DashboardTabsClientProps {
  dictionary: Record<string, string>;
  recentRevenue: number;
  totalSales: number;
  totalViews: number;
  dailyAnalytics: Array<{
    day: string;
    revenue: number;
    sales: number;
    views: number;
  }>;
  revenueTrend: string;
  salesTrend: string;
  viewsTrend: string;
  listings: Array<{
    id: string;
    title: string;
    price: number;
    views: number;
    status: string;
    favorites: Array<{ id: string }>;
  }>;
  locale: string;
}

export function DashboardTabsClient({
  dictionary,
  recentRevenue,
  totalSales,
  totalViews,
  dailyAnalytics,
  revenueTrend,
  salesTrend,
  viewsTrend,
  listings,
  locale,
}: DashboardTabsClientProps) {
  return (
    <Tabs className="space-y-4" defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">
          {dictionary.dashboard.dashboard.overview}
        </TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="performance">
          {dictionary.dashboard.dashboard.performance}
        </TabsTrigger>
      </TabsList>

      <TabsContent className="space-y-4" value="overview">
        <AnalyticsErrorBoundary>
          <AnalyticsCharts
            dailyAnalytics={dailyAnalytics}
            revenueData={recentRevenue}
            revenueTrend={revenueTrend}
            salesData={totalSales}
            salesTrend={salesTrend}
            viewsData={totalViews}
            viewsTrend={viewsTrend}
          />
        </AnalyticsErrorBoundary>
      </TabsContent>

      <TabsContent className="space-y-4" value="products">
        <Card>
          <CardHeader>
            <CardTitle>
              {dictionary.dashboard.dashboard.charts.topProducts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {listings
                .sort((a, b) => b.views - a.views)
                .slice(0, 5)
                .map((product) => (
                  <div
                    className="flex items-center justify-between rounded-[var(--radius-lg)] border p-3"
                    key={product.id}
                  >
                    <div>
                      <h3 className="font-medium">{product.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {product.views} views • {product.favorites.length}{' '}
                        favorites
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(decimalToNumber(product.price), locale)}
                      </div>
                      <Badge
                        variant={
                          product.status === 'SOLD' ? 'default' : 'secondary'
                        }
                      >
                        {product.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent className="space-y-4" value="performance">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground text-sm">
                Last 6 months performance
              </p>
              <div className="py-8 text-center text-muted-foreground">
                Charts coming soon...
                <br />
                <small>Connect PostHog for detailed analytics</small>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground text-sm">
                Monthly revenue trends
              </p>
              <div className="py-8 text-center text-muted-foreground">
                Charts coming soon...
                <br />
                <small>Advanced analytics in development</small>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
