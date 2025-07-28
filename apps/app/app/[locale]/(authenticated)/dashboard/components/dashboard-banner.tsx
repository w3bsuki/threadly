import type { currentUser } from '@repo/auth/server';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import { cn } from '@repo/design-system/lib/utils';
import type { Dictionary } from '@repo/internationalization';
import {
  DollarSign,
  MessageSquare,
  Package,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';

interface DashboardBannerProps {
  user: Awaited<ReturnType<typeof currentUser>>;
  dictionary: Dictionary;
  metrics: {
    totalRevenue: number;
    completedSales: number;
    activeListings: number;
    totalSpent: number;
    totalPurchases: number;
    unreadMessages: number;
  };
}

export function DashboardBanner({
  user,
  dictionary,
  metrics,
}: DashboardBannerProps) {
  if (!user) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user.firstName || 'there';

  const sellingStats = [
    {
      label: 'Revenue',
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Sales',
      value: metrics.completedSales.toString(),
      icon: TrendingUp,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Active',
      value: metrics.activeListings.toString(),
      icon: Package,
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  const buyingStats = [
    {
      label: 'Spent',
      value: `$${metrics.totalSpent.toLocaleString()}`,
      icon: ShoppingCart,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Orders',
      value: metrics.totalPurchases.toString(),
      icon: ShoppingBag,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      label: 'Messages',
      value: metrics.unreadMessages.toString(),
      icon: MessageSquare,
      iconColor: 'text-orange-600 dark:text-orange-400',
      highlight: metrics.unreadMessages > 0,
    },
  ];

  const renderStatCard = (
    stat: (typeof sellingStats)[0] & { highlight?: boolean },
    index: number
  ) => (
    <div
      className={cn(
        'flex items-center space-x-4 rounded-lg p-4 transition-all',
        'border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5',
        'hover:bg-gray-50 dark:hover:bg-white/10',
        stat.highlight &&
          'ring-2 ring-orange-500 ring-opacity-50 dark:ring-orange-400'
      )}
      key={index}
    >
      <div className="rounded-full bg-gray-100 p-3 dark:bg-white/10">
        <stat.icon className={cn('h-5 w-5', stat.iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-gray-600 text-sm dark:text-gray-400">{stat.label}</p>
        <p className="truncate font-semibold text-gray-900 text-lg dark:text-white">
          {stat.value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-black">
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-6">
          <div>
            <h1 className="font-semibold text-gray-900 text-xl sm:text-2xl dark:text-white">
              {getGreeting()}, {firstName}
            </h1>
            <p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
              Your buying and selling overview
            </p>
          </div>

          <Tabs className="w-full" defaultValue="selling">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="selling">Selling</TabsTrigger>
              <TabsTrigger value="buying">Buying</TabsTrigger>
            </TabsList>
            <TabsContent className="mt-4" value="selling">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {sellingStats.map(renderStatCard)}
              </div>
            </TabsContent>
            <TabsContent className="mt-4" value="buying">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {buyingStats.map(renderStatCard)}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
