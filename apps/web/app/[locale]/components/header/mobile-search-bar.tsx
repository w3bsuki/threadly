'use client';

import { Button } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { Filter, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '../navigation/categories';
import { useI18n } from '../providers/i18n-provider';

interface MobileSearchBarProps {
  onClose: () => void;
}

export const MobileSearchBar = ({ onClose }: MobileSearchBarProps) => {
  const { dictionary, locale } = useI18n();
  const [searchValue, setSearchValue] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimation();
  const y = useMotionValue(0);

  const categories = CATEGORIES.map((category) => ({
    ...category,
    name:
      dictionary.web.global.categories?.[
        category.name.toLowerCase() as keyof typeof dictionary.web.global.categories
      ] || category.name,
    href: `/${locale}${category.href}`,
    subcategories: category.subcategories.map((sub) => ({
      ...sub,
      href: `/${locale}${sub.href}`,
    })),
  }));

  useEffect(() => {
    searchInputRef.current?.focus();
    controls.start({ y: 0 });
  }, [controls]);

  // Swipe up gesture detection
  useEffect(() => {
    let startY = 0;
    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startY = touch.clientY;
      startX = touch.clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaY = startY - touch.clientY;
      const deltaX = Math.abs(touch.clientX - startX);

      // Swipe up detection
      if (deltaY > 50 && deltaX < 30 && startY > window.innerHeight - 100) {
        triggerHapticFeedback();
        // Expand search functionality here if needed
      }
    };

    document.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      window.location.href = `/${locale}/search?q=${encodeURIComponent(searchValue.trim())}`;
    }
  };

  return (
    <motion.div
      animate={controls}
      className="fixed inset-0 z-50 flex flex-col bg-background"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      initial={{ y: '100%' }}
      onDragEnd={(event, info) => {
        if (info.offset.y > 100) {
          onClose();
        }
      }}
      style={{ y }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Search Header */}
      <div className="flex items-center gap-3 border-gray-200 border-b p-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <form className="flex flex-1 items-center" onSubmit={handleSearch}>
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-muted-foreground/70" />
            <input
              aria-label="Search products"
              className="h-11 w-full rounded-[var(--radius-lg)] border border-gray-200 bg-muted pr-4 pl-10 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
                dictionary.web.global.navigation?.searchPlaceholder ||
                'Search for items, brands, or members'
              }
              ref={searchInputRef}
              type="text"
              value={searchValue}
            />
          </div>
        </form>

        <Button
          aria-expanded={showCategories}
          aria-label="Toggle categories"
          className={cn(
            'h-11 w-11 rounded-[var(--radius-lg)] transition-all',
            showCategories ? 'bg-secondary' : 'hover:bg-muted'
          )}
          onClick={() => {
            triggerHapticFeedback();
            setShowCategories(!showCategories);
          }}
          size="icon"
          variant="ghost"
        >
          <Filter className="h-5 w-5 text-muted-foreground" />
        </Button>

        <Button
          aria-label="Close search"
          className="h-11 w-11 rounded-[var(--radius-lg)] hover:bg-muted"
          onClick={() => {
            triggerHapticFeedback();
            onClose();
          }}
          size="icon"
          variant="ghost"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Search Content */}
      <div className="flex-1 overflow-y-auto">
        {showCategories ? (
          <div className="p-4">
            <h3 className="mb-4 font-medium text-foreground text-sm">
              Shop by Category
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <div
                  className="overflow-hidden rounded-[var(--radius-lg)] border border-gray-200"
                  key={category.name}
                >
                  <div className="flex items-center justify-between">
                    <Link
                      aria-label={`Browse ${category.name} category`}
                      className="flex flex-1 items-center gap-3 p-4 transition-colors hover:bg-muted"
                      href={category.href}
                      onClick={onClose}
                    >
                      <span aria-hidden="true" className="text-xl">
                        {category.icon}
                      </span>
                      <span className="font-medium text-foreground">
                        {category.name}
                      </span>
                    </Link>

                    {category.subcategories.length > 0 && (
                      <Button
                        aria-expanded={expandedCategories.includes(
                          category.name
                        )}
                        aria-label={`${expandedCategories.includes(category.name) ? 'Hide' : 'Show'} ${category.name} subcategories`}
                        className="m-2 h-11 min-w-[44px] px-3 font-medium text-muted-foreground text-xs hover:text-foreground"
                        onClick={() => {
                          triggerHapticFeedback();
                          toggleCategoryExpansion(category.name);
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        {expandedCategories.includes(category.name)
                          ? 'Less'
                          : 'More'}
                      </Button>
                    )}
                  </div>

                  {expandedCategories.includes(category.name) &&
                    category.subcategories.length > 0 && (
                      <div className="border-gray-200 border-t bg-muted">
                        <div className="grid grid-cols-2 gap-px bg-accent">
                          {category.subcategories.map((sub) => (
                            <Link
                              aria-label={`Browse ${sub.name} in ${category.name}${sub.popular ? ' - Popular' : ''}`}
                              className={`flex min-h-[44px] items-center gap-2 bg-muted p-3 transition-colors hover:bg-background ${
                                sub.popular ? 'ring-1 ring-blue-200' : ''
                              }`}
                              href={sub.href}
                              key={sub.name}
                              onClick={onClose}
                            >
                              <span aria-hidden="true" className="text-sm">
                                {sub.icon}
                              </span>
                              <span className="font-medium text-secondary-foreground text-sm">
                                {sub.name}
                              </span>
                              {sub.popular && (
                                <span
                                  aria-label="Popular"
                                  className="text-blue-600 text-xs"
                                >
                                  •
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4">
            {searchValue ? (
              <div className="py-8 text-center text-muted-foreground">
                <Search className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="text-sm">
                  Press enter to search for "{searchValue}"
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-3 font-medium text-foreground text-sm">
                    Quick Links
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: 'New Arrivals', href: '/products?sort=newest' },
                      { label: 'Trending Now', href: '/products?sort=popular' },
                      { label: 'On Sale', href: '/sales' },
                      { label: 'All Brands', href: '/brands' },
                    ].map((link) => (
                      <Link
                        className="block rounded-[var(--radius-lg)] px-3 py-2 text-secondary-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
                        href={link.href}
                        key={link.label}
                        onClick={onClose}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
