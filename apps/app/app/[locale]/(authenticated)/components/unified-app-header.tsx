'use client';

import { SignOutButton, UserButton } from '@repo/auth/client';
import { Button } from '@repo/ui/components';
import { ModeToggle } from '@repo/ui/components/mode-toggle';
import {
  Header,
  HeaderActions,
  MobileDrawerNav,
  MobileMenu,
  StickyHeader,
} from '@repo/ui/components/navigation';
import type { Dictionary } from '@repo/internationalization';
import {
  BarChart3,
  Crown,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NotificationBell } from './notification-bell';

interface UnifiedAppHeaderProps {
  dictionary: Dictionary;
  isAdmin?: boolean;
}

export function UnifiedAppHeader({
  dictionary,
  isAdmin,
}: UnifiedAppHeaderProps) {
  const pathname = usePathname();

  const mainNavItems = [
    {
      label: dictionary.dashboard.navigation.dashboard,
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: dictionary.dashboard.navigation.listings,
      href: '/selling/listings',
      icon: Package,
    },
    {
      label: 'Business',
      href: '/business',
      icon: BarChart3,
    },
    {
      label: dictionary.dashboard.navigation.orders,
      href: '/buying/orders',
      icon: ShoppingBag,
    },
    {
      label: 'Reviews',
      href: '/reviews/mobile',
      icon: Star,
    },
    {
      label: dictionary.dashboard.navigation.messages,
      href: '/messages',
      icon: MessageCircle,
    },
    {
      label: dictionary.dashboard.navigation.profile,
      href: '/profile',
      icon: User,
    },
  ];

  if (isAdmin) {
    mainNavItems.push({
      label: dictionary.dashboard.admin.title,
      href: '/admin',
      icon: BarChart3,
    });
  }

  const quickActions = [
    {
      label: dictionary.dashboard.dashboard.actions.listNewItem,
      href: '/selling/new',
      icon: Sparkles,
    },
    {
      label: dictionary.dashboard.dashboard.recentOrders.browseShop,
      href: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001',
      icon: Crown,
    },
  ];

  const navigationSections = [
    {
      title: 'Main Navigation',
      items: mainNavItems,
    },
    {
      title: dictionary.dashboard.dashboard.quickActions,
      items: quickActions,
    },
  ];

  const mobileMenuContent = (
    <MobileDrawerNav
      currentPath={pathname}
      footer={
        <div className="flex items-center justify-between">
          <ModeToggle />
          <SignOutButton>
            <Button
              className="transition-all active:scale-95"
              size="sm"
              variant="outline"
            >
              <LogOut className="mr-[var(--space-2)] h-4 w-4" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      }
      header={
        <div className="flex flex-col gap-[var(--space-4)]">
          <Link
            className="flex items-center gap-[var(--space-3)]"
            href="/dashboard"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-xl)] border border-primary/20 bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <span className="font-bold text-[var(--font-size-lg)] text-primary-foreground">
                T
              </span>
            </div>
            <span className="font-bold text-[var(--font-size-xl)]">
              Threadly
            </span>
          </Link>
          <div className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] bg-muted p-3">
            <UserButton />
            <div className="flex-1">
              <p className="font-medium text-[var(--font-size-sm)]">
                Your Account
              </p>
              <p className="text-[var(--font-size-xs)] text-muted-foreground">
                Manage profile & settings
              </p>
            </div>
          </div>
        </div>
      }
      sections={navigationSections}
    />
  );

  const headerActions = (
    <>
      <NotificationBell />
      <div className="hidden md:block">
        <ModeToggle />
      </div>
      <div className="hidden md:block">
        <UserButton />
      </div>
    </>
  );

  return (
    <StickyHeader hideOnScroll={false}>
      <Header
        actions={<HeaderActions>{headerActions}</HeaderActions>}
        className="border-border border-b bg-card/50 backdrop-blur-sm"
        logo={{
          text: 'Threadly',
          href: '/dashboard',
        }}
        mobileMenuContent={mobileMenuContent}
      />
    </StickyHeader>
  );
}
