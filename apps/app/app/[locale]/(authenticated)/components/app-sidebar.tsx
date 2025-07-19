'use client';

import { cn } from '@repo/design-system/lib/utils';
import {
  LayoutDashboard,
  Package,
  MessageCircle,
  User,
  ShoppingBag,
  BarChart3,
  Sparkles,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@repo/auth/client';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import type { Dictionary } from '@repo/internationalization';

interface AppSidebarProps {
  dictionary: Dictionary;
  isAdmin?: boolean;
}

export function AppSidebar({ dictionary, isAdmin }: AppSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: dictionary.dashboard.navigation.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: dictionary.dashboard.navigation.listings, href: '/selling/listings', icon: Package },
    { name: dictionary.dashboard.navigation.orders, href: '/buying/orders', icon: ShoppingBag },
    { name: dictionary.dashboard.navigation.messages, href: '/messages', icon: MessageCircle },
    { name: dictionary.dashboard.navigation.profile, href: '/profile', icon: User },
  ];

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-[var(--space-5)] overflow-y-auto border-r border-border bg-card px-[var(--space-6)] shadow-sm backdrop-blur-sm">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/dashboard" className="flex items-center gap-[var(--space-3)] group">
            <div className="h-10 w-10 rounded-[var(--radius-xl)] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105 border border-primary/20">
              <span className="text-primary-foreground font-bold text-[var(--font-size-lg)]">T</span>
            </div>
            <span className="text-[var(--font-size-xl)] font-bold text-card-foreground group-hover:text-primary transition-colors duration-200">Threadly</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-[var(--space-7)]">
            <li>
              <ul role="list" className="-mx-[var(--space-2)] space-y-[var(--space-1)]">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex gap-x-[var(--space-3)] rounded-[var(--radius-md)] p-[var(--space-3)] text-[var(--font-size-sm)] leading-6 font-medium transition-all duration-200 border',
                        pathname === item.href
                          ? 'bg-primary text-primary-foreground shadow-sm border-primary'
                          : 'text-card-foreground hover:text-primary hover:bg-primary/10 hover:shadow-sm border-transparent hover:border-primary/30'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                ))}
                {isAdmin && (
                  <li>
                    <Link
                      href="/admin"
                      className={cn(
                        'group flex gap-x-[var(--space-3)] rounded-[var(--radius-md)] p-[var(--space-3)] text-[var(--font-size-sm)] leading-6 font-medium transition-all duration-200 border',
                        pathname.startsWith('/admin')
                          ? 'bg-primary text-primary-foreground shadow-sm border-primary'
                          : 'text-card-foreground hover:text-primary hover:bg-primary/10 hover:shadow-sm border-transparent hover:border-primary/30'
                      )}
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
              <div className="text-[var(--font-size-xs)] font-semibold leading-6 text-card-foreground/70 uppercase tracking-wider mb-[var(--space-1)] pb-[var(--space-2)] border-b border-border/50">
                {dictionary.dashboard.dashboard.quickActions}
              </div>
              <ul role="list" className="-mx-[var(--space-2)] mt-[var(--space-3)] space-y-[var(--space-2)]">
                <li>
                  <Link
                    href="/selling/new"
                    className="group flex gap-x-[var(--space-3)] rounded-[var(--radius-md)] p-[var(--space-3)] text-[var(--font-size-sm)] leading-6 font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md border border-primary"
                  >
                    <Sparkles className="h-5 w-5 shrink-0" />
                    {dictionary.dashboard.dashboard.actions.listNewItem}
                  </Link>
                </li>
                <li>
                  <a
                    href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-x-[var(--space-3)] rounded-[var(--radius-md)] p-[var(--space-3)] text-[var(--font-size-sm)] leading-6 font-medium text-card-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 hover:shadow-sm border border-border hover:border-primary/30"
                  >
                    <Crown className="h-5 w-5 shrink-0" />
                    {dictionary.dashboard.dashboard.recentOrders.browseShop}
                  </a>
                </li>
              </ul>
            </li>

            {/* User Section */}
            <li className="mt-auto">
              <div className="flex items-center gap-x-[var(--space-4)] px-[var(--space-2)] py-[var(--space-3)] text-[var(--font-size-sm)] font-medium leading-6">
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