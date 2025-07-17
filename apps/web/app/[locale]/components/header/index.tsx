'use client';

import { env } from '@/env';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Search, Heart, Menu, X, User, ShoppingBag, Filter, Plus, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CartDropdown } from './cart-dropdown';
import { SignInButton, useUser } from '@repo/auth/client';
import { useI18n } from '../providers/i18n-provider';
import { SafeUserButton } from './safe-user-button';
import { AlgoliaSearch } from '../algolia-search';

export const Header = () => {
  const { isSignedIn, user } = useUser();
  const { dictionary, locale } = useI18n();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const categoriesWithSubcategories = [
    { 
      name: dictionary.web.global.categories?.women || "Women", 
      href: `/${locale}/women`, 
      icon: "👗",
      subcategories: [
        { name: "Dresses", href: `/${locale}/women/dresses`, icon: "👗" },
        { name: "Tops", href: `/${locale}/women/tops`, icon: "👚" },
        { name: "Bottoms", href: `/${locale}/women/bottoms`, icon: "👖" },
        { name: "Jackets", href: `/${locale}/women/jackets`, icon: "🧥" },
        { name: "Shoes", href: `/${locale}/women/shoes`, icon: "👠" },
        { name: "Bags", href: `/${locale}/women/bags`, icon: "👜" },
      ]
    },
    { 
      name: dictionary.web.global.categories?.men || "Men", 
      href: `/${locale}/men`, 
      icon: "👔",
      subcategories: [
        { name: "Shirts", href: `/${locale}/men/shirts`, icon: "👔" },
        { name: "T-shirts", href: `/${locale}/men/tshirts`, icon: "👕" },
        { name: "Pants", href: `/${locale}/men/pants`, icon: "👖" },
        { name: "Jackets", href: `/${locale}/men/jackets`, icon: "🧥" },
        { name: "Shoes", href: `/${locale}/men/shoes`, icon: "👟" },
        { name: "Accessories", href: `/${locale}/men/accessories`, icon: "⌚" },
      ]
    },
    { 
      name: dictionary.web.global.categories?.kids || "Kids", 
      href: `/${locale}/kids`, 
      icon: "👶",
      subcategories: [
        { name: "Boys", href: `/${locale}/kids/boys`, icon: "👦" },
        { name: "Girls", href: `/${locale}/kids/girls`, icon: "👧" },
        { name: "Baby", href: `/${locale}/kids/baby`, icon: "👶" },
        { name: "Shoes", href: `/${locale}/kids/shoes`, icon: "👟" },
      ]
    },
    { 
      name: dictionary.web.global.categories?.unisex || "Unisex", 
      href: `/${locale}/unisex`, 
      icon: "👕",
      subcategories: []
    },
    { 
      name: dictionary.web.global.categories?.designer || "Designer", 
      href: `/${locale}/designer`, 
      icon: "👑",
      subcategories: []
    },
    { 
      name: "Vintage", 
      href: `/${locale}/vintage`, 
      icon: "📿",
      subcategories: []
    },
  ];

  const categories = categoriesWithSubcategories;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideDesktop = searchRef.current && !searchRef.current.contains(target);
      
      if (isOutsideDesktop) {
        setShowCategories(false);
        setExpandedCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Main Header - Black mobile navbar */}
      <header className="sticky top-0 z-50 bg-black md:bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main Navigation Bar */}
          <div className="flex items-center justify-between h-16 md:h-16">
            {/* Mobile Layout */}
            <div className="flex md:hidden items-center justify-between w-full">
              {/* Left: Hamburger */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setMenuOpen(true)}
                className="h-9 w-9 -ml-2 text-white hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Center: Logo */}
              <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                <span className="font-bold text-xl text-white">Threadly</span>
              </Link>

              {/* Right: Account/Auth */}
              <div className="flex items-center">
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

            {/* Desktop Layout */}
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

              {/* Center: Search Bar with Categories Button Inside - Desktop Only */}
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
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
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
                  >
                    <Filter className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>

                {/* Desktop Categories Dropdown - Modern Compact 2-Column Grid */}
                {showCategories && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-[420px]">
                    <div className="grid grid-cols-2 divide-x divide-gray-100">
                      {/* Main Categories */}
                      <div className="p-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">Categories</p>
                        <div className="space-y-0.5">
                          {categories.map((category) => (
                            <Link
                              key={category.name}
                              href={category.href}
                              onClick={() => setShowCategories(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 rounded-md transition-colors group"
                            >
                              <span className="text-lg opacity-70 group-hover:opacity-100">{category.icon}</span>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-black">{category.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                      
                      {/* Quick Links */}
                      <div className="p-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">Quick Links</p>
                        <div className="space-y-0.5">
                          <Link
                            href="/products?sort=newest"
                            onClick={() => setShowCategories(false)}
                            className="block px-3 py-2.5 text-sm text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                          >
                            New Arrivals
                          </Link>
                          <Link
                            href="/products?sort=popular"
                            onClick={() => setShowCategories(false)}
                            className="block px-3 py-2.5 text-sm text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                          >
                            Trending Now
                          </Link>
                          <Link
                            href="/products?condition=NEW_WITH_TAGS"
                            onClick={() => setShowCategories(false)}
                            className="block px-3 py-2.5 text-sm text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                          >
                            Brand New
                          </Link>
                          <Link
                            href="/sales"
                            onClick={() => setShowCategories(false)}
                            className="block px-3 py-2.5 text-sm text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                          >
                            On Sale
                          </Link>
                          <Link
                            href="/brands"
                            onClick={() => setShowCategories(false)}
                            className="block px-3 py-2.5 text-sm text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                          >
                            All Brands
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {/* Horizontal buttons for NEW/SALE/HOT */}
                    <div className="border-t border-gray-100 p-3 flex gap-2">
                      <Link
                        href="/products?condition=NEW_WITH_TAGS"
                        onClick={() => setShowCategories(false)}
                        className="flex-1 px-3 py-2 bg-black text-white text-center text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        NEW
                      </Link>
                      <Link
                        href="/products?sale=true"
                        onClick={() => setShowCategories(false)}
                        className="flex-1 px-3 py-2 bg-red-500 text-white text-center text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                      >
                        SALE
                      </Link>
                      <Link
                        href="/products?sort=popular"
                        onClick={() => setShowCategories(false)}
                        className="flex-1 px-3 py-2 bg-orange-500 text-white text-center text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        HOT
                      </Link>
                    </div>
                  </div>
                )}
                </div>
              </div>

              {/* Right: Actions - Properly sized */}
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

              {/* No mobile actions here - they're handled in the mobile layout above */}
            </div>
          </div>
        </div>
      </header>

      
      {/* Full-Screen Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200"
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="relative h-full flex flex-col bg-white animate-in slide-in-from-top duration-300">
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

              {/* Categories Grid */}
              <div className="p-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Shop by Category</h3>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center gap-3 p-6 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all active:scale-95"
                    >
                      <span className="text-4xl">{category.icon}</span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </Link>
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
    </>
  );
};