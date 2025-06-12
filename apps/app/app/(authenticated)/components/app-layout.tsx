'use client';

import { UserButton } from '@repo/auth/client';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/design-system/components/ui/sheet';
import { cn } from '@repo/design-system/lib/utils';
import {
  HomeIcon,
  PackageIcon,
  MessageCircleIcon,
  UserIcon,
  MenuIcon,
  PlusIcon,
  TrendingUpIcon,
  ShoppingBagIcon,
  SettingsIcon,
  LogOutIcon,
  HeartIcon,
  BarChartIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, ReactNode } from 'react';
import { NotificationBell } from './notification-bell';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { SignOutButton } from '@repo/auth/client';

interface AppLayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'My Listings', href: '/selling/listings', icon: PackageIcon },
  { name: 'Sales', href: '/selling/history', icon: TrendingUpIcon },
  { name: 'Orders', href: '/buying/orders', icon: ShoppingBagIcon },
  { name: 'Messages', href: '/messages', icon: MessageCircleIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

const mobileNavigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Sell', href: '/selling/new', icon: PlusIcon },
  { name: 'Orders', href: '/buying/orders', icon: ShoppingBagIcon },
  { name: 'Messages', href: '/messages', icon: MessageCircleIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

export function AppLayout({ children, isAdmin }: AppLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-background px-6">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-xl font-semibold text-black">Threadly</span>
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
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium',
                          pathname === item.href
                            ? 'bg-gray-100 text-black'
                            : 'text-gray-600 hover:text-black hover:bg-gray-50'
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
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors',
                          pathname.startsWith('/admin')
                            ? 'bg-secondary text-secondary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        )}
                      >
                        <BarChartIcon className="h-5 w-5 shrink-0" />
                        Admin Panel
                      </Link>
                    </li>
                  )}
                </ul>
              </li>

              {/* Quick Actions */}
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400">
                  Quick Actions
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  <li>
                    <Link
                      href="/selling/new"
                      className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium bg-black text-white hover:bg-gray-800"
                    >
                      <PlusIcon className="h-5 w-5 shrink-0" />
                      List New Item
                    </Link>
                  </li>
                  <li>
                    <a
                      href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium text-gray-600 hover:text-black hover:bg-gray-50"
                    >
                      <HeartIcon className="h-5 w-5 shrink-0" />
                      Browse Shop
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
            <Button variant="ghost" size="icon" className="-m-2.5 p-2.5">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-6">
              <ul role="list" className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium',
                        pathname === item.href
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
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
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium',
                        pathname.startsWith('/admin')
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      )}
                    >
                      <BarChartIcon className="h-5 w-5 shrink-0" />
                      Admin Panel
                    </Link>
                  </li>
                )}
              </ul>

              <div className="mt-6 border-t border-border pt-6">
                <a
                  href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                >
                  <HeartIcon className="h-5 w-5 shrink-0" />
                  Browse Shop
                </a>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2">
                  <div suppressHydrationWarning>
                    <UserButton />
                  </div>
                  <ModeToggle />
                  <SignOutButton>
                    <Button variant="ghost" size="icon">
                      <LogOutIcon className="h-5 w-5" />
                    </Button>
                  </SignOutButton>
                </div>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex flex-1 items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">T</span>
            </div>
            <span className="text-xl font-semibold">Threadly</span>
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <NotificationBell />
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="grid grid-cols-5 gap-1">
          {mobileNavigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-1 text-xs',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5 mb-1',
                  item.href === '/selling/new' && 'h-6 w-6'
                )} />
                <span className={cn(
                  'text-[10px]',
                  item.href === '/selling/new' && 'font-semibold'
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}