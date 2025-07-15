'use client';

import { UserButton } from '@repo/auth/client';
import { Button } from '@repo/design-system/components';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import {
  LayoutDashboard,
  Package,
  MessageCircle,
  User,
  Menu,
  Plus,
  TrendingUp,
  ShoppingBag,
  Settings,
  LogOut,
  Heart,
  BarChart3,
  Sparkles,
  Crown,
  Star,
  DollarSign,
  Megaphone,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, ReactNode } from 'react';
import { NotificationBell } from './notification-bell';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { SignOutButton } from '@repo/auth/client';
import type { Dictionary } from '@repo/internationalization';

interface AppLayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
  dictionary: Dictionary;
}

export function AppLayout({ children, isAdmin, dictionary }: AppLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: dictionary.dashboard.navigation.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: dictionary.dashboard.navigation.listings, href: '/selling/listings', icon: Package },
    { name: dictionary.dashboard.dashboard.quickLinks.salesHistory, href: '/selling/history', icon: TrendingUp },
    { name: dictionary.dashboard.navigation.financials || 'Financials', href: '/financials', icon: DollarSign },
    { name: dictionary.dashboard.navigation.marketing || 'Marketing', href: '/marketing', icon: Megaphone },
    { name: dictionary.dashboard.navigation.orders, href: '/buying/orders', icon: ShoppingBag },
    { name: dictionary.dashboard.navigation.reviews || 'Reviews', href: '/reviews/mobile', icon: Star },
    { name: dictionary.dashboard.navigation.messages, href: '/messages', icon: MessageCircle },
    { name: dictionary.dashboard.navigation.profile, href: '/profile', icon: User },
  ];

  const mobileNavigation = [
    { name: dictionary.web.global.navigation.browse, href: '/dashboard', icon: LayoutDashboard },
    { name: dictionary.web.global.navigation.sell, href: '/selling/new', icon: Plus },
    { name: dictionary.dashboard.navigation.orders, href: '/buying/orders', icon: ShoppingBag },
    { name: dictionary.dashboard.navigation.messages, href: '/messages', icon: MessageCircle },
    { name: dictionary.dashboard.navigation.profile, href: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 shadow-sm backdrop-blur-sm">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105 border border-primary/20">
                <span className="text-primary-foreground font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-200">Threadly</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium transition-all duration-200 border',
                          pathname === item.href
                            ? 'bg-primary text-primary-foreground shadow-sm border-primary'
                            : 'text-card-foreground hover:text-primary hover:bg-primary/10 hover:shadow-sm border-border hover:border-primary/30'
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
                          'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium transition-all duration-200 border',
                          pathname.startsWith('/admin')
                            ? 'bg-primary text-primary-foreground shadow-sm border-primary'
                            : 'text-card-foreground hover:text-primary hover:bg-primary/10 hover:shadow-sm border-border hover:border-primary/30'
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
                <div className="text-xs font-semibold leading-6 text-card-foreground/70 uppercase tracking-wider mb-1 pb-2 border-b border-border/50">
                  {dictionary.dashboard.dashboard.quickActions}
                </div>
                <ul role="list" className="-mx-2 mt-3 space-y-2">
                  <li>
                    <Link
                      href="/selling/new"
                      className="group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md border border-primary"
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
                      className="group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium text-card-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 hover:shadow-sm border border-border hover:border-primary/30"
                    >
                      <Crown className="h-5 w-5 shrink-0" />
                      {dictionary.dashboard.dashboard.recentOrders.browseShop}
                    </a>
                  </li>
                </ul>
              </li>

              {/* User Section */}
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-medium leading-6">
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

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 lg:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="min-h-[44px] min-w-[44px] touch-manipulation transition-all duration-200 active:scale-95"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>{dictionary.web.global.accessibility.openMenu}</SheetTitle>
            </SheetHeader>
            <nav className="mt-6">
              <ul role="list" className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium min-h-[48px] items-center transition-all duration-200 active:scale-95 touch-manipulation',
                        pathname === item.href
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      )}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
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
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium min-h-[48px] items-center transition-all duration-200 active:scale-95 touch-manipulation',
                        pathname.startsWith('/admin')
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      )}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <BarChart3 className="h-5 w-5 shrink-0" />
                      {dictionary.dashboard.admin.title}
                    </Link>
                  </li>
                )}
              </ul>

              <div className="mt-6 border-t border-border pt-6">
                <a
                  href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium min-h-[48px] items-center transition-all duration-200 active:scale-95 touch-manipulation text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Crown className="h-5 w-5 shrink-0" />
                  {dictionary.dashboard.dashboard.recentOrders.browseShop}
                </a>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2">
                  <div suppressHydrationWarning className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <UserButton />
                  </div>
                  <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <ModeToggle />
                  </div>
                  <SignOutButton>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="min-h-[44px] min-w-[44px] touch-manipulation transition-all duration-200 active:scale-95"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </SignOutButton>
                </div>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex flex-1 items-center justify-center">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105 border border-primary/20">
              <span className="text-primary-foreground font-bold">T</span>
            </div>
            <span className="text-xl font-bold group-hover:text-primary transition-colors duration-200">Threadly</span>
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

    </div>
  );
}