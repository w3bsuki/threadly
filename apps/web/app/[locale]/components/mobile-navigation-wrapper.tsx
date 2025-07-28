'use client';

import { useState } from 'react';
import { MobileSearchBar } from './header/mobile-search-bar';
import { MobileBottomNav } from './mobile-bottom-nav';
import './mobile-nav-styles.css';

export function MobileNavigationWrapper() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onSearchOpen={() => setIsSearchOpen(true)} />

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <MobileSearchBar onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  );
}
