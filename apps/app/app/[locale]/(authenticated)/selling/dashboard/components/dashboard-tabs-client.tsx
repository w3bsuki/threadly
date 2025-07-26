'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components';
import { AnalyticsErrorBoundary } from '@/components/error-boundaries';
import { formatCurrency, formatNumber } from '@/lib/locale-format';
import { decimalToNumber } from '@repo/utils/decimal';
import dynamic from 'next/dynamic';

// Dynamic import for charts (heavy recharts library) - Next-Forge pattern with ssr: false
const AnalyticsCharts = dynamic(
  () => import('./analytics-charts').then(mod => ({ default: mod.AnalyticsCharts })),
  {
    loading: () => (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius-lg)] border bg-card p-6">
            <div className="animate-pulse bg-accent h-32 rounded" />
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
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">{dictionary.dashboard.dashboard.overview}</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="performance">{dictionary.dashboard.dashboard.performance}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <AnalyticsErrorBoundary>
          <AnalyticsCharts 
            revenueData={recentRevenue}
            salesData={totalSales}
            viewsData={totalViews}
            dailyAnalytics={dailyAnalytics}
            revenueTrend={revenueTrend}
            salesTrend={salesTrend}
            viewsTrend={viewsTrend}
          />
        </AnalyticsErrorBoundary>
      </TabsContent>

      <TabsContent value="products" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.dashboard.dashboard.charts.topProducts}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {listings
                .sort((a, b) => b.views - a.views)
                .slice(0, 5)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-[var(--radius-lg)] border">
                    <div>
                      <h3 className="font-medium">{product.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.views} views • {product.favorites.length} favorites
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(decimalToNumber(product.price), locale)}</div>
                      <Badge variant={product.status === 'SOLD' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="performance" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Last 6 months performance
              </p>
              <div className="text-center py-8 text-muted-foreground">
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
              <p className="text-sm text-muted-foreground mb-4">
                Monthly revenue trends
              </p>
              <div className="text-center py-8 text-muted-foreground">
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