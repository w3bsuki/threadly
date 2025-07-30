'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/components';
import { cn } from '@repo/ui/lib/utils';
import type { Dictionary } from '@repo/content/internationalization';
import {
  ChartBar,
  Eye,
  Heart,
  History,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Settings,
  ShoppingBag,
  Tag,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface QuickActionProps {
  href: string;
  icon: React.ElementType;
  label: string;
  bgColor: string;
  iconColor: string;
  badge?: number;
  isPrimary?: boolean;
}

function QuickAction({
  href,
  icon: Icon,
  label,
  bgColor,
  iconColor,
  badge,
  isPrimary,
}: QuickActionProps) {
  const isExternal = href.startsWith('http');

  const content = (
    <div
      className={cn(
        'relative flex cursor-pointer touch-manipulation flex-col items-center justify-center rounded-[var(--radius-lg)] border p-4 transition-all duration-200 active:scale-95',
        'min-h-[88px] sm:min-h-[80px] md:min-h-[72px] lg:min-h-[64px]',
        isPrimary
          ? 'border-primary/20 bg-primary/5 hover:border-primary/40 hover:bg-primary/10'
          : 'border-border bg-card hover:border-accent-foreground/20 hover:bg-accent'
      )}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className={cn('mb-2 rounded-[var(--radius-lg)] p-2.5', bgColor)}>
        <Icon className={cn('h-6 w-6 sm:h-5 sm:w-5', iconColor)} />
      </div>
      <span className="font-medium text-sm sm:text-xs">{label}</span>
      {badge !== undefined && badge > 0 && (
        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-[var(--radius-full)] bg-destructive font-bold text-destructive-foreground text-xs">
          {badge > 9 ? '9+' : badge}
        </div>
      )}
    </div>
  );

  if (isExternal) {
    return (
      <a
        className="block"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {content}
      </a>
    );
  }

  return (
    <Link className="block" href={href}>
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
          <CardTitle className="font-semibold text-lg">
            {dictionary.dashboard.dashboard.quickActions}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Sheet onOpenChange={setMoreActionsOpen} open={moreActionsOpen}>
              <SheetTrigger asChild>
                <Button
                  className="min-h-[44px] touch-manipulation transition-all duration-200 active:scale-95"
                  size="sm"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  variant="ghost"
                >
                  <MoreHorizontal className="mr-1 h-4 w-4" />
                  More
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>More Actions</SheetTitle>
                </SheetHeader>
                <div className="mt-6 grid gap-3">
                  {secondaryActions.map((action, index) => (
                    <Link
                      className="flex items-center gap-3 rounded-[var(--radius-lg)] p-3 transition-colors hover:bg-accent"
                      href={action.href}
                      key={index}
                      onClick={() => setMoreActionsOpen(false)}
                    >
                      <div
                        className={cn(
                          'rounded-[var(--radius-lg)] p-2',
                          action.bgColor
                        )}
                      >
                        <action.icon
                          className={cn('h-5 w-5', action.iconColor)}
                        />
                      </div>
                      <span className="font-medium">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <Button
              asChild
              className="min-h-[44px] touch-manipulation transition-all duration-200 active:scale-95"
              size="sm"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              variant="ghost"
            >
              <Link href="/selling/new">
                <Plus className="mr-1 h-4 w-4" />
                {dictionary.dashboard.global.create}
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          {primaryActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
