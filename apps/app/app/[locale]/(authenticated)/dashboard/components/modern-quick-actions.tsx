'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { 
  Plus, 
  TrendingUp, 
  MessageSquare,
  ShoppingBag,
  Settings,
  Users,
  Heart,
  Eye,
  MoreHorizontal,
  History,
  ChartBar,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import type { Dictionary } from '@repo/internationalization';

interface QuickActionProps {
  href: string;
  icon: React.ElementType;
  label: string;
  bgColor: string;
  iconColor: string;
  badge?: number;
  isPrimary?: boolean;
}

function QuickAction({ href, icon: Icon, label, bgColor, iconColor, badge, isPrimary }: QuickActionProps) {
  const isExternal = href.startsWith('http');
  
  const content = (
    <div className={cn(
      "relative flex flex-col items-center justify-center p-4 rounded-[var(--radius-lg)] border transition-all cursor-pointer touch-manipulation active:scale-95 duration-200",
      "min-h-[88px] sm:min-h-[80px] md:min-h-[72px] lg:min-h-[64px]",
      isPrimary
        ? "border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40"
        : "border-border bg-card hover:bg-accent hover:border-accent-foreground/20"
    )} style={{ WebkitTapHighlightColor: 'transparent' }}>
      <div className={cn(
        "p-2.5 rounded-[var(--radius-lg)] mb-2",
        bgColor
      )}>
        <Icon className={cn("h-6 w-6 sm:h-5 sm:w-5", iconColor)} />
      </div>
      <span className="text-sm sm:text-xs font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <div className="absolute top-2 right-2 h-5 w-5 rounded-[var(--radius-full)] bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </div>
      )}
    </div>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

interface ModernQuickActionsProps {
  dictionary: Dictionary;
}

export function ModernQuickActions({ dictionary }: ModernQuickActionsProps) {
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  
  // Primary actions - no duplicates from bottom nav
  const primaryActions = [
    {
      href: '/selling/orders',
      icon: ShoppingBag,
      label: 'Orders',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      badge: 3, // TODO: Replace with actual count
      isPrimary: true,
    },
    {
      href: '/selling/dashboard',
      icon: TrendingUp,
      label: 'Stats',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      isPrimary: true,
    },
    {
      href: '/selling/listings',
      icon: Eye,
      label: 'Listings',
      bgColor: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
    {
      href: '/following',
      icon: Heart,
      label: 'Saved',
      bgColor: 'bg-pink-100',
      iconColor: 'text-pink-600',
    },
  ];
  
  // Secondary actions for the "More" sheet
  const secondaryActions = [
    {
      href: '/selling/history',
      icon: History,
      label: 'Sales History',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      href: '/selling/analytics',
      icon: ChartBar,
      label: 'Analytics',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      href: '/selling/promotions',
      icon: Tag,
      label: 'Promotions',
      bgColor: 'bg-rose-100',
      iconColor: 'text-rose-600',
    },
    {
      href: '/settings',
      icon: Settings,
      label: 'Settings',
      bgColor: 'bg-secondary',
      iconColor: 'text-muted-foreground',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{dictionary.dashboard.dashboard.quickActions}</CardTitle>
          <div className="flex items-center gap-2">
            <Sheet open={moreActionsOpen} onOpenChange={setMoreActionsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="min-h-[44px] touch-manipulation transition-all duration-200 active:scale-95"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <MoreHorizontal className="h-4 w-4 mr-1" />
                  More
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>More Actions</SheetTitle>
                </SheetHeader>
                <div className="grid gap-3 mt-6">
                  {secondaryActions.map((action, index) => (
                    <Link 
                      key={index} 
                      href={action.href} 
                      onClick={() => setMoreActionsOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] hover:bg-accent transition-colors"
                    >
                      <div className={cn("p-2 rounded-[var(--radius-lg)]", action.bgColor)}>
                        <action.icon className={cn("h-5 w-5", action.iconColor)} />
                      </div>
                      <span className="font-medium">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="min-h-[44px] touch-manipulation transition-all duration-200 active:scale-95"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Link href="/selling/new">
                <Plus className="h-4 w-4 mr-1" />
                {dictionary.dashboard.global.create}
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          {primaryActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}