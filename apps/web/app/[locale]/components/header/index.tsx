'use client';

import { env } from '@/env';
import { Button } from '@repo/design-system/components/ui/button';
import { Search, Heart, Menu, X, User, ShoppingBag, Crown, ChevronDown, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CartDropdown } from './cart-dropdown';

const categories = [
  { name: "All", href: "/" },
  { name: "Women", href: "/women" },
  { name: "Men", href: "/men" },
  { name: "Kids", href: "/kids" },
  { name: "Unisex", href: "/unisex" },
  { name: "Designer", href: "/designer", isDesigner: true },
];

const subCategories = [
  "T-shirts", "Shirts", "Jackets", "Dresses", "Jeans", 
  "Sweaters", "Coats", "Sneakers", "Boots", "Bags", 
  "Watches", "Jewelry", "Belts"
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

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'product' | 'brand' | 'category';
  brand?: string;
  category?: string;
}

export const Header = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubCategories, setShowSubCategories] = useState(true);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

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
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.type}-${suggestion.id}`}
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
                  className="min-w-[44px] min-h-[44px] p-3 hover:bg-gray-100 active:bg-gray-200"
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
                  className="text-gray-700 hover:text-black hover:bg-gray-50 font-medium px-4"
                  asChild
                >
                  <Link href="/products">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Browse
                  </Link>
                </Button>
                
                <CartDropdown />
                
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-black" asChild>
                  <Link href="/favorites">
                    <Heart className="h-4 w-4 mr-1" />
                    Saved
                  </Link>
                </Button>
                
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-black" asChild>
                  <Link href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}>
                    <User className="h-4 w-4 mr-1" />
                    Sign In
                  </Link>
                </Button>
                
                <Button 
                  size="sm" 
                  className="bg-black text-white hover:bg-gray-800 font-medium px-4"
                  asChild
                >
                  <Link href={`${env.NEXT_PUBLIC_APP_URL}/selling/new`}>
                    Sell Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items, brands, or members"
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black text-sm"
              />
            </div>
          </div>

          {/* Mobile Category Pills - Horizontal Scroll */}
          <div className="md:hidden pb-3">
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
                    className={`whitespace-nowrap ${
                      category.name === "All"
                        ? "bg-black text-white hover:bg-gray-800"
                        : category.isDesigner
                        ? "border-amber-400 text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 font-medium"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {category.isDesigner && <Crown className="h-3 w-3 mr-1" />}
                    {category.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Sub-Categories */}
          <div className="md:hidden pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Shop by Type</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSubCategories(!showSubCategories)}
                className="text-xs text-gray-500 p-1 h-auto"
              >
                <ChevronDown className={`h-3 w-3 transition-transform ${showSubCategories ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            {showSubCategories && (
              <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                {subCategories.map((subCategory) => (
                  <Link
                    key={subCategory}
                    href={`/categories/items/${subCategory.toLowerCase()}`}
                    className="flex-shrink-0"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap text-xs border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {subCategory}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Categories Navigation */}
        <div className="border-t border-gray-100 bg-gray-50 hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              {/* Main Categories */}
              <div className="flex items-center space-x-8">
                {categories.slice(1).map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className={`text-sm font-medium transition-colors flex items-center ${
                      category.isDesigner
                        ? "text-amber-700 hover:text-amber-800 font-semibold"
                        : "text-gray-700 hover:text-black"
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
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    <span className="text-base">{collection.icon}</span>
                    <span>{collection.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

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
                    Browse Items
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

              {/* Secondary Actions */}
              <div className="space-y-2">
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
                
                <Button variant="ghost" className="w-full justify-start text-gray-700 min-h-[44px]" asChild>
                  <Link href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`} onClick={() => setMenuOpen(false)}>
                    <User className="h-5 w-5 mr-3" />
                    Sign In / Join
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
