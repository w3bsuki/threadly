'use client';

import { usePathname } from 'next/navigation';
import { MobileNav } from '@repo/design-system/components/navigation';
import { Home, ShoppingBag, Heart, ShoppingCart } from 'lucide-react';
import { useI18n } from './providers/i18n-provider';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { dictionary, locale } = useI18n();

  const navItems = [
    {
      label: dictionary.web?.global?.navigation?.home || 'Home',
      href: `/${locale}`,
      icon: Home,
    },
    {
      label: dictionary.web?.global?.navigation?.shop || 'Shop',
      href: `/${locale}/products`,
      icon: ShoppingBag,
    },
    {
      label: dictionary.web?.global?.navigation?.favorites || 'Favorites',
      href: `/${locale}/favorites`,
      icon: Heart,
    },
    {
      label: dictionary.web?.global?.navigation?.cart || 'Cart',
      href: `/${locale}/cart`,
      icon: ShoppingCart,
      badge: 0, // This should come from cart context
    },
  ];

  return (
    <div className="md:hidden">
      <MobileNav items={navItems} currentPath={pathname} />
    </div>
  );
}