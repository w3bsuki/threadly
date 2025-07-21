'use client';

import { ReactNode } from 'react';
import { UnifiedAppHeader } from './unified-app-header';
import { AppSidebar } from './app-sidebar';
import { MobileNav } from '@repo/design-system/components/navigation';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageCircle,
  User,
} from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';

interface AppLayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
  dictionary: Dictionary;
}

export function AppLayout({ children, isAdmin, dictionary }: AppLayoutProps) {
  const pathname = usePathname();

  const mobileNavItems = [
    { 
      label: dictionary.web.global.navigation.browse || 'Browse', 
      href: '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      label: dictionary.web.global.navigation.sell || 'Sell', 
      href: '/selling/new', 
      icon: Package 
    },
    { 
      label: dictionary.dashboard.navigation.orders, 
      href: '/buying/orders', 
      icon: ShoppingBag 
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

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <AppSidebar dictionary={dictionary} isAdmin={isAdmin} />

      {/* Mobile/Tablet Header */}
      <div className="lg:hidden">
        <UnifiedAppHeader dictionary={dictionary} isAdmin={isAdmin} />
      </div>

      {/* Main Content */}
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="px-[var(--space-4)] py-[var(--space-6)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileNav items={mobileNavItems} currentPath={pathname} />
      </div>
    </div>
  );
}