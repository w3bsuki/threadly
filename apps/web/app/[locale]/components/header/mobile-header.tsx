'use client';

import { Button } from '@repo/design-system/components';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { MobileActions } from './mobile-actions';
import { MobileMenu } from './mobile-menu';

export const MobileHeader = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Layout */}
      <div className="flex w-full items-center justify-between md:hidden">
        {/* Left: Hamburger */}
        <Button
          aria-controls="mobile-menu"
          aria-expanded={isMenuOpen}
          aria-label="Open navigation menu"
          className="-ml-2 h-9 w-9 text-background hover:bg-background/10"
          onClick={() => setMenuOpen(true)}
          size="icon"
          variant="ghost"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Center: Logo */}
        <Link className="-translate-x-1/2 absolute left-1/2" href="/">
          <span className="font-bold text-background text-xl">Threadly</span>
        </Link>

        {/* Right: Account */}
        <MobileActions />
      </div>

      {/* Full-Screen Mobile Menu Overlay */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};
