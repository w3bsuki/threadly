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
import { SignInButton, SignUpButton, useUser } from '@repo/auth/client';
import { useI18n } from '../providers/i18n-provider';
import { LanguageSwitcher } from './language-switcher';
import { SafeUserButton } from './safe-user-button';
import { AlgoliaSearch } from '../algolia-search';

// We'll define categories inside the component to use translations

// Subcategories will be defined inside the component to use translations

// Collections will be defined inside the component to use translations

// Filter options will be defined inside the component to use translations

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
  const { dictionary, locale } = useI18n();
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
  
  // Define categories with translations
  const categories = [
    { name: dictionary.web.global.categories?.all || "All", href: `/${locale}`, icon: "🛍️" },
    { name: dictionary.web.global.categories?.women || "Women", href: `/${locale}/women`, icon: "👗" },
    { name: dictionary.web.global.categories?.men || "Men", href: `/${locale}/men`, icon: "👔" },
    { name: dictionary.web.global.categories?.kids || "Kids", href: `/${locale}/kids`, icon: "👶" },
    { name: dictionary.web.global.categories?.unisex || "Unisex", href: `/${locale}/unisex`, icon: "👕" },
    { name: dictionary.web.global.categories?.designer || "Designer", href: `/${locale}/designer`, isDesigner: true, icon: "👑" },
  ];
  
  // Define subcategories with translations
  const subCategories = [
    { name: dictionary.web.global.subCategories?.tshirts || "T-shirts", icon: "👕" },
    { name: dictionary.web.global.subCategories?.shirts || "Shirts", icon: "👔" },
    { name: dictionary.web.global.subCategories?.jackets || "Jackets", icon: "🧥" },
    { name: dictionary.web.global.subCategories?.dresses || "Dresses", icon: "👗" },
    { name: dictionary.web.global.subCategories?.jeans || "Jeans", icon: "👖" },
    { name: dictionary.web.global.subCategories?.sweaters || "Sweaters", icon: "🧶" },
    { name: dictionary.web.global.subCategories?.coats || "Coats", icon: "🧥" },
    { name: dictionary.web.global.subCategories?.sneakers || "Sneakers", icon: "👟" },
    { name: dictionary.web.global.subCategories?.boots || "Boots", icon: "🥾" },
    { name: dictionary.web.global.subCategories?.bags || "Bags", icon: "👜" },
    { name: dictionary.web.global.subCategories?.watches || "Watches", icon: "⌚" },
    { name: dictionary.web.global.subCategories?.jewelry || "Jewelry", icon: "💎" },
    { name: dictionary.web.global.subCategories?.belts || "Belts", icon: "👒" }
  ];

  // Collections for desktop "Shop by Type"
  const collections = [
    { name: dictionary.web.global.collections?.clothing || "Clothing", href: `/${locale}/products?category=clothing`, icon: "👕" },
    { name: dictionary.web.global.collections?.shoes || "Shoes", href: `/${locale}/products?category=shoes`, icon: "👟" },
    { name: dictionary.web.global.collections?.jewelry || "Jewelry", href: `/${locale}/products?category=jewelry`, icon: "💎" },
    { name: dictionary.web.global.collections?.bags || "Bags", href: `/${locale}/products?category=bags`, icon: "👜" },
    { name: dictionary.web.global.collections?.accessories || "Accessories", href: `/${locale}/products?category=accessories`, icon: "⌚" },
    { name: dictionary.web.global.collections?.browseAll || "Browse All", href: `/${locale}/products`, icon: "🛍️" },
  ];

  // Filter options
  const sortOptions = [
    { value: 'newest', label: `📅 ${dictionary.web.global.filters?.newest || 'Newest first'}` },
    { value: 'price-asc', label: `💰 ${dictionary.web.global.filters?.priceLowToHigh || 'Price: Low to High'}` },
    { value: 'price-desc', label: `💎 ${dictionary.web.global.filters?.priceHighToLow || 'Price: High to Low'}` },
    { value: 'popular', label: `🔥 ${dictionary.web.global.filters?.mostPopular || 'Most Popular'}` },
  ];

  const brandOptions = [
    { value: '', label: `🛍️ ${dictionary.web.global.filters?.allBrands || 'All Brands'}` },
    { value: 'nike', label: 'Nike' },
    { value: 'adidas', label: 'Adidas' },
    { value: 'zara', label: 'Zara' },
    { value: 'h&m', label: 'H&M' },
    { value: 'uniqlo', label: 'Uniqlo' },
    { value: 'gucci', label: 'Gucci' },
    { value: 'prada', label: 'Prada' },
  ];

  const conditionOptions = [
    { value: '', label: dictionary.web.global.filters?.allConditions || 'All Conditions' },
    { value: 'NEW_WITH_TAGS', label: `🆕 ${dictionary.web.global.filters?.newWithTags || 'New with tags'}` },
    { value: 'NEW_WITHOUT_TAGS', label: `✨ ${dictionary.web.global.filters?.likeNew || 'Like new'}` },
    { value: 'VERY_GOOD', label: `👍 ${dictionary.web.global.filters?.veryGood || 'Very good'}` },
    { value: 'GOOD', label: `👌 ${dictionary.web.global.filters?.good || 'Good'}` },
  ];
  
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
              <div className="relative">
                <AlgoliaSearch 
                  placeholder={dictionary.web.global.navigation?.searchPlaceholder || "Search for items, brands, or members"}
                  className="max-w-lg"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2">
              {/* Mobile Actions - Optimized for Touch */}
              <div className="flex items-center space-x-1 md:hidden">
                {isSignedIn ? (
                  <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <SafeUserButton />
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="min-w-[44px] min-h-[44px] touch-manipulation"
                      aria-label="Sign in or create account"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </SignInButton>
                )}
                
                <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <CartDropdown />
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={toggleMenu}
                  aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={isMenuOpen}
                  aria-controls="mobile-menu"
                  className="min-w-[44px] min-h-[44px] touch-manipulation transition-transform duration-200 active:scale-95"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {isMenuOpen ? (
                    <X className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  )}
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
                    {dictionary.web.global.navigation?.browse || "Browse"}
                  </Link>
                </Button>
                
                <CartDropdown />
                
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/favorites">
                    <Heart className="h-4 w-4 mr-1" />
                    {dictionary.web.global.navigation?.saved || "Saved"}
                  </Link>
                </Button>
                
                {isSignedIn ? (
                  <SafeUserButton />
                ) : (
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      {dictionary.web.global.navigation?.signIn || "Sign In"}
                    </Button>
                  </SignInButton>
                )}
                
                <Button 
                  size="sm" 
                  variant="default"
                  asChild
                >
                  <Link href={`${env.NEXT_PUBLIC_APP_URL}/selling/new`}>
                    {dictionary.web.global.navigation?.sellNow || "Sell Now"}
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
            role="navigation"
            aria-label="Mobile navigation menu"
            className="md:hidden border-t border-gray-200 bg-white shadow-lg"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Screen reader announcement */}
              <div className="sr-only" aria-live="polite">
                Navigation menu {isMenuOpen ? 'opened' : 'closed'}
              </div>
              
              {/* Primary Actions - Buy/Sell */}
              <div className="space-y-3 pb-4 border-b border-gray-100" role="group" aria-label="Primary actions">
                <Button 
                  className="w-full bg-black text-white hover:bg-gray-800 text-lg py-3 min-h-[48px] touch-manipulation" 
                  asChild
                >
                  <Link 
                    href="/products" 
                    onClick={() => setMenuOpen(false)}
                    aria-describedby="browse-description"
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" aria-hidden="true" />
                    Browse & Buy
                  </Link>
                </Button>
                <div id="browse-description" className="sr-only">
                  Browse and purchase items from our marketplace
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full border-black text-black hover:bg-gray-50 text-lg py-3 min-h-[48px] touch-manipulation" 
                  asChild
                >
                  <Link 
                    href={`${env.NEXT_PUBLIC_APP_URL}/selling/new`} 
                    onClick={() => setMenuOpen(false)}
                    aria-describedby="sell-description"
                  >
                    <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
                    Start Selling
                  </Link>
                </Button>
                <div id="sell-description" className="sr-only">
                  List your items for sale on our marketplace
                </div>
              </div>

              {/* User Actions */}
              <div className="space-y-2 pb-4 border-b border-gray-100" role="group" aria-label="User account actions">
                {isSignedIn ? (
                  <div className="flex items-center px-3 py-3 min-h-[44px]" role="button" tabIndex={0}>
                    <SafeUserButton />
                    <span className="ml-3 text-gray-700" aria-label={`Signed in as ${user?.firstName} ${user?.lastName}`}>
                      {user?.firstName} {user?.lastName}
                    </span>
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-700 min-h-[44px] touch-manipulation"
                      aria-label="Sign in to your account or create a new account"
                    >
                      <User className="h-5 w-5 mr-3" aria-hidden="true" />
                      Sign In / Join
                    </Button>
                  </SignInButton>
                )}
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-700 min-h-[44px] touch-manipulation" 
                  asChild
                >
                  <Link 
                    href="/favorites" 
                    onClick={() => setMenuOpen(false)}
                    aria-label="View your saved items"
                  >
                    <Heart className="h-5 w-5 mr-3" aria-hidden="true" />
                    Saved Items
                  </Link>
                </Button>
                
                <div className="flex items-center justify-between px-3 py-3 min-h-[44px]">
                  <span className="text-gray-700 flex items-center" aria-label="Shopping cart">
                    <ShoppingBag className="h-5 w-5 mr-3" aria-hidden="true" />
                    My Cart
                  </span>
                  <CartDropdown />
                </div>
              </div>

              {/* Additional Links */}
              <nav aria-label="Additional navigation links" className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600 min-h-[44px] text-sm touch-manipulation" 
                  asChild
                >
                  <Link 
                    href="/how-it-works" 
                    onClick={() => setMenuOpen(false)}
                    aria-label="Learn how Threadly works"
                  >
                    How It Works
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600 min-h-[44px] text-sm touch-manipulation" 
                  asChild
                >
                  <Link 
                    href="/contact" 
                    onClick={() => setMenuOpen(false)}
                    aria-label="Get help and support"
                  >
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
            <AlgoliaSearch 
              placeholder="Search for items, brands, or members"
              onClose={() => setMenuOpen(false)}
              isMobile
            />
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
                  href={`/products?search=${encodeURIComponent(subCategory.name.toLowerCase())}`}
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
              <AlgoliaSearch 
                placeholder="Search for items..."
                className="w-full"
                isMobile
              />
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
