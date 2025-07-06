'use client';

import { env } from '@/env';
import { Button } from '@repo/design-system/components';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import { Search, Heart, Menu, X, User, ShoppingBag, Crown, ChevronDown, Plus, Filter, Grid3X3, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CartDropdown } from './cart-dropdown';
import { SignInButton, SignUpButton, UserButton, useUser } from '@repo/auth/client';

const categories = [
  { name: "All", href: "/", icon: "🛍️" },
  { name: "Women", href: "/women", icon: "👗" },
  { name: "Men", href: "/men", icon: "👔" },
  { name: "Kids", href: "/kids", icon: "👶" },
  { name: "Unisex", href: "/unisex", icon: "👕" },
  { name: "Designer", href: "/designer", isDesigner: true, icon: "👑" },
];

const subCategories = [
  { name: "T-shirts", icon: "👕" },
  { name: "Shirts", icon: "👔" },
  { name: "Jackets", icon: "🧥" },
  { name: "Dresses", icon: "👗" },
  { name: "Jeans", icon: "👖" },
  { name: "Sweaters", icon: "🧶" },
  { name: "Coats", icon: "🧥" },
  { name: "Sneakers", icon: "👟" },
  { name: "Boots", icon: "🥾" },
  { name: "Bags", icon: "👜" },
  { name: "Watches", icon: "⌚" },
  { name: "Jewelry", icon: "💎" },
  { name: "Belts", icon: "👒" }
];

// Collections for desktop "Shop by Type"
const collections = [
  { name: "Clothing", href: "/collections/clothing", icon: "👕" },
  { name: "Shoes", href: "/collections/shoes", icon: "👟" },
  { name: "Jewelry", href: "/collections/jewelry", icon: "💎" },
  { name: "Bags", href: "/collections/bags", icon: "👜" },
  { name: "Accessories", href: "/collections/accessories", icon: "⌚" },
  { name: "Home", href: "/collections/home", icon: "🏠" },
];

// Filter options
const sortOptions = [
  { value: 'newest', label: '📅 Newest first' },
  { value: 'price-asc', label: '💰 Price: Low to High' },
  { value: 'price-desc', label: '💎 Price: High to Low' },
  { value: 'popular', label: '🔥 Most Popular' },
];

const brandOptions = [
  { value: '', label: '🛍️ All Brands' },
  { value: 'nike', label: 'Nike' },
  { value: 'adidas', label: 'Adidas' },
  { value: 'zara', label: 'Zara' },
  { value: 'h&m', label: 'H&M' },
  { value: 'uniqlo', label: 'Uniqlo' },
  { value: 'gucci', label: 'Gucci' },
  { value: 'prada', label: 'Prada' },
];

const conditionOptions = [
  { value: '', label: 'All Conditions' },
  { value: 'NEW_WITH_TAGS', label: '🆕 New with tags' },
  { value: 'NEW_WITHOUT_TAGS', label: '✨ Like new' },
  { value: 'VERY_GOOD', label: '👍 Very good' },
  { value: 'GOOD', label: '👌 Good' },
];

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'product' | 'brand' | 'category';
  brand?: string;
  category?: string;
}

