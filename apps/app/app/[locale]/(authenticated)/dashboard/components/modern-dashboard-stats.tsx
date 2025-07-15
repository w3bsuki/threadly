import { Card, CardContent } from '@repo/design-system/components';
import { DollarSign, ShoppingBag, Package, MessageSquare } from 'lucide-react';
import { cn } from '@repo/design-system/lib/utils';
import type { Dictionary } from '@repo/internationalization';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

function MetricCard({ title, value, icon: Icon, iconColor, iconBg }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] touch-manipulation">
      <CardContent className="p-3 sm:p-4 lg:p-6 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">{value}</p>
            <p className="text-xs text-muted-foreground mt-1 sm:text-sm">{title}</p>
          </div>
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            iconBg
          )}>
            <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColor)} />
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

export function ModernDashboardStats({ metrics, dictionary }: ModernDashboardStatsProps) {
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
    <div className="grid gap-3 grid-cols-2 lg:gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <MetricCard 
          key={index} 
          {...stat} 
        />
      ))}
    </div>
  );
}