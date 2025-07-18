'use client';

import { DesktopHeader } from './desktop-header';
import { MobileHeader } from './mobile-header';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-black md:bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between md:h-16">
          <MobileHeader />
          <DesktopHeader />
        </div>
      </div>
    </header>
  );
};
