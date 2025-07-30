import type { currentUser } from '@repo/auth/server';
import { Button } from '@repo/ui/components';
import type { Dictionary } from '@repo/content/internationalization';
import { Bell, Plus, Search } from 'lucide-react';
import Link from 'next/link';

interface ModernDashboardHeaderProps {
  user: Awaited<ReturnType<typeof currentUser>>;
  dictionary: Dictionary;
}

export function ModernDashboardHeader({
  user,
  dictionary,
}: ModernDashboardHeaderProps) {
  if (!user) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12)
      return dictionary.dashboard.dashboard.welcome.replace(
        '{{name}}',
        firstName
      );
    if (hour < 18)
      return dictionary.dashboard.dashboard.welcome.replace(
        '{{name}}',
        firstName
      );
    return dictionary.dashboard.dashboard.welcome.replace(
      '{{name}}',
      firstName
    );
  };

  const firstName = user.firstName || 'there';

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome Section with improved mobile styling */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="font-bold text-foreground text-xl tracking-tight sm:text-2xl lg:text-3xl">
              {getGreeting()}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {dictionary.dashboard.dashboard.welcomeMessage.replace(
                '{{name}}',
                firstName
              )}
            </p>
          </div>

          {/* Mobile-optimized action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              className="relative min-h-[48px] min-w-[48px] touch-manipulation transition-all duration-200 active:scale-95 sm:min-h-[44px] sm:min-w-[44px]"
              size="icon"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              variant="outline"
            >
              <Search className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="sr-only">
                {dictionary.dashboard.global.search}
              </span>
            </Button>

            <Button
              className="relative min-h-[48px] min-w-[48px] touch-manipulation transition-all duration-200 active:scale-95 sm:min-h-[44px] sm:min-w-[44px] lg:hidden"
              size="icon"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              variant="outline"
            >
              <Bell className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="sr-only">
                {dictionary.dashboard.navigation.notifications}
              </span>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-[var(--radius-full)] bg-red-500" />
            </Button>

            <Button
              asChild
              className="min-h-[48px] touch-manipulation gap-2 px-3 transition-all duration-200 active:scale-95 sm:min-h-[44px] sm:px-4 lg:hidden"
              size="sm"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Link href="/selling/new">
                <Plus className="h-4 w-4" />
                <span className="font-medium text-sm">
                  {dictionary.dashboard.dashboard.actions.listNewItem}
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop-only top actions */}
      <div className="hidden items-center justify-end gap-3 lg:flex">
        <Button
          className="relative min-h-[44px] min-w-[44px] touch-manipulation transition-all duration-200 active:scale-95"
          size="icon"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          variant="outline"
        >
          <Bell className="h-4 w-4" />
          <span className="sr-only">
            {dictionary.dashboard.navigation.notifications}
          </span>
          <span className="absolute top-1 right-1 h-2 w-2 rounded-[var(--radius-full)] bg-red-500" />
        </Button>

        <Button
          asChild
          className="min-h-[44px] touch-manipulation gap-2 transition-all duration-200 active:scale-95"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <Link href="/selling/new">
            <Plus className="h-4 w-4" />
            <span>{dictionary.dashboard.dashboard.actions.listNewItem}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
