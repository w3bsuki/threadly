'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '../navigation/categories';
import { useI18n } from '../providers/i18n-provider';
import { ActionButtons } from './action-buttons';
import { CategoriesDropdown } from './categories-dropdown';
import { SearchBar } from './search-bar';

export const DesktopHeader = () => {
  const { dictionary, locale } = useI18n();
  const [showCategories, setShowCategories] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const categories = CATEGORIES.map((category) => {
    const translatedName =
      dictionary.web.global.categories?.[
        category.name.toLowerCase() as keyof typeof dictionary.web.global.categories
      ] || category.name;

    return {
      ...category,
      name: translatedName,
      href: `/${locale}${category.href}` as const,
      subcategories: category.subcategories.map((sub) => ({
        ...sub,
        href: `/${locale}${sub.href}` as const,
      })),
    };
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideDesktop =
        searchRef.current && !searchRef.current.contains(target);

      if (isOutsideDesktop) {
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="hidden w-full items-center justify-between md:flex">
      {/* Left: Logo */}
      <Link className="flex items-center space-x-2" href="/">
        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-foreground">
          <span className="font-bold text-background text-lg">T</span>
        </div>
        <span className="font-bold text-foreground text-xl">Threadly</span>
      </Link>

      {/* Center: Search Bar with Categories Button Inside */}
      <div className="mx-4 max-w-2xl flex-1 md:mx-8">
        <SearchBar
          onToggleCategories={() => setShowCategories(!showCategories)}
          ref={searchRef}
          showCategories={showCategories}
        />
        {showCategories && (
          <CategoriesDropdown
            categories={categories}
            onClose={() => setShowCategories(false)}
          />
        )}
      </div>

      {/* Right: Actions */}
      <ActionButtons />
    </div>
  );
};
