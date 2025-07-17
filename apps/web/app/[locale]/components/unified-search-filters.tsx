'use client';

import { Search, Grid3x3, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useI18n } from './providers/i18n-provider';
import { Button } from '@repo/design-system/components';
import { CATEGORIES } from './navigation/categories';

interface UnifiedSearchFiltersProps {
  totalCount?: number;
}

export const UnifiedSearchFilters = ({ totalCount }: UnifiedSearchFiltersProps) => {
  const { dictionary, locale } = useI18n();
  const [showCategories, setShowCategories] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const categories = CATEGORIES.map(category => ({
    ...category,
    name: dictionary.web.global.categories?.[category.name.toLowerCase() as keyof typeof dictionary.web.global.categories] || category.name,
    href: `/${locale}${category.href}`,
    subcategories: category.subcategories.map(sub => ({
      ...sub,
      href: `/${locale}${sub.href}`
    }))
  }));

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div className="relative bg-white border-b border-gray-100" ref={containerRef}>
      <div className="px-4 py-2">
        <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          {/* Search Bar with Category Dropdown */}
          <div className="relative">
            <div className="flex items-center">
              {/* Category Dropdown Button - Left Side */}
              <button
                className={`flex items-center gap-1.5 px-3 py-2.5 border-r border-gray-200 transition-all rounded-l-lg ${
                  showCategories ? 'bg-black text-white' : 'bg-black text-white hover:bg-gray-800'
                }`}
                onClick={() => setShowCategories(!showCategories)}
              >
                <Grid3x3 className="h-4 w-4" />
                <span className="text-xs font-medium hidden xs:inline">Categories</span>
              </button>
              
              {/* Search Input */}
              <div className="flex-1 flex items-center px-3">
                <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={dictionary.web.global.navigation?.searchPlaceholder || "Search items..."}
                  className="w-full bg-transparent py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </div>
            </div>

            {/* Categories Dropdown */}
            {showCategories && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[70vh] overflow-y-auto">
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Categories</h3>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <div key={category.name} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex items-center">
                          <Link
                            href={category.href}
                            onClick={() => setShowCategories(false)}
                            className="flex-1 flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors active:scale-95"
                            aria-label={`Browse ${category.name} category`}
                          >
                            <span className="text-lg" aria-hidden="true">{category.icon}</span>
                            <span className="text-sm font-medium text-gray-900">{category.name}</span>
                          </Link>
                          
                          {category.subcategories && category.subcategories.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCategoryExpansion(category.name)}
                              className="m-1 h-8 px-2 text-xs font-medium text-gray-600 hover:text-gray-900"
                              aria-expanded={expandedCategories.includes(category.name)}
                              aria-label={`${expandedCategories.includes(category.name) ? 'Hide' : 'Show'} ${category.name} subcategories`}
                            >
                              {expandedCategories.includes(category.name) ? 'Less' : 'More'}
                            </Button>
                          )}
                        </div>
                        
                        {expandedCategories.includes(category.name) && category.subcategories && (
                          <div className="bg-gray-50 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-px bg-gray-200 p-1">
                              {category.subcategories.slice(0, 4).map((sub) => (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  onClick={() => setShowCategories(false)}
                                  className={`flex items-center gap-1.5 px-2 py-2 bg-white hover:bg-gray-50 rounded transition-colors active:scale-95 ${
                                    (sub as any).popular ? 'ring-1 ring-blue-200' : ''
                                  }`}
                                  aria-label={`Browse ${sub.name} in ${category.name}${(sub as any).popular ? ' - Popular' : ''}`}
                                >
                                  <span className="text-sm" aria-hidden="true">{sub.icon}</span>
                                  <span className="text-xs font-medium text-gray-700">{sub.name}</span>
                                  {(sub as any).popular && <span className="text-xs text-blue-600" aria-label="Popular">•</span>}
                                </Link>
                              ))}
                              {category.subcategories.length > 4 && (
                                <Link
                                  href={category.href}
                                  onClick={() => setShowCategories(false)}
                                  className="col-span-2 flex items-center justify-center gap-1 px-2 py-2 bg-blue-50 hover:bg-blue-100 rounded transition-colors active:scale-95"
                                >
                                  <span className="text-xs font-medium text-blue-600">View all {category.subcategories.length} items</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex gap-1">
                      <Link
                        href="/products?condition=NEW_WITH_TAGS"
                        onClick={() => setShowCategories(false)}
                        className="flex-1 px-3 py-2 bg-black text-white text-center text-xs font-medium rounded-md hover:bg-gray-800 transition-colors"
                      >
                        NEW
                      </Link>
                      <Link
                        href="/products?sort=popular"
                        onClick={() => setShowCategories(false)}
                        className="flex-1 px-3 py-2 bg-orange-500 text-white text-center text-xs font-medium rounded-md hover:bg-orange-600 transition-colors"
                      >
                        TRENDING
                      </Link>
                      <Link
                        href="/products?sale=true"
                        onClick={() => setShowCategories(false)}
                        className="flex-1 px-3 py-2 bg-red-500 text-white text-center text-xs font-medium rounded-md hover:bg-red-600 transition-colors"
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