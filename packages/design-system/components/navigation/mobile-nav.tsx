'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface MobileNavProps
  extends Omit<ButtonHTMLAttributes<HTMLDivElement>, 'children'> {
  items: NavItem[];
  currentPath?: string;
}

export const MobileNav = forwardRef<HTMLDivElement, MobileNavProps>(
  ({ className, items, currentPath, ...props }, ref) => {
    return (
      <nav
        className={cn(
          'fixed right-0 bottom-0 left-0 z-50',
          'bg-background/95 backdrop-blur-sm',
          'border-border border-t',
          'shadow-lg',
          'safe-area-pb',
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="flex h-16 items-center justify-around px-[var(--space-2)]">
          {items.map((item) => {
            const isActive = currentPath === item.href;
            const Icon = item.icon;

            return (
              <Link
                className={cn(
                  'relative flex flex-col items-center justify-center',
                  'h-full flex-1',
                  'min-w-[44px] touch-manipulation',
                  'transition-all duration-200 active:scale-95',
                  'rounded-[var(--radius-lg)]',
                  isActive && 'text-primary'
                )}
                href={item.href}
                key={item.href}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'h-6 w-6 transition-colors duration-200',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  {item.badge && item.badge > 0 && (
                    <span className="-right-2 -top-2 absolute flex h-5 w-5 items-center justify-center rounded-full bg-destructive font-bold text-[10px] text-destructive-foreground">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-[var(--space-1)] font-medium text-[10px]',
                    'transition-colors duration-200',
                    isActive ? 'text-primary' : 'text-muted-foreground'
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
);

MobileNav.displayName = 'MobileNav';
