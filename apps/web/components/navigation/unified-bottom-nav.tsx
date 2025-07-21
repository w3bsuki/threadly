'use client';

import { useUser } from '@repo/auth/client';
import { Badge } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { Home, Search, Plus, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { env } from '@/env';
import { useI18n } from '../../app/[locale]/components/providers/i18n-provider';

interface UnifiedBottomNavProps {
  cartCount?: number;
  unreadMessages?: number;
  className?: string;
}

export function UnifiedBottomNav({
  cartCount = 0,
  unreadMessages = 0,
  className,
}: UnifiedBottomNavProps) {
  const pathname = usePathname();
  const { locale, dictionary } = useI18n();
  const { isSignedIn } = useUser();

  const navItems = [
    {
      href: `/${locale}`,
      label: dictionary.web?.global?.navigation?.home || 'Home',
      icon: Home,
      active: pathname === `/${locale}` || pathname === `/${locale}/`,
    },
    {
      href: `/${locale}/search`,
      label: dictionary.web?.global?.navigation?.browse || 'Search',
      icon: Search,
      active: pathname.startsWith(`/${locale}/search`) || pathname.startsWith(`/${locale}/browse`) || pathname.startsWith(`/${locale}/categories`) || pathname.startsWith(`/${locale}/products`),
    },
    {
      href: isSignedIn 
        ? `/${locale}/selling/new`
        : `/${locale}/sign-in`,
      label: dictionary.web?.global?.navigation?.sell || 'Sell',
      icon: Plus,
      active: pathname.startsWith(`/${locale}/selling/new`),
      isAction: true,
    },
    {
      href: `/${locale}/cart`,
      label: dictionary.web?.global?.navigation?.cart || 'Cart',
      icon: ShoppingCart,
      active: pathname.startsWith(`/${locale}/cart`),
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      href: `/${locale}/account`,
      label: dictionary.web?.global?.navigation?.profile || 'Account',
      icon: User,
      active: pathname.startsWith(`/${locale}/account`) || pathname.startsWith(`/${locale}/profile`) || pathname.startsWith(`/${locale}/messages`) || pathname.startsWith(`/${locale}/favorites`),
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
  ];

  return (
    <nav
      className={cn(
        'fixed right-0 bottom-0 left-0 z-50 border-border border-t bg-background',
        'safe-area-pb',
        className
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                'flex min-h-[48px] flex-col items-center justify-center rounded-lg px-2 py-1 transition-colors',
                'group relative',
                item.active
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                item.isAction && 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              href={item.href}
              key={item.href}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'transition-transform group-active:scale-95',
                    item.isAction && 'text-primary-foreground'
                  )}
                  size={20}
                />
                {item.badge && (
                  <Badge
                    className="-top-2 -right-2 absolute flex h-4 w-4 items-center justify-center p-0 text-xs"
                    variant="destructive"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span
                className={cn(
                  'mt-1 font-medium text-xs',
                  item.isAction && 'text-primary-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
