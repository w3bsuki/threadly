'use client';

import { Search, Grid3x3 } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useI18n } from './providers/i18n-provider';

interface UnifiedSearchFiltersProps {
  totalCount?: number;
}

export const UnifiedSearchFilters = ({ totalCount }: UnifiedSearchFiltersProps) => {
  const { dictionary, locale } = useI18n();
  const [showCategories, setShowCategories] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const categories = [
    { 
      name: dictionary.web.global.categories?.women || "Women", 
      href: `/${locale}/women`, 
      icon: "👗",
      subcategories: [
        { name: "Dresses", href: `/${locale}/women/dresses` },
        { name: "Tops", href: `/${locale}/women/tops` },
        { name: "Bottoms", href: `/${locale}/women/bottoms` },
        { name: "Shoes", href: `/${locale}/women/shoes` },
        { name: "Bags", href: `/${locale}/women/bags` },
      ]
    },
    { 
      name: dictionary.web.global.categories?.men || "Men", 
      href: `/${locale}/men`, 
      icon: "👔",
      subcategories: [
        { name: "Shirts", href: `/${locale}/men/shirts` },
        { name: "T-shirts", href: `/${locale}/men/tshirts` },
        { name: "Pants", href: `/${locale}/men/pants` },
        { name: "Shoes", href: `/${locale}/men/shoes` },
        { name: "Accessories", href: `/${locale}/men/accessories` },
      ]
    },
    { 
      name: dictionary.web.global.categories?.kids || "Kids", 
      href: `/${locale}/kids`, 
      icon: "👶",
      subcategories: [
        { name: "Boys", href: `/${locale}/kids/boys` },
        { name: "Girls", href: `/${locale}/kids/girls` },
        { name: "Baby", href: `/${locale}/kids/baby` },
      ]
    },
    { name: dictionary.web.global.categories?.designer || "Designer", href: `/${locale}/designer`, icon: "👑" },
    { name: "Vintage", href: `/${locale}/vintage`, icon: "📿" },
  ];

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
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[50vh] overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        onClick={() => setShowCategories(false)}
                        className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all active:scale-95"
                      >
                        <span className="text-xl">{category.icon}</span>
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <Link
                        href="/products?condition=NEW_WITH_TAGS"
                        onClick={() => setShowCategories(false)}
                        className="flex-1 px-4 py-2.5 bg-black text-white text-center text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        NEW
                      </Link>
                      <Link
                        href="/products?sort=popular"
                        onClick={() => setShowCategories(false)}
                        className="flex-1 px-4 py-2.5 bg-orange-500 text-white text-center text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        TRENDING
                      </Link>
                      <Link
                        href="/products?sale=true"
                        onClick={() => setShowCategories(false)}
                        className="flex-1 px-4 py-2.5 bg-red-500 text-white text-center text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
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