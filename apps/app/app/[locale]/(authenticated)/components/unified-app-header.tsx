'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Header,
  MobileMenu,
  MobileDrawerNav,
  HeaderActions,
  StickyHeader,
} from '@repo/design-system/components/navigation';
import { Button } from '@repo/design-system/components';
import { UserButton } from '@repo/auth/client';
import {
  LayoutDashboard,
  Package,
  MessageCircle,
  User,
  Plus,
  ShoppingBag,
  Star,
  BarChart3,
  Sparkles,
  Crown,
  Settings,
  LogOut,
} from 'lucide-react';
import { NotificationBell } from './notification-bell';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { SignOutButton } from '@repo/auth/client';
import Link from 'next/link';
import type { Dictionary } from '@repo/internationalization';

interface UnifiedAppHeaderProps {
  dictionary: Dictionary;
  isAdmin?: boolean;
}

export function UnifiedAppHeader({ dictionary, isAdmin }: UnifiedAppHeaderProps) {
  const pathname = usePathname();

  const mainNavItems = [
    { 
      label: dictionary.dashboard.navigation.dashboard, 
      href: '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      label: dictionary.dashboard.navigation.listings, 
      href: '/selling/listings', 
      icon: Package 
    },
    { 
      label: 'Business', 
      href: '/business', 
      icon: BarChart3 
    },
    { 
      label: dictionary.dashboard.navigation.orders, 
      href: '/buying/orders', 
      icon: ShoppingBag 
    },
    { 
      label: 'Reviews', 
      href: '/reviews/mobile', 
      icon: Star 
    },
    { 
      label: dictionary.dashboard.navigation.messages, 
      href: '/messages', 
      icon: MessageCircle 
    },
    { 
      label: dictionary.dashboard.navigation.profile, 
      href: '/profile', 
      icon: User 
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
      sections={navigationSections}
      currentPath={pathname}
      header={
        <div className="flex flex-col gap-[var(--space-4)]">
          <Link href="/dashboard" className="flex items-center gap-[var(--space-3)]">
            <div className="h-10 w-10 rounded-[var(--radius-xl)] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg border border-primary/20">
              <span className="text-primary-foreground font-bold text-[var(--font-size-lg)]">T</span>
            </div>
            <span className="text-[var(--font-size-xl)] font-bold">Threadly</span>
          </Link>
          <div className="flex items-center gap-[var(--space-3)] p-3 bg-muted rounded-[var(--radius-lg)]">
            <UserButton />
            <div className="flex-1">
              <p className="text-[var(--font-size-sm)] font-medium">Your Account</p>
              <p className="text-[var(--font-size-xs)] text-muted-foreground">Manage profile & settings</p>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between">
          <ModeToggle />
          <SignOutButton>
            <Button 
              variant="outline"
              size="sm"
              className="transition-all active:scale-95"
            >
              <LogOut className="h-4 w-4 mr-[var(--space-2)]" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      }
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
        logo={{
          text: 'Threadly',
          href: '/dashboard',
        }}
        actions={<HeaderActions>{headerActions}</HeaderActions>}
        mobileMenuContent={mobileMenuContent}
        className="border-b border-border bg-card/50 backdrop-blur-sm"
      />
    </StickyHeader>
  );
}