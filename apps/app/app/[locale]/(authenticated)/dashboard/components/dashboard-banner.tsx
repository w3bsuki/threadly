import type { Dictionary } from '@repo/internationalization';
import { currentUser } from '@repo/auth/server';
import { DollarSign, ShoppingBag, Package, MessageSquare, ShoppingCart, TrendingUp } from 'lucide-react';
import { cn } from '@repo/design-system/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';

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

export function DashboardBanner({ user, dictionary, metrics }: DashboardBannerProps) {
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

  const renderStatCard = (stat: typeof sellingStats[0] & { highlight?: boolean }, index: number) => (
    <div
      key={index}
      className={cn(
        "flex items-center space-x-4 rounded-lg p-4 transition-all",
        "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10",
        "hover:bg-gray-50 dark:hover:bg-white/10",
        stat.highlight && "ring-2 ring-orange-500 dark:ring-orange-400 ring-opacity-50"
      )}
    >
      <div className="rounded-full p-3 bg-gray-100 dark:bg-white/10">
        <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {stat.value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-800">
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Your buying and selling overview
            </p>
          </div>
          
          <Tabs defaultValue="selling" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="selling">Selling</TabsTrigger>
              <TabsTrigger value="buying">Buying</TabsTrigger>
            </TabsList>
            <TabsContent value="selling" className="mt-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {sellingStats.map(renderStatCard)}
              </div>
            </TabsContent>
            <TabsContent value="buying" className="mt-4">
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