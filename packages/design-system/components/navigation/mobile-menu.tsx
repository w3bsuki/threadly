'use client';

import { X } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { MenuButton } from './menu-button';

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
    <Sheet onOpenChange={handleOpenChange} open={controlledOpen}>
      {showTrigger && (
        <SheetTrigger asChild>
          <MenuButton className={triggerClassName} isOpen={controlledOpen} />
        </SheetTrigger>
      )}
      <SheetContent
        className={cn('w-full max-w-sm p-0', contentClassName)}
        side={side}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
}
