'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';
import { cn } from '../../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MenuButton } from './menu-button';

interface MobileDropdownMenuProps {
  sections?: Array<{
    title?: string;
    grid?: boolean;
    items: Array<{
      label: string;
      href?: string;
      onClick?: () => void;
      icon?: React.ComponentType<{ className?: string }>;
      emoji?: string;
      children?: Array<{
        label: string;
        href?: string;
        onClick?: () => void;
        emoji?: string;
      }>;
    }>;
  }>;
  triggerClassName?: string;
  contentClassName?: string;
  header?: ReactNode;
  footer?: ReactNode;
  align?: 'start' | 'center' | 'end';
}

export function MobileDropdownMenu({
  sections = [],
  triggerClassName,
  contentClassName,
  header,
  footer,
  align = 'end',
}: MobileDropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const renderMenuItem = (
    item: any,
    sectionIdx: number,
    itemIdx: number,
    isGrid = false
  ) => {
    const key = `${sectionIdx}-${itemIdx}`;
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <div className="relative" key={key}>
          <DropdownMenuItem
            className="group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 transition-colors duration-200 hover:bg-accent/80"
            onClick={(e) => {
              e.preventDefault();
              setActiveSubmenu(activeSubmenu === key ? null : key);
            }}
          >
            <div className="flex items-center gap-2">
              {item.emoji && <span className="text-lg">{item.emoji}</span>}
              {item.icon && (
                <item.icon className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            <ChevronRight
              className={cn(
                'h-3 w-3 text-muted-foreground transition-transform duration-200',
                activeSubmenu === key && 'rotate-90'
              )}
            />
          </DropdownMenuItem>

          {activeSubmenu === key && (
            <div className="slide-in-from-top-2 mt-1 ml-3 animate-in space-y-0.5 duration-200">
              {item.children.map((child: any, childIdx: number) => (
                <DropdownMenuItem
                  asChild={!!child.href}
                  className="rounded-md px-3 py-1.5 transition-colors duration-200 hover:bg-accent/60"
                  key={childIdx}
                >
                  {child.href ? (
                    <Link href={child.href} onClick={() => setOpen(false)}>
                      <div className="flex items-center gap-2">
                        {child.emoji && (
                          <span className="text-sm">{child.emoji}</span>
                        )}
                        <span className="text-xs">{child.label}</span>
                      </div>
                    </Link>
                  ) : (
                    <div
                      className="flex items-center gap-2"
                      onClick={() => {
                        child.onClick?.();
                        setOpen(false);
                      }}
                    >
                      {child.emoji && (
                        <span className="text-sm">{child.emoji}</span>
                      )}
                      <span className="text-xs">{child.label}</span>
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Grid item style
    if (isGrid) {
      return (
        <DropdownMenuItem
          asChild={!!item.href}
          className="group flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg p-3 transition-colors duration-200 hover:bg-accent/80"
          key={key}
        >
          {item.href ? (
            <Link href={item.href} onClick={() => setOpen(false)}>
              <div className="flex flex-col items-center gap-1">
                {item.emoji && <span className="text-2xl">{item.emoji}</span>}
                {item.icon && (
                  <item.icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-foreground" />
                )}
                <span className="font-medium text-xs">{item.label}</span>
              </div>
            </Link>
          ) : (
            <div
              className="flex flex-col items-center gap-1"
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
            >
              {item.emoji && <span className="text-2xl">{item.emoji}</span>}
              {item.icon && (
                <item.icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-foreground" />
              )}
              <span className="font-medium text-xs">{item.label}</span>
            </div>
          )}
        </DropdownMenuItem>
      );
    }

    // Regular menu item
    return (
      <DropdownMenuItem
        asChild={!!item.href}
        className="group cursor-pointer rounded-md px-3 py-2 transition-colors duration-200 hover:bg-accent/80"
        key={key}
      >
        {item.href ? (
          <Link href={item.href} onClick={() => setOpen(false)}>
            <div className="flex items-center gap-2">
              {item.emoji && <span className="text-lg">{item.emoji}</span>}
              {item.icon && (
                <item.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              )}
              <span className="font-medium text-sm">{item.label}</span>
            </div>
          </Link>
        ) : (
          <div
            className="flex items-center gap-2"
            onClick={() => {
              item.onClick?.();
              setOpen(false);
            }}
          >
            {item.emoji && <span className="text-lg">{item.emoji}</span>}
            {item.icon && (
              <item.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            )}
            <span className="font-medium text-sm">{item.label}</span>
          </div>
        )}
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <MenuButton
          className={cn('relative z-50', triggerClassName)}
          isOpen={open}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={cn(
          'max-h-[70vh] w-[280px] overflow-hidden',
          'bg-background/95 backdrop-blur-xl',
          'border-2 border-border/50',
          'shadow-2xl shadow-black/20',
          'rounded-xl',
          'p-1.5',
          'fade-in-0 zoom-in-95 animate-in duration-200',
          contentClassName
        )}
        sideOffset={8}
      >
        <div className="max-h-[calc(70vh-80px)] overflow-y-auto">
          {header && (
            <>
              <div className="mb-1">{header}</div>
              <DropdownMenuSeparator className="my-1" />
            </>
          )}

          {sections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {section.title && (
                <DropdownMenuLabel className="px-3 py-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  {section.title}
                </DropdownMenuLabel>
              )}
              <DropdownMenuGroup
                className={section.grid ? 'grid grid-cols-2 gap-1' : ''}
              >
                {section.items.map((item, itemIdx) =>
                  renderMenuItem(item, sectionIdx, itemIdx, section.grid)
                )}
              </DropdownMenuGroup>
              {sectionIdx < sections.length - 1 && (
                <DropdownMenuSeparator className="my-1.5" />
              )}
            </div>
          ))}
        </div>

        {footer && (
          <>
            <DropdownMenuSeparator className="my-1" />
            <div className="mt-1 px-1">{footer}</div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
