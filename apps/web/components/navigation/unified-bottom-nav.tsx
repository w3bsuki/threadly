'use client';

import { Badge } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { Heart, Home, MessageSquare, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface UnifiedBottomNavProps {
  unreadMessages?: number;
  favoriteCount?: number;
  className?: string;
}

export function UnifiedBottomNav({
  unreadMessages = 0,
  favoriteCount = 0,
  className,
}: UnifiedBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      active: pathname === '/',
    },
    {
      href: '/browse',
      label: 'Browse',
      icon: Search,
      active: pathname.startsWith('/browse') || pathname.startsWith('/search'),
    },
    {
      href: '/selling/new',
      label: 'Sell',
      icon: Plus,
      active: pathname.startsWith('/selling/new'),
      isAction: true,
    },
    {
      href: '/favorites',
      label: 'Favorites',
      icon: Heart,
      active: pathname.startsWith('/favorites'),
      badge: favoriteCount > 0 ? favoriteCount : undefined,
    },
    {
      href: '/messages',
      label: 'Messages',
      icon: MessageSquare,
      active: pathname.startsWith('/messages'),
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
  ];

  return (
    <nav
      className={cn(
        'fixed right-0 bottom-0 left-0 z-50 border-gray-200 border-t bg-white',
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
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                item.isAction && 'bg-black text-white hover:bg-gray-800'
              )}
              href={item.href}
              key={item.href}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'transition-transform group-active:scale-95',
                    item.isAction && 'text-white'
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
                  item.isAction && 'text-white'
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
