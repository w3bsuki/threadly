'use client';

import { UserButton } from '@repo/auth/client';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { cn } from '@repo/design-system/lib/utils';
import type { Dictionary } from '@repo/internationalization';
import {
  BarChart3,
  Crown,
  LayoutDashboard,
  MessageCircle,
  Package,
  ShoppingBag,
  Sparkles,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppSidebarProps {
  dictionary: Dictionary;
  isAdmin?: boolean;
}

export function AppSidebar({ dictionary, isAdmin }: AppSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: dictionary.dashboard.navigation.dashboard,
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: dictionary.dashboard.navigation.listings,
      href: '/selling/listings',
      icon: Package,
    },
    {
      name: dictionary.dashboard.navigation.orders,
      href: '/buying/orders',
      icon: ShoppingBag,
    },
    {
      name: dictionary.dashboard.navigation.messages,
      href: '/messages',
      icon: MessageCircle,
    },
    {
      name: dictionary.dashboard.navigation.profile,
      href: '/profile',
      icon: User,
    },
  ];

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-[var(--space-5)] overflow-y-auto border-border border-r bg-card px-[var(--space-6)] shadow-sm backdrop-blur-sm">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <Link
            className="group flex items-center gap-[var(--space-3)]"
            href="/dashboard"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-xl)] border border-primary/20 bg-gradient-to-br from-primary to-primary/80 shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl">
              <span className="font-bold text-[var(--font-size-lg)] text-primary-foreground">
                T
              </span>
            </div>
            <span className="font-bold text-[var(--font-size-xl)] text-card-foreground transition-colors duration-200 group-hover:text-primary">
              Threadly
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul
            className="flex flex-1 flex-col gap-y-[var(--space-7)]"
            role="list"
          >
            <li>
              <ul
                className="-mx-[var(--space-2)] space-y-[var(--space-1)]"
                role="list"
              >
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      className={cn(
                        'group flex gap-x-[var(--space-3)] rounded-[var(--radius-md)] border p-[var(--space-3)] font-medium text-[var(--font-size-sm)] leading-6 transition-all duration-200',
                        pathname === item.href
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-transparent text-card-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-primary hover:shadow-sm'
                      )}
                      href={item.href}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                ))}
                {isAdmin && (
                  <li>
                    <Link
                      className={cn(
                        'group flex gap-x-[var(--space-3)] rounded-[var(--radius-md)] border p-[var(--space-3)] font-medium text-[var(--font-size-sm)] leading-6 transition-all duration-200',
                        pathname.startsWith('/admin')
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-transparent text-card-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-primary hover:shadow-sm'
                      )}
                      href="/admin"
                    >
                      <BarChart3 className="h-5 w-5 shrink-0" />
                      {dictionary.dashboard.admin.title}
                    </Link>
                  </li>
                )}
              </ul>
            </li>

            {/* Quick Actions */}
            <li>
              <div className="mb-[var(--space-1)] border-border/50 border-b pb-[var(--space-2)] font-semibold text-[var(--font-size-xs)] text-card-foreground/70 uppercase leading-6 tracking-wider">
                {dictionary.dashboard.dashboard.quickActions}
              </div>
              <ul
                className="-mx-[var(--space-2)] mt-[var(--space-3)] space-y-[var(--space-2)]"
                role="list"
              >
                <li>
                  <Link
                    className="group flex gap-x-[var(--space-3)] rounded-[var(--radius-md)] border border-primary bg-primary p-[var(--space-3)] font-medium text-[var(--font-size-sm)] text-primary-foreground leading-6 shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
                    href="/selling/new"
                  >
                    <Sparkles className="h-5 w-5 shrink-0" />
                    {dictionary.dashboard.dashboard.actions.listNewItem}
                  </Link>
                </li>
                <li>
                  <a
                    className="group flex gap-x-[var(--space-3)] rounded-[var(--radius-md)] border border-border p-[var(--space-3)] font-medium text-[var(--font-size-sm)] text-card-foreground leading-6 transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary hover:shadow-sm"
                    href={
                      process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'
                    }
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Crown className="h-5 w-5 shrink-0" />
                    {dictionary.dashboard.dashboard.recentOrders.browseShop}
                  </a>
                </li>
              </ul>
            </li>

            {/* User Section */}
            <li className="mt-auto">
              <div className="flex items-center gap-x-[var(--space-4)] px-[var(--space-2)] py-[var(--space-3)] font-medium text-[var(--font-size-sm)] leading-6">
                <div className="flex-1" suppressHydrationWarning>
                  <UserButton />
                </div>
                <ModeToggle />
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