export const Header = () => {
  const { isSignedIn, user } = useUser();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubCategories, setShowSubCategories] = useState(true);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [showSearchSection, setShowSearchSection] = useState(true);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Filter states
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || '');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      router.push(`/product/${suggestion.id}`);
    } else if (suggestion.type === 'brand') {
      router.push(`/search?q=${encodeURIComponent(suggestion.title)}`);
    } else if (suggestion.type === 'category') {
      router.push(`/search?q=${encodeURIComponent(suggestion.title)}`);
    }
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  // Debounced search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery.trim())}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data || []);
          setShowSuggestions(data && data.length > 0);
          setSelectedSuggestion(-1);
        } else {
        }
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 1);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mobile menu toggle function
  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  // Close mobile menu on outside click/touch
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: false });

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => setMenuOpen(false);
    
    // Listen for route changes (Next.js app router uses different events)
    const handleBeforeHistoryChange = () => setMenuOpen(false);
    
    // For Next.js 13+ app router, we need to listen to navigation events differently
    // This is a fallback that works with both pages and app router
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      handleBeforeHistoryChange();
      return originalPushState.apply(history, args);
    };
    
    history.replaceState = function(...args) {
      handleBeforeHistoryChange();
      return originalReplaceState.apply(history, args);
    };
    
    window.addEventListener('popstate', handleBeforeHistoryChange);
    
    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handleBeforeHistoryChange);
    };
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isMenuOpen]);

  // Smart scroll handling for mobile navigation
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 768) return; // Only on mobile
      
      const currentScrollY = window.scrollY;
      
      // Show full search section only when at the very top
      if (currentScrollY < 100) {
        setShowSearchSection(true);
        setShowStickyBar(false);
      } else {
        // When scrolled down, hide search section and show sticky bar
        setShowSearchSection(false);
        setShowStickyBar(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="font-bold text-xl text-black hidden sm:block">
                  Threadly
                </span>
              </Link>
            </div>

            {/* Center: Search Bar (Desktop) */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <div ref={searchRef} className="relative">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search for items, brands, or members"
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black text-sm"
                      role="combobox"
                      aria-expanded={showSuggestions}
                      aria-controls="search-suggestions"
                      aria-autocomplete="list"
                      aria-activedescendant={selectedSuggestion >= 0 ? `suggestion-${selectedSuggestion}` : undefined}
                    />
                    {searchQuery && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setShowSuggestions(false);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label="Clear search"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </form>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div 
                    id="search-suggestions"
                    role="listbox"
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.type}-${suggestion.id}`}
                        id={`suggestion-${index}`}
                        role="option"
                        aria-selected={selectedSuggestion === index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 ${
                          selectedSuggestion === index ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {suggestion.type === 'product' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          {suggestion.type === 'brand' && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          )}
                          {suggestion.type === 'category' && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {suggestion.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {suggestion.type === 'product' && suggestion.brand && (
                              <span>by {suggestion.brand}</span>
                            )}
                            {suggestion.type === 'product' && suggestion.category && (
                              <span> in {suggestion.category}</span>
                            )}
                            {suggestion.type === 'brand' && <span>Brand</span>}
                            {suggestion.type === 'category' && <span>Category</span>}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2">
              {/* Mobile Actions - Simplified */}
              <div className="flex items-center space-x-2 md:hidden">
                {isSignedIn ? (
                  <UserButton />
                ) : (
                  <SignInButton mode="modal">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="min-w-[44px] min-h-[44px] p-3"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </SignInButton>
                )}
                
                <CartDropdown />
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleMenu}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    toggleMenu();
                  }}
                  aria-label="Toggle navigation menu"
                  aria-expanded={isMenuOpen}
                  aria-controls="mobile-menu"
                  className="min-w-[44px] min-h-[44px] p-3"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                >
                  <Link href="/products">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Browse
                  </Link>
                </Button>
                
                <CartDropdown />
                
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/favorites">
                    <Heart className="h-4 w-4 mr-1" />
                    Saved
                  </Link>
                </Button>
                
                {isSignedIn ? (
                  <UserButton />
                ) : (
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      Sign In
                    </Button>
                  </SignInButton>
                )}
                
                <Button 
                  size="sm" 
                  variant="default"
                  asChild
                >
                  <Link href={`${env.NEXT_PUBLIC_APP_URL}/selling/new`}>
                    Sell Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>


        </div>

        {/* Desktop Categories Navigation */}
        <nav aria-label="Main navigation" className="border-t border-gray-100 bg-gray-50 hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              {/* Main Categories */}
              <div className="flex items-center space-x-8">
                {categories.slice(1).map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className={`text-sm font-medium transition-colors duration-200 flex items-center ${
                      category.isDesigner
                        ? "text-amber-700 hover:text-amber-900 font-semibold"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    {category.isDesigner && <Crown className="h-4 w-4 mr-1" />}
                    {category.name}
                  </Link>
                ))}
              </div>
              
              {/* Collections - Shop by Type */}
              <div className="flex items-center space-x-6">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shop by Type</span>
                {collections.map((collection) => (
                  <Link
                    key={collection.name}
                    href={collection.href}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    <span className="text-base">{collection.icon}</span>
                    <span>{collection.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div 
            ref={menuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-heading"
            className="md:hidden border-t border-gray-200 bg-white shadow-lg"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Visually hidden heading for accessibility */}
              <h2 id="mobile-menu-heading" className="sr-only">Navigation Menu</h2>
              
              {/* Primary Actions - Buy/Sell */}
              <div className="space-y-3 pb-4 border-b border-gray-100">
                <Button 
                  className="w-full bg-black text-white hover:bg-gray-800 text-lg py-3 min-h-[48px]" 
                  asChild
                >
                  <Link href="/products" onClick={() => setMenuOpen(false)}>
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Browse & Buy
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-black text-black hover:bg-gray-50 text-lg py-3 min-h-[48px]" 
                  asChild
                >
                  <Link href={`${env.NEXT_PUBLIC_APP_URL}/selling/new`} onClick={() => setMenuOpen(false)}>
                    <Plus className="h-5 w-5 mr-2" />
                    Start Selling
                  </Link>
                </Button>
              </div>

              {/* User Actions */}
              <div className="space-y-2 pb-4 border-b border-gray-100">
                {isSignedIn ? (
                  <div className="flex items-center px-3 py-2">
                    <UserButton />
                    <span className="ml-3 text-gray-700">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <Button variant="ghost" className="w-full justify-start text-gray-700 min-h-[44px]">
                      <User className="h-5 w-5 mr-3" />
                      Sign In / Join
                    </Button>
                  </SignInButton>
                )}
                
                <Button variant="ghost" className="w-full justify-start text-gray-700 min-h-[44px]" asChild>
                  <Link href="/favorites" onClick={() => setMenuOpen(false)}>
                    <Heart className="h-5 w-5 mr-3" />
                    Saved Items
                  </Link>
                </Button>
                
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-gray-700 flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-3" />
                    My Cart
                  </span>
                  <CartDropdown />
                </div>
              </div>

              {/* Additional Links */}
              <nav aria-label="Mobile navigation" className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-gray-600 min-h-[44px] text-sm" asChild>
                  <Link href="/how-it-works" onClick={() => setMenuOpen(false)}>
                    How It Works
                  </Link>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start text-gray-600 min-h-[44px] text-sm" asChild>
                  <Link href="/contact" onClick={() => setMenuOpen(false)}>
                    Help & Support
                  </Link>
                </Button>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation - Only at Top */}
      <div 
        className={`md:hidden fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 transition-transform duration-300 ease-out ${
          showSearchSection ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="px-4 pt-3 pb-3">
          {/* Search Bar - Always Visible */}
          <div className="mb-3" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for items, brands, or members"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSuggestions(false);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Quick Category Pills - Most Used Filters */}
          <div>
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="flex-shrink-0"
                >
                  <Button
                    variant={category.name === "All" ? "default" : "outline"}
                    size="sm"
                    className={`whitespace-nowrap h-9 px-3 text-xs font-medium ${
                      category.name === "All"
                        ? "bg-black text-white hover:bg-gray-800"
                        : category.isDesigner
                        ? "border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Subcategories - Quick Access */}
          <div className="mt-1.5">
            <div className="flex space-x-1.5 overflow-x-auto scrollbar-hide">
              {subCategories.slice(0, 6).map((subCategory) => (
                <Link
                  key={subCategory.name}
                  href={`/categories/items/${subCategory.name.toLowerCase()}`}
                  className="flex-shrink-0"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="whitespace-nowrap text-xs text-gray-600 hover:text-black border border-gray-200 hover:border-gray-300 hover:bg-gray-50 h-8 px-2"
                  >
                    <span className="mr-1 text-xs">{subCategory.icon}</span>
                    {subCategory.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Bar - Search + Filter (Appears when scrolled) */}
      <div 
        className={`md:hidden fixed top-16 left-0 right-0 z-40 bg-white transition-transform duration-300 ease-out ${
          showStickyBar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="px-3 py-3 space-y-3 shadow-md border-b border-gray-100">

          {/* Search and Filter Row */}
          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for items..."
                    className="block w-full pl-11 pr-10 py-2.5 h-11 bg-gray-50 border border-gray-200 rounded-full leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent focus:bg-white text-sm transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowFilters(true)}
              className="h-11 px-4 text-sm font-medium border-gray-200 bg-gray-50 hover:bg-gray-100 relative rounded-full"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="ml-2 hidden xs:inline">Filter</span>
              {(selectedBrand || selectedCondition || selectedSizes.length > 0) && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 min-w-[20px] px-1 text-xs"
                >
                  {[selectedBrand, selectedCondition].filter(Boolean).length + selectedSizes.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Active Filters Pills (optional - shows what's filtered) */}
          {(selectedSort !== 'newest' || selectedBrand || selectedCondition || selectedSizes.length > 0) && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-xs text-gray-500 flex-shrink-0">Active:</span>
              {selectedSort !== 'newest' && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {sortOptions.find(s => s.value === selectedSort)?.label}
                </Badge>
              )}
              {selectedBrand && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {brandOptions.find(b => b.value === selectedBrand)?.label}
                </Badge>
              )}
              {selectedCondition && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {conditionOptions.find(c => c.value === selectedCondition)?.label}
                </Badge>
              )}
              {selectedSizes.length > 0 && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  Size: {selectedSizes.join(', ')}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Filter Overlay */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="h-full w-full p-0">
          {/* Filter Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h2 className="text-lg font-semibold">Filters</h2>
              
              {(selectedBrand || selectedCondition || selectedSizes.length > 0 || selectedSort !== 'newest') && (
                <button
                  onClick={() => {
                    setSelectedSort('newest');
                    setSelectedBrand('');
                    setSelectedCondition('');
                    setSelectedSizes([]);
                    const params = new URLSearchParams(searchParams);
                    params.delete('sort');
                    params.delete('brand');
                    params.delete('condition');
                    router.push(`${window.location.pathname}`);
                  }}
                  className="text-sm text-gray-600 hover:text-black"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Filter Content */}
          <div className="overflow-y-auto h-[calc(100%-120px)]">
            <div className="px-4 py-4 space-y-6">
              {/* Sort By */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Sort By</h3>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg"
                    >
                      <span className="text-sm">{option.label}</span>
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        checked={selectedSort === option.value}
                        onChange={() => setSelectedSort(option.value)}
                        className="text-black focus:ring-black"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Categories */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      onClick={() => setShowFilters(false)}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className={`w-full justify-start h-10 text-sm ${
                          category.isDesigner ? "border-amber-400 text-amber-700" : ""
                        }`}
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Brand */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Brand</h3>
                <div className="flex flex-wrap gap-2">
                  {brandOptions.map((brand) => (
                    <Button
                      key={brand.value}
                      variant={selectedBrand === brand.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedBrand(brand.value)}
                      className={`text-xs ${
                        selectedBrand === brand.value ? "bg-black text-white" : ""
                      }`}
                    >
                      {brand.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Condition */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Condition</h3>
                <div className="space-y-2">
                  {conditionOptions.map((condition) => (
                    <label
                      key={condition.value}
                      className="flex items-center py-2 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCondition === condition.value}
                        onChange={() => {
                          setSelectedCondition(
                            selectedCondition === condition.value ? '' : condition.value
                          );
                        }}
                        className="mr-3 text-black focus:ring-black rounded"
                      />
                      <span className="text-sm">{condition.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Size */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Size</h3>
                <div className="grid grid-cols-6 gap-2">
                  {sizeOptions.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSizes.includes(size) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newSizes = selectedSizes.includes(size)
                          ? selectedSizes.filter(s => s !== size)
                          : [...selectedSizes, size];
                        setSelectedSizes(newSizes);
                      }}
                      className={`h-9 text-xs ${
                        selectedSizes.includes(size) ? "bg-black text-white" : ""
                      }`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range (if needed) */}
              {/* Can add a price range slider here */}
            </div>
          </div>

          {/* Apply Button */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <Button
              className="w-full bg-black text-white hover:bg-gray-800 h-12 text-base font-medium"
              onClick={() => {
                // Apply filters
                const params = new URLSearchParams();
                if (selectedSort !== 'newest') params.set('sort', selectedSort);
                if (selectedBrand) params.set('brand', selectedBrand);
                if (selectedCondition) params.set('condition', selectedCondition);
                // Add sizes to params if needed
                
                router.push(`${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`);
                setShowFilters(false);
              }}
            >
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

    </>
  );
};
