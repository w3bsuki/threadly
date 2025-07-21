import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/card';
import { Badge } from '@repo/design-system/components/badge';
import { Skeleton } from '@repo/design-system/components/skeleton';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  UserCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import type { DashboardMetrics } from '../types';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
  loading?: boolean;
}

export function MetricsCards({ metrics, loading = false }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: metrics.totalUsers,
      icon: Users,
      format: 'number',
      description: `${metrics.activeUsers} active`,
      trend: calculateTrend(metrics.totalUsers, 850), // Mock previous value
      color: 'blue',
    },
    {
      title: 'Products Listed',
      value: metrics.totalProducts,
      icon: Package,
      format: 'number',
      description: 'All time listings',
      trend: calculateTrend(metrics.totalProducts, 1200), // Mock previous value
      color: 'green',
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders,
      icon: ShoppingCart,
      format: 'number',
      description: 'Completed transactions',
      trend: calculateTrend(metrics.totalOrders, 156), // Mock previous value
      color: 'purple',
    },
    {
      title: 'Revenue',
      value: metrics.totalRevenue,
      icon: DollarSign,
      format: 'currency',
      description: `AOV: ${formatCurrency(metrics.averageOrderValue)}`,
      trend: calculateTrend(metrics.totalRevenue, 245000), // Mock previous value
      color: 'orange',
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers,
      icon: UserCheck,
      format: 'number',
      description: 'Last 30 days',
      trend: calculateTrend(metrics.activeUsers, 420), // Mock previous value
      color: 'cyan',
    },
    {
      title: 'Conversion Rate',
      value: metrics.conversionRate,
      icon: TrendingUp,
      format: 'percentage',
      description: 'Visit to purchase',
      trend: calculateTrend(metrics.conversionRate, 3.2), // Mock previous value
      color: 'pink',
    },
    {
      title: 'Pending Reports',
      value: metrics.pendingReports,
      icon: AlertTriangle,
      format: 'number',
      description: 'Require attention',
      trend: null, // No trend for reports
      color: metrics.pendingReports > 10 ? 'red' : 'gray',
      urgent: metrics.pendingReports > 10,
    },
    {
      title: 'Avg Order Value',
      value: metrics.averageOrderValue,
      icon: DollarSign,
      format: 'currency',
      description: 'Per transaction',
      trend: calculateTrend(metrics.averageOrderValue, 89.50), // Mock previous value
      color: 'emerald',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <MetricCard key={index} {...card} />
      ))}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  format: 'number' | 'currency' | 'percentage';
  description: string;
  trend: { value: number; direction: 'up' | 'down' | 'neutral' } | null;
  color: string;
  urgent?: boolean;
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  format, 
  description, 
  trend, 
  color, 
  urgent = false 
}: MetricCardProps) {
  const formattedValue = formatValue(value, format);
  const trendIcon = getTrendIcon(trend?.direction);
  const cardClassName = urgent ? 'border-red-200 bg-red-50/50' : '';

  return (
    <Card className={cardClassName}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{formattedValue}</div>
          {trend && (
            <Badge 
              variant={trend.direction === 'up' ? 'default' : trend.direction === 'down' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {trendIcon}
              {formatPercentage(Math.abs(trend.value))}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
        {urgent && (
          <Badge variant="destructive" className="mt-2 text-xs">
            Needs Attention
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function formatValue(value: number, format: 'number' | 'currency' | 'percentage'): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentage(value);
    case 'number':
    default:
      return formatNumber(value);
  }
}

function calculateTrend(current: number, previous: number) {
  if (previous === 0) return null;
  
  const change = ((current - previous) / previous) * 100;
  
  return {
    value: Math.abs(change),
    direction: change > 1 ? 'up' : change < -1 ? 'down' : 'neutral' as const,
  };
}

function getTrendIcon(direction?: 'up' | 'down' | 'neutral') {
  switch (direction) {
    case 'up':
      return <TrendingUp className="h-3 w-3 mr-1" />;
    case 'down':
      return <TrendingDown className="h-3 w-3 mr-1" />;
    case 'neutral':
      return <Minus className="h-3 w-3 mr-1" />;
    default:
      return null;
  }
}