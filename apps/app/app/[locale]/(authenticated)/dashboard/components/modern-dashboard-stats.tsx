import { Card, CardContent } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import type { Dictionary } from '@repo/internationalization';
import { DollarSign, MessageSquare, Package, ShoppingBag } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
}: MetricCardProps) {
  return (
    <Card className="relative min-h-[80px] touch-manipulation overflow-hidden transition-all hover:shadow-md sm:min-h-[100px] lg:min-h-[120px]">
      <CardContent className="flex h-full flex-col justify-between p-3 sm:p-4 lg:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-xl tracking-tight sm:text-2xl lg:text-3xl">
              {value}
            </p>
            <p className="mt-1 text-muted-foreground text-xs sm:text-sm">
              {title}
            </p>
          </div>
          <div
            className={cn('shrink-0 rounded-[var(--radius-lg)] p-2', iconBg)}
          >
            <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ModernDashboardStatsProps {
  metrics: {
    totalRevenue: number;
    completedSales: number;
    activeListings: number;
    unreadMessages: number;
  };
  dictionary: Dictionary;
}

export function ModernDashboardStats({
  metrics,
  dictionary,
}: ModernDashboardStatsProps) {
  const stats = [
    {
      title: dictionary.dashboard.dashboard.metrics.totalRevenue,
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    {
      title: dictionary.dashboard.dashboard.metrics.completedSales,
      value: metrics.completedSales,
      icon: ShoppingBag,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      title: dictionary.dashboard.dashboard.metrics.activeListings,
      value: metrics.activeListings,
      icon: Package,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
    {
      title: dictionary.dashboard.dashboard.metrics.unreadMessages,
      value: metrics.unreadMessages,
      icon: MessageSquare,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {stats.map((stat, index) => (
        <MetricCard key={index} {...stat} />
      ))}
    </div>
  );
}
