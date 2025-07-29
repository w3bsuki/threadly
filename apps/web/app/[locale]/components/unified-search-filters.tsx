'use client';

import { Button } from '@repo/ui/components';
import { Grid3x3, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, type Subcategory } from './navigation/categories';
import { useI18n } from './providers/i18n-provider';

interface UnifiedSearchFiltersProps {
  totalCount?: number;
}

export const UnifiedSearchFilters = ({
  totalCount,
}: UnifiedSearchFiltersProps) => {
  const { dictionary, locale } = useI18n();
  const [showCategories, setShowCategories] = useState(false);
  const [_isSearchFocused, setIsSearchFocused] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const categories = CATEGORIES.map((category) => {
    const translatedName =
      dictionary?.web?.global?.categories?.[
        category.name.toLowerCase() as keyof typeof dictionary.web.global.categories
      ] ||
      dictionary?.web?.global?.collections?.[
        category.name.toLowerCase() as keyof typeof dictionary.web.global.collections
      ] ||
      category.name;

    return {
      ...category,
      name: translatedName,
      href: `/${locale}${category.href}`,
      subcategories: category.subcategories.map((sub) => ({
        ...sub,
        href: `/${locale}${sub.href}`,
      })),
    };
  });

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="relative border-gray-100 border-b bg-background"
      ref={containerRef}
    >
      <div className="px-4 py-2">
        <div className="rounded-[var(--radius-lg)] border border-gray-200 bg-muted shadow-sm">
          {/* Search Bar with Category Dropdown */}
          <div className="relative">
            <div className="flex items-center">
              {/* Category Dropdown Button - Left Side */}
              <button
                className={`flex items-center gap-1.5 rounded-l-lg border-gray-200 border-r px-3 py-2.5 transition-all ${
                  showCategories
                    ? 'bg-primary text-background'
                    : 'bg-primary text-background hover:bg-primary/90'
                }`}
                onClick={() => setShowCategories(!showCategories)}
              >
                <Grid3x3 className="h-4 w-4" />
                <span className="xs:inline hidden font-medium text-xs">
                  Categories
                </span>
              </button>

              {/* Search Input */}
              <div className="flex flex-1 items-center px-3">
                <Search className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground/70" />
                <input
                  className="w-full bg-transparent py-2.5 text-sm placeholder-gray-500 transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onBlur={() => setIsSearchFocused(false)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={
                    dictionary.web.global.navigation?.searchPlaceholder ||
                    'Search items...'
                  }
                  type="text"
                />
              </div>
            </div>

            {/* Categories Dropdown */}
            {showCategories && (
              <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-[var(--radius-xl)] border border-gray-200 bg-background shadow-lg">
                <div className="p-3">
                  <h3 className="mb-2 px-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                    Categories
                  </h3>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <div
                        className="overflow-hidden rounded-[var(--radius-lg)] border border-gray-200"
                        key={category.name}
                      >
                        <div className="flex items-center">
                          <Link
                            aria-label={`Browse ${category.name} category`}
                            className="flex flex-1 items-center gap-2 px-3 py-2.5 transition-colors hover:bg-muted active:scale-95"
                            href={category.href}
                            onClick={() => setShowCategories(false)}
                          >
                            <span aria-hidden="true" className="text-lg">
                              🛍️
                            </span>
                            <span className="font-medium text-foreground text-sm">
                              {category.name}
                            </span>
                          </Link>

                          {category.subcategories &&
                            category.subcategories.length > 0 && (
                              <Button
                                aria-expanded={expandedCategories.includes(
                                  category.name
                                )}
                                aria-label={`${expandedCategories.includes(category.name) ? 'Hide' : 'Show'} ${category.name} subcategories`}
                                className="m-1 h-8 px-2 font-medium text-muted-foreground text-xs hover:text-foreground"
                                onClick={() =>
                                  toggleCategoryExpansion(category.name)
                                }
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
                          category.subcategories && (
                            <div className="border-gray-200 border-t bg-muted">
                              <div className="grid grid-cols-2 gap-px bg-accent p-1">
                                {category.subcategories
                                  .slice(0, 4)
                                  .map((sub) => (
                                    <Link
                                      aria-label={`Browse ${sub.name} in ${category.name}${sub.popular ? ' - Popular' : ''}`}
                                      className={`flex items-center gap-1.5 rounded-[var(--radius-md)] bg-background px-2 py-2 transition-colors hover:bg-muted active:scale-95 ${
                                        sub.popular
                                          ? 'ring-1 ring-blue-200'
                                          : ''
                                      }`}
                                      href={sub.href}
                                      key={sub.name}
                                      onClick={() => setShowCategories(false)}
                                    >
                                      <span
                                        aria-hidden="true"
                                        className="text-sm"
                                      >
                                        ✨
                                      </span>
                                      <span className="font-medium text-secondary-foreground text-xs">
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
                                {category.subcategories.length > 4 && (
                                  <Link
                                    className="col-span-2 flex items-center justify-center gap-1 rounded-[var(--radius-md)] bg-blue-50 px-2 py-2 transition-colors hover:bg-blue-100 active:scale-95"
                                    href={category.href}
                                    onClick={() => setShowCategories(false)}
                                  >
                                    <span className="font-medium text-blue-600 text-xs">
                                      View all {category.subcategories.length}{' '}
                                      items
                                    </span>
                                  </Link>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-3 border-gray-100 border-t pt-3">
                    <div className="flex gap-1">
                      <Link
                        className="flex-1 rounded-[var(--radius-md)] bg-primary px-3 py-2 text-center font-medium text-background text-xs transition-colors hover:bg-primary/90"
                        href="/products?condition=NEW_WITH_TAGS"
                        onClick={() => setShowCategories(false)}
                      >
                        NEW
                      </Link>
                      <Link
                        className="flex-1 rounded-[var(--radius-md)] bg-orange-500 px-3 py-2 text-center font-medium text-background text-xs transition-colors hover:bg-orange-600"
                        href="/products?sort=popular"
                        onClick={() => setShowCategories(false)}
                      >
                        TRENDING
                      </Link>
                      <Link
                        className="flex-1 rounded-[var(--radius-md)] bg-red-500 px-3 py-2 text-center font-medium text-background text-xs transition-colors hover:bg-red-600"
                        href="/products?sale=true"
                        onClick={() => setShowCategories(false)}
                      >
                        ON SALE
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
