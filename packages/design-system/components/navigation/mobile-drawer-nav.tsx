'use client';

import { cn } from '../../lib/utils';
import { SheetHeader, SheetTitle } from '../ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import Link from 'next/link';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

interface DrawerNavItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
  badge?: number | string;
  onClick?: () => void;
  children?: DrawerNavItem[];
}

interface DrawerNavSection {
  title?: string;
  items: DrawerNavItem[];
}

interface MobileDrawerNavProps {
  sections: DrawerNavSection[];
  header?: ReactNode;
  footer?: ReactNode;
  currentPath?: string;
  onItemClick?: () => void;
}

export function MobileDrawerNav({
  sections,
  header,
  footer,
  currentPath,
  onItemClick,
}: MobileDrawerNavProps) {
  const renderNavItem = (item: DrawerNavItem, depth = 0) => {
    const Icon = item.icon;
    const isActive = item.href === currentPath;
    const hasChildren = item.children && item.children.length > 0;

    const content = (
      <div
        className={cn(
          'flex items-center justify-between w-full',
          'px-[var(--space-4)] py-[var(--space-3)]',
          'min-h-[48px]',
          depth > 0 && 'pl-[var(--space-12)]',
          isActive && 'bg-accent'
        )}
      >
        <div className="flex items-center gap-[var(--space-3)]">
          {Icon && <Icon className="h-5 w-5" />}
          <span className="text-[var(--font-size-sm)]">{item.label}</span>
        </div>
        {(item.badge || hasChildren) && (
          <div className="flex items-center gap-[var(--space-2)]">
            {item.badge && (
              <span className="text-[var(--font-size-xs)] text-muted-foreground">
                {item.badge}
              </span>
            )}
            {hasChildren && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        )}
      </div>
    );

    if (item.href) {
      return (
        <Link
          key={item.label}
          href={item.href}
          onClick={onItemClick}
          className="block"
        >
          {content}
        </Link>
      );
    }

    if (item.onClick) {
      return (
        <button
          key={item.label}
          onClick={() => {
            item.onClick?.();
            onItemClick?.();
          }}
          className="block w-full text-left"
        >
          {content}
        </button>
      );
    }

    return (
      <div key={item.label} className="block">
        {content}
        {hasChildren && (
          <div className="mt-[var(--space-1)]">
            {item.children?.map((child) => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {header && header}
      
      <ScrollArea className="flex-1">
        <div className="py-[var(--space-4)]">
          {sections.map((section, index) => (
            <div key={index} className="mb-[var(--space-4)]">
              {section.title && (
                <h3 className="px-[var(--space-4)] py-[var(--space-2)] text-[var(--font-size-xs)] font-medium text-muted-foreground">
                  {section.title}
                </h3>
              )}
              <div>{section.items.map(renderNavItem)}</div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {footer && (
        <div className="p-[var(--space-4)] border-t border-border">
          {footer}
        </div>
      )}
    </>
  );
}