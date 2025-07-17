import type { Dictionary } from '@repo/internationalization';
import { currentUser } from '@repo/auth/server';
import { DollarSign, ShoppingBag, Package, MessageSquare } from 'lucide-react';
import { cn } from '@repo/design-system/lib/utils';

interface DashboardBannerProps {
  user: Awaited<ReturnType<typeof currentUser>>;
  dictionary: Dictionary;
  metrics: {
    totalRevenue: number;
    completedSales: number;
    activeListings: number;
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

  const stats = [
    {
      label: 'Revenue',
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Sales',
      value: metrics.completedSales.toString(),
      icon: ShoppingBag,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Active',
      value: metrics.activeListings.toString(),
      icon: Package,
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Messages',
      value: metrics.unreadMessages.toString(),
      icon: MessageSquare,
      iconColor: 'text-orange-600 dark:text-orange-400',
      highlight: metrics.unreadMessages > 0,
    },
  ];

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-800">
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Here's your account overview
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center space-x-3 rounded-lg p-3 transition-all",
                  "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10",
                  "hover:bg-gray-50 dark:hover:bg-white/10",
                  stat.highlight && "ring-2 ring-orange-500 dark:ring-orange-400 ring-opacity-50"
                )}
              >
                <div className="rounded-full p-2 bg-gray-100 dark:bg-white/10">
                  <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}