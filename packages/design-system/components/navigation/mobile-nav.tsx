'use client';

import { cn } from '../../lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface MobileNavProps extends Omit<ButtonHTMLAttributes<HTMLDivElement>, 'children'> {
  items: NavItem[];
  currentPath?: string;
}

export const MobileNav = forwardRef<HTMLDivElement, MobileNavProps>(
  ({ className, items, currentPath, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-background/95 backdrop-blur-sm',
          'border-t border-border',
          'shadow-lg',
          'safe-area-pb',
          className
        )}
        {...props}
      >
        <div className="flex h-16 items-center justify-around px-[var(--space-2)]">
          {items.map((item) => {
            const isActive = currentPath === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center',
                  'h-full flex-1',
                  'min-w-[44px] touch-manipulation',
                  'transition-all duration-200 active:scale-95',
                  'rounded-[var(--radius-lg)]',
                  isActive && 'text-primary'
                )}
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
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-[var(--space-1)] text-[10px] font-medium',
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