'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '../ui/sheet';
import { cn } from '../../lib/utils';
import { ReactNode } from 'react';
import { MenuButton } from './menu-button';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface MobileMenuProps {
  children: ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  side?: 'left' | 'right';
  showTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MobileMenu({
  children,
  triggerClassName,
  contentClassName,
  side = 'right',
  showTrigger = true,
  open,
  onOpenChange,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const controlledOpen = open !== undefined ? open : isOpen;
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <Sheet open={controlledOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <SheetTrigger asChild>
          <MenuButton
            isOpen={controlledOpen}
            className={triggerClassName}
          />
        </SheetTrigger>
      )}
      <SheetContent
        side={side}
        className={cn(
          'w-full max-w-sm p-0',
          contentClassName
        )}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
}