'use client';

import { Button } from '@repo/design-system/components';
import { Search, X, Filter } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../providers/i18n-provider';
import { CATEGORIES } from '../navigation/categories';
import Link from 'next/link';

interface MobileSearchBarProps {
  onClose: () => void;
}

export const MobileSearchBar = ({ onClose }: MobileSearchBarProps) => {
  const { dictionary, locale } = useI18n();
  const [searchValue, setSearchValue] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = CATEGORIES.map(category => ({
    ...category,
    name: dictionary.web.global.categories?.[category.name.toLowerCase() as keyof typeof dictionary.web.global.categories] || category.name,
    href: `/${locale}${category.href}`,
    subcategories: category.subcategories.map(sub => ({
      ...sub,
      href: `/${locale}${sub.href}`
    }))
  }));

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
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
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Search Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <form onSubmit={handleSearch} className="flex-1 flex items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={dictionary.web.global.navigation?.searchPlaceholder || "Search for items, brands, or members"}
              className="w-full pl-10 pr-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              aria-label="Search products"
            />
          </div>
        </form>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowCategories(!showCategories)}
          className={`h-11 w-11 rounded-lg transition-all ${
            showCategories ? 'bg-gray-100' : 'hover:bg-gray-50'
          }`}
          aria-label="Toggle categories"
          aria-expanded={showCategories}
        >
          <Filter className="h-5 w-5 text-gray-600" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-11 w-11 rounded-lg hover:bg-gray-50"
          aria-label="Close search"
        >
          <X className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      {/* Search Content */}
      <div className="flex-1 overflow-y-auto">
        {showCategories ? (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Shop by Category</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <div key={category.name} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between">
                    <Link
                      href={category.href}
                      onClick={onClose}
                      className="flex-1 flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                      aria-label={`Browse ${category.name} category`}
                    >
                      <span className="text-xl" aria-hidden="true">{category.icon}</span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </Link>
                    
                    {category.subcategories.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategoryExpansion(category.name)}
                        className="m-2 h-10 px-3 text-xs font-medium text-gray-600 hover:text-gray-900 min-w-[44px]"
                        aria-expanded={expandedCategories.includes(category.name)}
                        aria-label={`${expandedCategories.includes(category.name) ? 'Hide' : 'Show'} ${category.name} subcategories`}
                      >
                        {expandedCategories.includes(category.name) ? 'Less' : 'More'}
                      </Button>
                    )}
                  </div>
                  
                  {expandedCategories.includes(category.name) && category.subcategories.length > 0 && (
                    <div className="bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-px bg-gray-200">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={onClose}
                            className={`flex items-center gap-2 p-3 min-h-[44px] bg-gray-50 hover:bg-white transition-colors ${
                              (sub as any).popular ? 'ring-1 ring-blue-200' : ''
                            }`}
                            aria-label={`Browse ${sub.name} in ${category.name}${(sub as any).popular ? ' - Popular' : ''}`}
                          >
                            <span className="text-sm" aria-hidden="true">{sub.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                            {(sub as any).popular && <span className="text-xs text-blue-600" aria-label="Popular">•</span>}
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
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Press enter to search for "{searchValue}"</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Links</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'New Arrivals', href: '/products?sort=newest' },
                      { label: 'Trending Now', href: '/products?sort=popular' },
                      { label: 'On Sale', href: '/sales' },
                      { label: 'All Brands', href: '/brands' }
                    ].map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={onClose}
                        className="block px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
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