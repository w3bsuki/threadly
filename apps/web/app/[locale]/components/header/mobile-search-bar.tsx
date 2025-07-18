'use client';

import { Button } from '@repo/design-system/components';
import { Filter, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Search Header */}
      <div className="flex items-center gap-3 border-gray-200 border-b p-4">
        <form className="flex flex-1 items-center" onSubmit={handleSearch}>
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
            <input
              aria-label="Search products"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
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
          className={`h-11 w-11 rounded-lg transition-all ${
            showCategories ? 'bg-gray-100' : 'hover:bg-gray-50'
          }`}
          onClick={() => setShowCategories(!showCategories)}
          size="icon"
          variant="ghost"
        >
          <Filter className="h-5 w-5 text-gray-600" />
        </Button>

        <Button
          aria-label="Close search"
          className="h-11 w-11 rounded-lg hover:bg-gray-50"
          onClick={onClose}
          size="icon"
          variant="ghost"
        >
          <X className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      {/* Search Content */}
      <div className="flex-1 overflow-y-auto">
        {showCategories ? (
          <div className="p-4">
            <h3 className="mb-4 font-medium text-gray-900 text-sm">
              Shop by Category
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <div
                  className="overflow-hidden rounded-lg border border-gray-200"
                  key={category.name}
                >
                  <div className="flex items-center justify-between">
                    <Link
                      aria-label={`Browse ${category.name} category`}
                      className="flex flex-1 items-center gap-3 p-4 transition-colors hover:bg-gray-50"
                      href={category.href}
                      onClick={onClose}
                    >
                      <span aria-hidden="true" className="text-xl">
                        {category.icon}
                      </span>
                      <span className="font-medium text-gray-900">
                        {category.name}
                      </span>
                    </Link>

                    {category.subcategories.length > 0 && (
                      <Button
                        aria-expanded={expandedCategories.includes(
                          category.name
                        )}
                        aria-label={`${expandedCategories.includes(category.name) ? 'Hide' : 'Show'} ${category.name} subcategories`}
                        className="m-2 h-10 min-w-[44px] px-3 font-medium text-gray-600 text-xs hover:text-gray-900"
                        onClick={() => toggleCategoryExpansion(category.name)}
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
                      <div className="border-gray-200 border-t bg-gray-50">
                        <div className="grid grid-cols-2 gap-px bg-gray-200">
                          {category.subcategories.map((sub) => (
                            <Link
                              aria-label={`Browse ${sub.name} in ${category.name}${(sub as any).popular ? ' - Popular' : ''}`}
                              className={`flex min-h-[44px] items-center gap-2 bg-gray-50 p-3 transition-colors hover:bg-white ${
                                (sub as any).popular
                                  ? 'ring-1 ring-blue-200'
                                  : ''
                              }`}
                              href={sub.href}
                              key={sub.name}
                              onClick={onClose}
                            >
                              <span aria-hidden="true" className="text-sm">
                                {sub.icon}
                              </span>
                              <span className="font-medium text-gray-700 text-sm">
                                {sub.name}
                              </span>
                              {(sub as any).popular && (
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
              <div className="py-8 text-center text-gray-500">
                <Search className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="text-sm">
                  Press enter to search for "{searchValue}"
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-3 font-medium text-gray-900 text-sm">
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
                        className="block rounded-lg px-3 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50 hover:text-black"
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
    </div>
  );
};
