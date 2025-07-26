'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@repo/design-system/lib/utils';
import { AccountDropdown } from '@repo/design-system/components/navigation/account-dropdown';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@repo/design-system/components';
import { useUser } from '@repo/auth/client';
import { Menu, Search as SearchIcon, X, ShoppingBag, Heart } from 'lucide-react';
import { hapticFeedback } from '@/lib/mobile/haptic-feedback';
import { platform } from '@/lib/mobile/platform-utils';
import { useI18n } from '../providers/i18n-provider';
import Link from 'next/link';
import { MobileButton } from '@/components/mobile/mobile-button';

export function MobileFirstHeader() {
  const { dictionary, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenuToggle = useCallback(() => {
    hapticFeedback.light();
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  const handleSearchToggle = useCallback(() => {
    hapticFeedback.light();
    setIsSearchOpen(!isSearchOpen);
  }, [isSearchOpen]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      hapticFeedback.medium();
      router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, router, locale]);

  const isIOS = platform.isIOS;

  return (
    <>
      {/* Main Header - Mobile First */}
      <header 
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'bg-background/95 backdrop-blur-md border-b',
          'md:relative md:bg-background',
          isIOS ? 'pt-[env(safe-area-inset-top)]' : ''
        )}
      >
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left Section */}
          <div className="flex items-center gap-2">
            <MobileButton
              variant="ghost"
              size="icon"
              touchSize="comfortable"
              onClick={handleMenuToggle}
              aria-label="Open menu"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </MobileButton>
            
            <Link 
              href={`/${locale}`}
              className="font-bold text-xl tracking-tight"
              onClick={() => hapticFeedback.light()}
            >
              Threadly
            </Link>
          </div>

          {/* Right Section - Mobile Actions */}
          <div className="flex items-center gap-1">
            <MobileButton
              variant="ghost"
              size="icon"
              touchSize="standard"
              onClick={handleSearchToggle}
              aria-label="Search"
              className="md:hidden"
            >
              <SearchIcon className="h-5 w-5" />
            </MobileButton>

            <Link href={`/${locale}/cart`} className="md:hidden">
              <MobileButton
                variant="ghost"
                size="icon"
                touchSize="standard"
                aria-label="Shopping cart"
                asChild
              >
                <span>
                  <ShoppingBag className="h-5 w-5" />
                </span>
              </MobileButton>
            </Link>

            {/* Desktop Search Bar */}
            <form 
              onSubmit={handleSearch}
              className="hidden md:flex items-center flex-1 max-w-xl mx-4"
            >
              <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={dictionary.web?.global?.navigation?.searchPlaceholder || 'Search...'}
                  className="w-full h-10 pl-10 pr-4 rounded-full border bg-muted/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </form>

            {/* Account Dropdown */}
            <div className="hidden md:flex items-center gap-2">
              <AccountDropdown />
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block border-t">
          <div className="container mx-auto">
            <div className="flex items-center justify-center gap-8 h-12">
              {['women', 'men', 'kids', 'accessories', 'shoes', 'bags'].map((category) => (
                <Link
                  key={category}
                  href={`/${locale}/category/${category}`}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    pathname.includes(`/category/${category}`) && 'text-primary'
                  )}
                >
                  {dictionary.web?.global?.categories?.[category as keyof typeof dictionary.web.global.categories] || category}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Search Sheet */}
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="top" className="h-auto">
          <SheetHeader>
            <SheetTitle>Search</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dictionary.web?.global?.navigation?.searchPlaceholder || 'Search products...'}
                className="w-full h-12 pl-10 pr-4 text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <MobileButton
                type="submit"
                className="flex-1"
                touchSize="comfortable"
                importance="primary"
              >
                Search
              </MobileButton>
              <MobileButton
                type="button"
                variant="outline"
                onClick={() => setIsSearchOpen(false)}
                touchSize="comfortable"
              >
                Cancel
              </MobileButton>
            </div>
          </form>

          {/* Popular Searches */}
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-2">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {['Vintage', 'Designer', 'Sneakers', 'Dresses'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch(new Event('submit') as any);
                  }}
                  className="px-4 py-2 text-sm rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-sm">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          
          <nav className="mt-6 space-y-1">
            {/* User Section */}
            {isSignedIn && isLoaded && (
              <div className="pb-4 mb-4 border-b">
                <Link
                  href={`/${locale}/account`}
                  onClick={() => {
                    hapticFeedback.light();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">U</span>
                  </div>
                  <div>
                    <p className="font-medium">My Account</p>
                    <p className="text-sm text-muted-foreground">View profile & orders</p>
                  </div>
                </Link>
              </div>
            )}

            {/* Categories */}
            <div className="space-y-1">
              <p className="px-2 py-1 text-sm font-medium text-muted-foreground">Categories</p>
              {['women', 'men', 'kids', 'accessories', 'shoes', 'bags'].map((category) => (
                <Link
                  key={category}
                  href={`/${locale}/category/${category}`}
                  onClick={() => {
                    hapticFeedback.light();
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    'block px-4 py-3 rounded-lg hover:bg-muted transition-colors',
                    pathname.includes(`/category/${category}`) && 'bg-muted'
                  )}
                >
                  <span className="capitalize">
                    {dictionary.web?.global?.categories?.[category as keyof typeof dictionary.web.global.categories] || category}
                  </span>
                </Link>
              ))}
            </div>

            {/* Quick Links */}
            <div className="space-y-1 pt-4 border-t">
              <p className="px-2 py-1 text-sm font-medium text-muted-foreground">Quick Links</p>
              
              <Link
                href={`/${locale}/favorites`}
                onClick={() => {
                  hapticFeedback.light();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Heart className="h-5 w-5" />
                <span>Favorites</span>
              </Link>

              {isSignedIn ? (
                <>
                  <Link
                    href={`/${locale}/orders`}
                    onClick={() => {
                      hapticFeedback.light();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span>My Orders</span>
                  </Link>
                </>
              ) : (
                <Link
                  href={`/${locale}/sign-in`}
                  onClick={() => {
                    hapticFeedback.light();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Sell Button */}
            <div className="pt-6">
              <Link href={`/${locale}/selling/new`}>
                <MobileButton
                  className="w-full"
                  touchSize="comfortable"
                  importance="primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Start Selling
                </MobileButton>
              </Link>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}