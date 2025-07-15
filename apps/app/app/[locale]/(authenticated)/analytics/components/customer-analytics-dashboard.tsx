'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components';
import { 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Eye,
  Heart,
  RefreshCw,
  Download
} from 'lucide-react';
import { CustomerSegmentChart } from './customer-segment-chart';
import { PurchasePatternChart } from './purchase-pattern-chart';
import { CustomerLifetimeValue } from './customer-lifetime-value';
import { BehaviorInsights } from './behavior-insights';

interface CustomerAnalyticsDashboardProps {
  sellerId: string;
}

interface AnalyticsData {
  overview: {
    totalCustomers: number;
    returningCustomers: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
    totalInteractions: number;
    favoritesCount: number;
  };
  segments: Array<{
    name: string;
    count: number;
    percentage: number;
    avgSpend: number;
    color: string;
  }>;
  purchasePatterns: Array<{
    period: string;
    newCustomers: number;
    returningCustomers: number;
    totalRevenue: number;
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    totalSpent: number;
    ordersCount: number;
    lastPurchase: string;
    lifetimeValue: number;
  }>;
  behaviorInsights: {
    topCategories: Array<{ name: string; interactions: number }>;
    avgTimeToPurchase: number;
    conversionRate: number;
    repeatPurchaseRate: number;
  };
}

export function CustomerAnalyticsDashboard({ sellerId }: CustomerAnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [sellerId, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/seller/analytics/customers?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/seller/analytics/customers/export?range=${timeRange}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customer-analytics-${timeRange}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="h-32 animate-pulse bg-muted/50 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Failed to load analytics data</p>
          <Button onClick={loadAnalyticsData} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAnalyticsData} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData} size="sm" disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.returningCustomers} returning customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analyticsData.overview.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per customer transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analyticsData.overview.customerLifetimeValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average lifetime value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalInteractions}</div>
            <p className="text-xs text-muted-foreground">
              Views, favorites, and carts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.favoritesCount}</div>
            <p className="text-xs text-muted-foreground">
              Items saved by customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analyticsData.behaviorInsights.conversionRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Visitors to customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="segments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="segments">Customer Segments</TabsTrigger>
          <TabsTrigger value="patterns">Purchase Patterns</TabsTrigger>
          <TabsTrigger value="lifetime">Lifetime Value</TabsTrigger>
          <TabsTrigger value="behavior">Behavior Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segmentation</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerSegmentChart segments={analyticsData.segments} />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {analyticsData.segments.map((segment) => (
                  <div key={segment.name} className="text-center p-3 border rounded">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="font-medium text-sm">{segment.name}</span>
                    </div>
                    <div className="text-2xl font-bold">{segment.count}</div>
                    <div className="text-xs text-muted-foreground">
                      {segment.percentage.toFixed(1)}% • Avg: ${segment.avgSpend.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Patterns Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchasePatternChart patterns={analyticsData.purchasePatterns} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifetime" className="space-y-4">
          <CustomerLifetimeValue customers={analyticsData.topCustomers} />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <BehaviorInsights insights={analyticsData.behaviorInsights} />
        </TabsContent>
      </Tabs>
    </div>
  );
}