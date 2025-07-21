'use client';

import { Button } from '@repo/design-system/components';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { CategoryMenu } from './components/category-menu';
import { MobileMenu } from './components/mobile-menu';
import { SearchBar } from './components/search-bar';
import { UserActions } from './components/user-actions';
import { useHeaderState } from './hooks/use-header-state';

export function UnifiedHeader() {
  const {
    showCategories,
    setShowCategories,
    expandedCategories,
    isMenuOpen,
    setMenuOpen,
    searchRef,
    categories,
    toggleCategoryExpansion,
    closeMenus,
    dictionary,
    locale,
  } = useHeaderState();

  return (
    <header className="sticky top-0 z-50 bg-foreground md:bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between md:h-16">
          {/* Mobile Layout */}
          <div className="flex w-full items-center justify-between md:hidden">
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

            <Link className="-translate-x-1/2 absolute left-1/2" href="/">
              <span className="font-bold text-background text-xl">Threadly</span>
            </Link>

            <UserActions
              locale={locale}
              onClose={closeMenus}
              variant="mobile"
            />
          </div>

          {/* Desktop Layout */}
          <div className="hidden w-full items-center justify-between md:flex">
            <Link className="flex items-center space-x-2" href="/">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-foreground">
                <span className="font-bold text-lg text-background">T</span>
              </div>
              <span className="font-bold text-foreground text-xl">Threadly</span>
            </Link>

            <SearchBar
              onToggleCategories={() => setShowCategories(!showCategories)}
              placeholder={
                dictionary.web.global.navigation?.searchPlaceholder ||
                'Search for items, brands, or members'
              }
              searchRef={searchRef}
              showCategories={showCategories}
            />

            {showCategories && (
              <CategoryMenu
                categories={categories}
                expandedCategories={expandedCategories}
                onClose={closeMenus}
                onToggleExpansion={toggleCategoryExpansion}
                variant="desktop"
              />
            )}

            <UserActions
              locale={locale}
              onClose={closeMenus}
              variant="desktop"
            />
          </div>

          <MobileMenu
            categories={categories}
            expandedCategories={expandedCategories}
            isOpen={isMenuOpen}
            locale={locale}
            onClose={closeMenus}
            onToggleExpansion={toggleCategoryExpansion}
          />
        </div>
      </div>
    </header>
  );
}
