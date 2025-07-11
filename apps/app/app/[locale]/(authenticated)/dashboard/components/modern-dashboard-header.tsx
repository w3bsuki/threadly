import type { Dictionary } from '@repo/internationalization';
import { currentUser } from '@repo/auth/server';
import { Button } from '@repo/design-system/components';
import { Bell, Plus, Search } from 'lucide-react';
import Link from 'next/link';

interface ModernDashboardHeaderProps {
  user: Awaited<ReturnType<typeof currentUser>>;
  dictionary: Dictionary;
}

export function ModernDashboardHeader({ user, dictionary }: ModernDashboardHeaderProps) {
  if (!user) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return dictionary.dashboard.dashboard.welcome.replace('{{name}}', firstName);
    if (hour < 18) return dictionary.dashboard.dashboard.welcome.replace('{{name}}', firstName);
    return dictionary.dashboard.dashboard.welcome.replace('{{name}}', firstName);
  };

  const firstName = user.firstName || 'there';

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome Section with improved mobile styling */}
      <div className="bg-card rounded-lg border border-border p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
              {getGreeting()}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {dictionary.dashboard.dashboard.welcomeMessage.replace('{{name}}', firstName)}
            </p>
          </div>
          
          {/* Mobile-optimized action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              className="relative min-h-[48px] min-w-[48px] sm:min-h-[44px] sm:min-w-[44px] touch-manipulation transition-all duration-200 active:scale-95"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Search className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="sr-only">{dictionary.dashboard.global.search}</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="relative min-h-[48px] min-w-[48px] sm:min-h-[44px] sm:min-w-[44px] touch-manipulation transition-all duration-200 active:scale-95 lg:hidden"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Bell className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="sr-only">{dictionary.dashboard.navigation.notifications}</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            
            <Button 
              asChild 
              size="sm"
              className="gap-2 min-h-[48px] sm:min-h-[44px] px-3 sm:px-4 touch-manipulation transition-all duration-200 active:scale-95 lg:hidden"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Link href="/selling/new">
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">{dictionary.dashboard.dashboard.actions.listNewItem}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Desktop-only top actions */}
      <div className="hidden lg:flex items-center justify-end gap-3">
        <Button 
          variant="outline" 
          size="icon" 
          className="relative min-h-[44px] min-w-[44px] touch-manipulation transition-all duration-200 active:scale-95"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <Bell className="h-4 w-4" />
          <span className="sr-only">{dictionary.dashboard.navigation.notifications}</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
        
        <Button 
          asChild 
          className="gap-2 min-h-[44px] touch-manipulation transition-all duration-200 active:scale-95"
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