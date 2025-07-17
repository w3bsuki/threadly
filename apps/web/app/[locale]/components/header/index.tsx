'use client';

import { env } from '@/env';
import { Button } from '@repo/design-system/components';
import { Sheet, SheetContent, SheetTrigger } from '@repo/design-system/components';
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
  const mobileSearchRef = useRef<HTMLDivElement>(null);

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
      const isOutsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(target);
      
      if ((isOutsideDesktop && isOutsideMobile) || (!searchRef.current && isOutsideMobile) || (!mobileSearchRef.current && isOutsideDesktop)) {
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
      <header className="sticky top-0 z-50 bg-black md:bg-white border-b border-gray-200 md:border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main Navigation Bar */}
          <div className="flex items-center justify-between h-16 md:h-16">
            {/* Mobile Layout */}
            <div className="flex md:hidden items-center justify-between w-full">
              {/* Left: Hamburger */}
              <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 -ml-2 text-white hover:bg-white/10"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                
                <SheetContent side="left" className="w-[280px] p-0">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <h2 className="text-lg font-semibold">Menu</h2>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setMenuOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {/* User Section */}
                      {isSignedIn ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <SafeUserButton />
                            <div>
                              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                              <p className="text-sm text-gray-500">View profile</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <SignInButton mode="modal">
                          <Button className="w-full" variant="outline">
                            <User className="h-5 w-5 mr-2" />
                            Sign In / Join
                          </Button>
                        </SignInButton>
                      )}

                      {/* Quick Links */}
                      <div className="space-y-2">
                        <Link
                          href="/favorites"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                        >
                          <Heart className="h-5 w-5" />
                          <span>Saved Items</span>
                        </Link>
                        
                        <Link
                          href="/products"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                        >
                          <ShoppingBag className="h-5 w-5" />
                          <span>Browse All</span>
                        </Link>
                      </div>

                      {/* Categories */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Categories</h3>
                        <div className="space-y-1">
                          {categories.map((category) => (
                            <Link
                              key={category.name}
                              href={category.href}
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg"
                            >
                              <span>{category.icon}</span>
                              <span>{category.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Sell Button */}
                      <div className="pt-4">
                        <Button 
                          className="w-full bg-black text-white hover:bg-gray-800" 
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
                </SheetContent>
              </Sheet>

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
                      className="w-full bg-transparent py-3 outline-none text-gray-900 placeholder-gray-500"
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

      {/* Mobile Search Bar - Below main nav on mobile */}
      <div className="md:hidden bg-white border-b border-gray-100 sticky top-16 z-40" ref={mobileSearchRef}>
        <div className="max-w-7xl mx-auto px-4 pt-3 pb-3">
        <div className="relative">
          <div className="flex items-center bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm focus-within:border-gray-300 focus-within:shadow-md transition-all">
              {/* Filter Button on Left */}
              <button
                className={`flex items-center justify-center px-3 py-2.5 border-r border-gray-200 transition-all ${
                  showCategories ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                onClick={() => setShowCategories(!showCategories)}
              >
                <Filter className="h-4 w-4 text-gray-600" />
              </button>
              
              {/* Search Field */}
              <div className="flex-1 flex items-center px-4 bg-gray-50/50">
                <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search items..."
                  className="w-full bg-transparent outline-none text-sm placeholder-gray-500 py-2.5 focus:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Mobile Categories Dropdown - Clean Modern Style */}
            {showCategories && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-[70vh] overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        onClick={() => setShowCategories(false)}
                        className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all active:scale-95"
                      >
                        <span className="text-2xl">{category.icon}</span>
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Filters</h3>
                    <div className="flex gap-2">
                      <Link
                        href="/products?condition=NEW_WITH_TAGS"
                        onClick={() => setShowCategories(false)}
                        className="flex-1 px-4 py-2.5 bg-black text-white text-center text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        New
                      </Link>
                      <Link
                        href="/products?sort=popular"
                        onClick={() => setShowCategories(false)}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-center text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Trending
                      </Link>
                      <Link
                        href="/products?sale=true"
                        onClick={() => setShowCategories(false)}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-center text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Sale
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
    </>
  );
};