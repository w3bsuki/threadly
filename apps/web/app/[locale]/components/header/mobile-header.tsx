'use client';

import { env } from '@/env';
import { Button } from '@repo/design-system/components';
import { Menu, X, User, Heart, ShoppingBag, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { SignInButton, useUser } from '@repo/auth/client';
import { useI18n } from '../providers/i18n-provider';
import { SafeUserButton } from './safe-user-button';
import { CATEGORIES } from '../navigation/categories';
import { MobileSearchBar } from './mobile-search-bar';

export const MobileHeader = () => {
  const { isSignedIn, user } = useUser();
  const { dictionary, locale } = useI18n();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

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

  return (
    <>
      {/* Mobile Layout */}
      <div className="flex md:hidden items-center justify-between w-full">
        {/* Left: Hamburger */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setMenuOpen(true)}
          className="h-9 w-9 -ml-2 text-white hover:bg-white/10"
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Center: Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <span className="font-bold text-xl text-white">Threadly</span>
        </Link>

        {/* Right: Search & Account */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="h-9 w-9 text-white hover:bg-white/10"
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </Button>
          
          {isSignedIn ? (
            <SafeUserButton />
          ) : (
            <SignInButton mode="modal">
              <Button variant="ghost" size="icon" className="h-9 w-9 -mr-2 text-white hover:bg-white/10">
                <User className="h-5 w-5" />
              </Button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Full-Screen Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu Content */}
          <div 
            id="mobile-menu"
            className="relative h-full flex flex-col bg-white animate-in slide-in-from-top duration-300"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                <span className="font-bold text-xl">Threadly</span>
              </Link>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setMenuOpen(false)}
                className="h-10 w-10"
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* User Section */}
              <div className="p-4 border-b">
                {isSignedIn ? (
                  <div className="flex items-center gap-4">
                    <SafeUserButton />
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-gray-600">View your profile</p>
                    </div>
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <Button className="w-full h-14 text-base" variant="outline">
                      <User className="h-5 w-5 mr-3" />
                      Sign In / Join
                    </Button>
                  </SignInButton>
                )}
              </div>

              {/* Categories with Subcategories */}
              <div className="p-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Shop by Category</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.name} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex items-center min-h-[44px]">
                        <Link
                          href={category.href}
                          onClick={() => setMenuOpen(false)}
                          className="flex-1 flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors active:scale-95"
                          aria-label={`Browse ${category.name} category`}
                        >
                          <span className="text-2xl" aria-hidden="true">{category.icon}</span>
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
                          <div className="grid grid-cols-2 gap-px bg-gray-200 p-2">
                            {category.subcategories.map((sub) => (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-2 p-3 min-h-[44px] bg-white hover:bg-gray-50 rounded transition-colors active:scale-95 ${
                                  (sub as any).popular ? 'ring-1 ring-blue-200' : ''
                                }`}
                                aria-label={`Browse ${sub.name} in ${category.name}${(sub as any).popular ? ' - Popular' : ''}`}
                              >
                                <span className="text-lg" aria-hidden="true">{sub.icon}</span>
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

              {/* Quick Actions */}
              <div className="p-4 space-y-3">
                <Link
                  href="/favorites"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 p-4 bg-pink-50 hover:bg-pink-100 rounded-xl transition-all active:scale-95"
                >
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium">Saved Items</p>
                    <p className="text-sm text-gray-600">Your wishlist & favorites</p>
                  </div>
                </Link>
                
                <Link
                  href="/products"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all active:scale-95"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Browse All</p>
                    <p className="text-sm text-gray-600">Explore everything</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="p-4 border-t bg-gray-50">
              <Button 
                className="w-full h-14 bg-black text-white hover:bg-gray-800 text-base font-medium" 
                asChild
              >
                <Link href={`${env.NEXT_PUBLIC_APP_URL}/selling/new`} onClick={() => setMenuOpen(false)}>
                  <Plus className="h-5 w-5 mr-2" />
                  Start Selling
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <MobileSearchBar onClose={() => setSearchOpen(false)} />
      )}
    </>
  );
};