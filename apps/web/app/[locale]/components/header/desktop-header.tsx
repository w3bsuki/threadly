'use client';

import { env } from '@/env';
import { Button } from '@repo/design-system/components';
import { Search, Heart, User, ShoppingBag, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { CartDropdown } from './cart-dropdown';
import { SignInButton, useUser } from '@repo/auth/client';
import { useI18n } from '../providers/i18n-provider';
import { SafeUserButton } from './safe-user-button';
import { CATEGORIES } from '../navigation/categories';

export const DesktopHeader = () => {
  const { isSignedIn } = useUser();
  const { dictionary, locale } = useI18n();
  const [showCategories, setShowCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

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
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideDesktop = searchRef.current && !searchRef.current.contains(target);
      
      if (isOutsideDesktop) {
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <div className="hidden md:flex items-center justify-between w-full">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">T</span>
        </div>
        <span className="font-bold text-xl text-black">
          Threadly
        </span>
      </Link>

      {/* Center: Search Bar with Categories Button Inside */}
      <div className="flex-1 max-w-2xl mx-4 md:mx-8" ref={searchRef}>
        <div className="relative flex-1">
          <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
            {/* Search Input */}
            <div className="flex-1 flex items-center px-4">
              <Search className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder={dictionary.web.global.navigation?.searchPlaceholder || "Search for items, brands, or members"}
                className="w-full bg-transparent py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                aria-label="Search products"
              />
            </div>
            
            {/* Categories Button Inside Search Field */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-full w-10 rounded-none hover:bg-gray-200 border-l border-gray-200 transition-all ${
                showCategories ? 'bg-gray-200' : ''
              }`}
              onClick={() => setShowCategories(!showCategories)}
              aria-label="Toggle categories menu"
              aria-expanded={showCategories}
              aria-controls="categories-menu"
            >
              <Filter className="h-4 w-4 text-gray-600" />
            </Button>
          </div>

          {/* Desktop Categories Dropdown */}
          {showCategories && (
            <div 
              id="categories-menu"
              className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-[520px]"
              role="menu"
              aria-label="Product categories"
            >
              <div className="max-h-[70vh] overflow-y-auto">
                <div className="p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Categories</p>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <div key={category.name} className="border border-gray-100 rounded-lg overflow-hidden">
                        <div className="flex items-center">
                          <Link
                            href={category.href}
                            onClick={() => setShowCategories(false)}
                            className="flex-1 flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors group"
                            role="menuitem"
                          >
                            <span className="text-lg opacity-70 group-hover:opacity-100">{category.icon}</span>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-black">{category.name}</span>
                          </Link>
                          
                          {category.subcategories.length > 0 && (
                            <button
                              onClick={() => toggleCategoryExpansion(category.name)}
                              className="px-3 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-l border-gray-100"
                              aria-expanded={expandedCategories.includes(category.name)}
                              aria-label={`${expandedCategories.includes(category.name) ? 'Hide' : 'Show'} ${category.name} subcategories`}
                            >
                              {expandedCategories.includes(category.name) ? 'Less' : 'More'}
                            </button>
                          )}
                        </div>
                        
                        {expandedCategories.includes(category.name) && category.subcategories.length > 0 && (
                          <div className="bg-gray-50 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-px bg-gray-200 p-2">
                              {category.subcategories.map((sub) => (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  onClick={() => setShowCategories(false)}
                                  className={`flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 rounded transition-colors ${
                                    (sub as any).popular ? 'ring-1 ring-blue-200' : ''
                                  }`}
                                  role="menuitem"
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
              </div>
              
              {/* Horizontal buttons for NEW/SALE/HOT */}
              <div className="border-t border-gray-100 p-3 flex gap-2">
                <Link
                  href="/products?condition=NEW_WITH_TAGS"
                  onClick={() => setShowCategories(false)}
                  className="flex-1 px-3 py-2 bg-black text-white text-center text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  role="menuitem"
                >
                  NEW
                </Link>
                <Link
                  href="/products?sale=true"
                  onClick={() => setShowCategories(false)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white text-center text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                  role="menuitem"
                >
                  SALE
                </Link>
                <Link
                  href="/products?sort=popular"
                  onClick={() => setShowCategories(false)}
                  className="flex-1 px-3 py-2 bg-orange-500 text-white text-center text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                  role="menuitem"
                >
                  HOT
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/favorites" className="flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            <span>Saved</span>
          </Link>
        </Button>
        
        <CartDropdown />
        
        {isSignedIn ? (
          <SafeUserButton />
        ) : (
          <SignInButton mode="modal">
            <Button variant="ghost" className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              <span>Sign In</span>
            </Button>
          </SignInButton>
        )}
        
        <Button 
          variant="default"
          asChild
          className="bg-black text-white hover:bg-gray-800"
        >
          <Link href={`${env.NEXT_PUBLIC_APP_URL}/selling/new`}>
            <Plus className="h-5 w-5 mr-2" />
            Sell
          </Link>
        </Button>
      </div>
    </div>
  );
};