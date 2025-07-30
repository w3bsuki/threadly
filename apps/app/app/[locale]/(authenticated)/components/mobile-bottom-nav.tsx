'use client';

import { useCartStore } from '@repo/design-system/commerce';
import { Badge, Button } from '@repo/ui/components';
import { cn } from '@repo/ui/lib/utils';
import type { Dictionary } from '@repo/content/internationalization';
import {
  Heart,
  LayoutDashboard,
  MessageCircle,
  Plus,
  Search,
  ShoppingBag,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MobileBottomNavProps {
  className?: string;
  unreadMessages?: number;
  dictionary: Dictionary;
}

export function MobileBottomNav({
  className,
  unreadMessages = 0,
  dictionary,
}: MobileBottomNavProps): React.JSX.Element {
  const pathname = usePathname();
  const { getTotalItems } = useCartStore();
  const [cartItems, setCartItems] = useState(0);

  // Update cart items when store changes
  useEffect(() => {
    setCartItems(getTotalItems());
  }, [getTotalItems]);

  const navItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: dictionary.dashboard.navigation.dashboard,
      badge: null,
    },
    {
      href: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001/products',
      icon: Search,
      label: dictionary.web.global.navigation.browse,
      badge: null,
      isExternal: true,
    },
    {
      href: '/selling/new',
      icon: Plus,
      label: dictionary.web.global.navigation.sell,
      badge: null,
      isSpecial: true,
    },
    {
      href: '/messages',
      icon: MessageCircle,
      label: dictionary.dashboard.navigation.messages,
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    {
      href: '/profile',
      icon: User,
      label: dictionary.dashboard.navigation.profile,
      badge: null,
    },
  ];

  return (
    <>
      {/* Bottom Navigation */}
      <div
        className={cn(
          'fixed right-0 bottom-0 left-0 z-50 md:hidden',
          'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          'border-border border-t',
          'safe-area-padding-bottom', // Handle device safe areas
          className
        )}
      >
        <nav className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            const LinkComponent = item.isExternal ? 'a' : Link;
            const linkProps = item.isExternal
              ? {
                  href: item.href,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }
              : { href: item.href };

            return (
              <LinkComponent key={item.href} {...linkProps} className="flex-1">
                <Button
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                  className={cn(
                    'relative flex flex-col items-center justify-center',
                    'h-16 w-full gap-1 rounded-[var(--radius-lg)]',
                    'min-h-[44px] min-w-[44px]', // Ensure minimum touch target
                    'font-medium text-xs',
                    'hover:bg-accent/50 active:bg-accent',
                    'transition-colors duration-200',
                    item.isSpecial && [
                      'bg-primary text-primary-foreground',
                      'hover:bg-primary/90 active:bg-primary/80',
                      'shadow-lg shadow-primary/20',
                    ],
                    isActive &&
                      !item.isSpecial && [
                        'bg-primary/10 text-primary',
                        'hover:bg-primary/15',
                      ]
                  )}
                  size="sm"
                  variant="ghost"
                >
                  <div className="relative">
                    <Icon
                      className={cn('h-5 w-5', item.isSpecial && 'h-6 w-6')}
                    />

                    {/* Badge for notifications/cart items */}
                    {item.badge !== null && (
                      <Badge
                        className={cn(
                          '-top-2 -right-2 absolute',
                          'flex h-5 w-5 items-center justify-center',
                          'min-w-[20px] px-1 font-bold text-xs',
                          'fade-in-0 zoom-in-50 animate-in duration-200'
                        )}
                        variant="destructive"
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </Badge>
                    )}

                    {/* Cart badge for shopping bag icon */}
                    {item.href === '/buying/cart' && cartItems > 0 && (
                      <Badge
                        className={cn(
                          '-top-2 -right-2 absolute',
                          'flex h-5 w-5 items-center justify-center',
                          'min-w-[20px] px-1 font-bold text-xs',
                          'fade-in-0 zoom-in-50 animate-in duration-200'
                        )}
                        variant="destructive"
                      >
                        {cartItems > 99 ? '99+' : cartItems}
                      </Badge>
                    )}
                  </div>

                  <span
                    className={cn(
                      'text-[10px] leading-none',
                      'max-w-full truncate',
                      item.isSpecial && 'font-semibold'
                    )}
                  >
                    {item.label}
                  </span>
                </Button>
              </LinkComponent>
            );
          })}
        </nav>
      </div>

      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div aria-hidden="true" className="h-20 md:hidden" />
    </>
  );
}

// Secondary actions bottom sheet trigger (for less common actions)
export function SecondaryActionsNav({
  dictionary,
}: {
  dictionary: Dictionary;
}): React.JSX.Element {
  const { getTotalItems } = useCartStore();
  const [cartItems, setCartItems] = useState(0);

  useEffect(() => {
    setCartItems(getTotalItems());
  }, [getTotalItems]);

  const secondaryActions = [
    {
      href: '/buying/cart',
      icon: ShoppingBag,
      label: dictionary.web.global.navigation.cart || 'Cart',
      badge: cartItems > 0 ? cartItems : null,
    },
    {
      href: '/favorites',
      icon: Heart,
      label: dictionary.web.global.navigation.favorites || 'Favorites',
      badge: null,
    },
  ];

  return (
    <div className="fixed top-4 right-4 z-40 md:hidden">
      <div className="flex flex-col gap-2">
        {secondaryActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link href={action.href} key={action.href}>
              <Button
                aria-label={action.label}
                className={cn(
                  'relative h-12 w-12 rounded-[var(--radius-full)]',
                  'shadow-black/10 shadow-lg',
                  'bg-background/95 backdrop-blur',
                  'border border-border/50',
                  'hover:bg-accent active:bg-accent/80',
                  'transition-all duration-200'
                )}
                size="icon"
                variant="secondary"
              >
                <Icon className="h-5 w-5" />

                {action.badge !== null && action.badge > 0 && (
                  <Badge
                    className={cn(
                      '-top-1 -right-1 absolute',
                      'flex h-5 w-5 items-center justify-center',
                      'min-w-[20px] px-1 font-bold text-xs'
                    )}
                    variant="destructive"
                  >
                    {action.badge > 99 ? '99+' : action.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
