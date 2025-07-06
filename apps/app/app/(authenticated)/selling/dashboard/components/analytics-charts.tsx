'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';
import { formatPrice } from '@repo/commerce/utils';

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
  // Real chart data from database analytics
  const chartData = {
    revenue: dailyAnalytics.map(day => ({
      day: day.day,
      value: day.revenue
    })),
    sales: dailyAnalytics.map(day => ({
      day: day.day,
      value: day.sales
    })),
    views: dailyAnalytics.map(day => ({
      day: day.day,
      value: day.views
    }))
  };


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Revenue Chart */}
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
          <div className="mt-4 h-[60px] flex items-end justify-between gap-1">
            {chartData.revenue.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div 
                  className="w-8 bg-primary rounded-sm"
                  style={{ height: `${(item.value / 600) * 50}px` }}
                />
                <span className="text-xs text-muted-foreground">{item.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sales Chart */}
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
          <div className="mt-4 h-[60px] flex items-end justify-between gap-1">
            {chartData.sales.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div 
                  className="w-8 bg-green-500 rounded-sm"
                  style={{ height: `${(item.value / 15) * 50}px` }}
                />
                <span className="text-xs text-muted-foreground">{item.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Views Chart */}
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
          <div className="mt-4 h-[60px] flex items-end justify-between gap-1">
            {chartData.views.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div 
                  className="w-8 bg-blue-500 rounded-sm"
                  style={{ height: `${(item.value / 120) * 50}px` }}
                />
                <span className="text-xs text-muted-foreground">{item.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}