'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';
import { ReactNode } from 'react';
import { MenuButton } from './menu-button';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

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

  const renderMenuItem = (item: any, sectionIdx: number, itemIdx: number, isGrid: boolean = false) => {
    const key = `${sectionIdx}-${itemIdx}`;
    const hasChildren = item.children && item.children.length > 0;
    
    if (hasChildren) {
      return (
        <div key={key} className="relative">
          <DropdownMenuItem
            className="flex items-center justify-between px-3 py-2 hover:bg-accent/80 transition-colors duration-200 cursor-pointer rounded-md group"
            onClick={(e) => {
              e.preventDefault();
              setActiveSubmenu(activeSubmenu === key ? null : key);
            }}
          >
            <div className="flex items-center gap-2">
              {item.emoji && <span className="text-lg">{item.emoji}</span>}
              {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <ChevronRight 
              className={cn(
                "h-3 w-3 text-muted-foreground transition-transform duration-200",
                activeSubmenu === key && "rotate-90"
              )}
            />
          </DropdownMenuItem>
          
          {activeSubmenu === key && (
            <div className="ml-3 mt-1 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
              {item.children.map((child: any, childIdx: number) => (
                <DropdownMenuItem
                  key={childIdx}
                  className="px-3 py-1.5 hover:bg-accent/60 transition-colors duration-200 rounded-md"
                  asChild={!!child.href}
                >
                  {child.href ? (
                    <Link href={child.href} onClick={() => setOpen(false)}>
                      <div className="flex items-center gap-2">
                        {child.emoji && <span className="text-sm">{child.emoji}</span>}
                        <span className="text-xs">{child.label}</span>
                      </div>
                    </Link>
                  ) : (
                    <div 
                      onClick={() => {
                        child.onClick?.();
                        setOpen(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      {child.emoji && <span className="text-sm">{child.emoji}</span>}
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
          key={key}
          className="flex flex-col items-center justify-center gap-1 p-3 hover:bg-accent/80 transition-colors duration-200 cursor-pointer rounded-lg group"
          asChild={!!item.href}
        >
          {item.href ? (
            <Link href={item.href} onClick={() => setOpen(false)}>
              <div className="flex flex-col items-center gap-1">
                {item.emoji && <span className="text-2xl">{item.emoji}</span>}
                {item.icon && <item.icon className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />}
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          ) : (
            <div 
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              className="flex flex-col items-center gap-1"
            >
              {item.emoji && <span className="text-2xl">{item.emoji}</span>}
              {item.icon && <item.icon className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />}
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          )}
        </DropdownMenuItem>
      );
    }

    // Regular menu item
    return (
      <DropdownMenuItem
        key={key}
        className="px-3 py-2 hover:bg-accent/80 transition-colors duration-200 cursor-pointer rounded-md group"
        asChild={!!item.href}
      >
        {item.href ? (
          <Link href={item.href} onClick={() => setOpen(false)}>
            <div className="flex items-center gap-2">
              {item.emoji && <span className="text-lg">{item.emoji}</span>}
              {item.icon && <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          </Link>
        ) : (
          <div 
            onClick={() => {
              item.onClick?.();
              setOpen(false);
            }}
            className="flex items-center gap-2"
          >
            {item.emoji && <span className="text-lg">{item.emoji}</span>}
            {item.icon && <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        )}
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <MenuButton
          isOpen={open}
          className={cn(
            "relative z-50",
            triggerClassName
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={8}
        className={cn(
          "w-[280px] max-h-[70vh] overflow-hidden",
          "bg-background/95 backdrop-blur-xl",
          "border-2 border-border/50",
          "shadow-2xl shadow-black/20",
          "rounded-xl",
          "p-1.5",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          contentClassName
        )}
      >
        <div className="overflow-y-auto max-h-[calc(70vh-80px)]">
          {header && (
            <>
              <div className="mb-1">{header}</div>
              <DropdownMenuSeparator className="my-1" />
            </>
          )}
          
          {sections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {section.title && (
                <DropdownMenuLabel className="px-3 py-1.5 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  {section.title}
                </DropdownMenuLabel>
              )}
              <DropdownMenuGroup className={section.grid ? "grid grid-cols-2 gap-1" : ""}>
                {section.items.map((item, itemIdx) => renderMenuItem(item, sectionIdx, itemIdx, section.grid))}
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