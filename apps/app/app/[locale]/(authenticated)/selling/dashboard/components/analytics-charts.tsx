'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@repo/design-system/components';
import * as Recharts from 'recharts';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';
import { formatPrice } from '@repo/commerce/utils';
import { useMemo } from 'react';

interface AnalyticsChartsProps {
  revenueData: number;
  salesData: number;
  viewsData: number;
  dailyAnalytics: Array<{
    day: string;
    revenue: number;
    sales: number;
    views: number;
  }>;
  revenueTrend: string;
  salesTrend: string;
  viewsTrend: string;
}

export function AnalyticsCharts({ 
  revenueData, 
  salesData, 
  viewsData, 
  dailyAnalytics, 
  revenueTrend, 
  salesTrend, 
  viewsTrend 
}: AnalyticsChartsProps) {
  // Chart configurations
  const revenueChartConfig = useMemo(() => ({
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  }), []);

  const salesChartConfig = useMemo(() => ({
    sales: {
      label: "Sales",
      color: "hsl(142, 76%, 36%)", // Green
    },
  }), []);

  const viewsChartConfig = useMemo(() => ({
    views: {
      label: "Views",
      color: "hsl(221, 83%, 53%)", // Blue
    },
  }), []);

  // Format data for recharts
  const chartData = useMemo(() => 
    dailyAnalytics.map(day => ({
      day: day.day,
      revenue: day.revenue / 100, // Convert cents to dollars
      sales: day.sales,
      views: day.views
    }))
  , [dailyAnalytics]);

  // Custom tooltip formatters
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Revenue Chart - Area Chart with Gradient */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue (7 days)</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(revenueData)}</div>
          <p className="text-xs text-muted-foreground">
            {revenueTrend} from last week
          </p>
          <div className="mt-4 h-[120px]">
            <ChartContainer config={revenueChartConfig}>
              <Recharts.AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 0,
                  right: 0,
                  top: 5,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Recharts.XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => value.slice(0, 3)}
                />
                <Recharts.YAxis hide />
                <Recharts.CartesianGrid strokeDasharray="3 3" />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />}
                />
                <Recharts.Area
                  dataKey="revenue"
                  type="natural"
                  fill="url(#fillRevenue)"
                  fillOpacity={0.4}
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                />
              </Recharts.AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sales Chart - Bar Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sales (7 days)</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{salesData}</div>
          <p className="text-xs text-muted-foreground">
            {salesTrend} from last week
          </p>
          <div className="mt-4 h-[120px]">
            <ChartContainer config={salesChartConfig}>
              <Recharts.BarChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 0,
                  right: 0,
                  top: 5,
                  bottom: 5,
                }}
              >
                <Recharts.XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => value.slice(0, 3)}
                />
                <Recharts.YAxis hide />
                <Recharts.CartesianGrid strokeDasharray="3 3" />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" formatter={(value) => [formatNumber(Number(value)), "Sales"]} />}
                />
                <Recharts.Bar
                  dataKey="sales"
                  fill="var(--color-sales)"
                  radius={[2, 2, 0, 0]}
                />
              </Recharts.BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Views Chart - Line Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Views (7 days)</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{viewsData.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {viewsTrend} from last week
          </p>
          <div className="mt-4 h-[120px]">
            <ChartContainer config={viewsChartConfig}>
              <Recharts.LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 0,
                  right: 0,
                  top: 5,
                  bottom: 5,
                }}
              >
                <Recharts.XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => value.slice(0, 3)}
                />
                <Recharts.YAxis hide />
                <Recharts.CartesianGrid strokeDasharray="3 3" />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" formatter={(value) => [formatNumber(Number(value)), "Views"]} />}
                />
                <Recharts.Line
                  dataKey="views"
                  type="natural"
                  stroke="var(--color-views)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-views)",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </Recharts.LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}