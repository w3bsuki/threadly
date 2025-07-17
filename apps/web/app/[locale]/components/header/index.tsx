'use client';

import { DesktopHeader } from './desktop-header';
import { MobileHeader } from './mobile-header';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-black md:bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-16">
          <MobileHeader />
          <DesktopHeader />
        </div>
      </div>
    </header>
  );
};