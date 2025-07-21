import { Card, CardContent } from '@repo/design-system/components';
import { DollarSign, ShoppingBag, Package, MessageSquare } from 'lucide-react';
import { cn } from '@repo/design-system/lib/utils';
import type { Dictionary } from '@repo/internationalization';

interface DashboardStatsProps {
  metrics: {
    totalRevenue: number;
    completedSales: number;
    activeListings: number;
    unreadMessages: number;
  };
  dictionary: Dictionary;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground sm:text-sm">{title}</p>
            <p className="text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
            {trend && (
              <p className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </p>
            )}
          </div>
          <div className="rounded-[var(--radius-full)] bg-muted p-3">
            <Icon className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats({ metrics, dictionary }: DashboardStatsProps) {
  const stats = [
    {
      title: dictionary.dashboard.dashboard.metrics.totalRevenue,
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: dictionary.dashboard.dashboard.metrics.completedSales,
      value: metrics.completedSales,
      icon: ShoppingBag,
      trend: { value: 8.2, isPositive: true }
    },
    {
      title: dictionary.dashboard.dashboard.metrics.activeListings,
      value: metrics.activeListings,
      icon: Package,
    },
    {
      title: dictionary.dashboard.dashboard.metrics.unreadMessages,
      value: metrics.unreadMessages,
      icon: MessageSquare,
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}