'use client';

import { useUser } from '@repo/auth/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@repo/design-system/components';
import { AccountDropdown } from '@repo/design-system/components/navigation/account-dropdown';
import { cn } from '@repo/design-system/lib/utils';
import {
  Heart,
  Menu,
  Search as SearchIcon,
  ShoppingBag,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { MobileButton } from '@/components/mobile/mobile-button';
import { hapticFeedback } from '@/lib/mobile/haptic-feedback';
import { platform } from '@/lib/mobile/platform-utils';
import { useI18n } from '../providers/i18n-provider';

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

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        hapticFeedback.medium();
        router.push(
          `/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`
        );
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    },
    [searchQuery, router, locale]
  );

  const isIOS = platform.isIOS;

  return (
    <>
      {/* Main Header - Mobile First */}
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50',
          'border-b bg-background/95 backdrop-blur-md',
          'md:relative md:bg-background',
          isIOS ? 'pt-[env(safe-area-inset-top)]' : ''
        )}
      >
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left Section */}
          <div className="flex items-center gap-2">
            <MobileButton
              aria-label="Open menu"
              className="md:hidden"
              onClick={handleMenuToggle}
              size="icon"
              touchSize="comfortable"
              variant="ghost"
            >
              <Menu className="h-5 w-5" />
            </MobileButton>

            <Link
              className="font-bold text-xl tracking-tight"
              href={`/${locale}`}
              onClick={() => hapticFeedback.light()}
            >
              Threadly
            </Link>
          </div>

          {/* Right Section - Mobile Actions */}
          <div className="flex items-center gap-1">
            <MobileButton
              aria-label="Search"
              className="md:hidden"
              onClick={handleSearchToggle}
              size="icon"
              touchSize="standard"
              variant="ghost"
            >
              <SearchIcon className="h-5 w-5" />
            </MobileButton>

            <Link className="md:hidden" href={`/${locale}/cart`}>
              <MobileButton
                aria-label="Shopping cart"
                asChild
                size="icon"
                touchSize="standard"
                variant="ghost"
              >
                <span>
                  <ShoppingBag className="h-5 w-5" />
                </span>
              </MobileButton>
            </Link>

            {/* Desktop Search Bar */}
            <form
              className="mx-4 hidden max-w-xl flex-1 items-center md:flex"
              onSubmit={handleSearch}
            >
              <div className="relative w-full">
                <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                <input
                  className="h-10 w-full rounded-full border bg-muted/50 pr-4 pl-10 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    dictionary.web?.global?.navigation?.searchPlaceholder ||
                    'Search...'
                  }
                  type="search"
                  value={searchQuery}
                />
              </div>
            </form>

            {/* Account Dropdown */}
            <div className="hidden items-center gap-2 md:flex">
              <AccountDropdown />
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden border-t md:block">
          <div className="container mx-auto">
            <div className="flex h-12 items-center justify-center gap-8">
              {['women', 'men', 'kids', 'accessories', 'shoes', 'bags'].map(
                (category) => (
                  <Link
                    className={cn(
                      'font-medium text-sm transition-colors hover:text-primary',
                      pathname.includes(`/category/${category}`) &&
                        'text-primary'
                    )}
                    href={`/${locale}/category/${category}`}
                    key={category}
                  >
                    {dictionary.web?.global?.categories?.[
                      category as keyof typeof dictionary.web.global.categories
                    ] || category}
                  </Link>
                )
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Search Sheet */}
      <Sheet onOpenChange={setIsSearchOpen} open={isSearchOpen}>
        <SheetContent className="h-auto" side="top">
          <SheetHeader>
            <SheetTitle>Search</SheetTitle>
          </SheetHeader>
          <form className="mt-4" onSubmit={handleSearch}>
            <div className="relative">
              <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-muted-foreground" />
              <input
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                autoFocus
                className="h-12 w-full rounded-lg border pr-4 pl-10 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  dictionary.web?.global?.navigation?.searchPlaceholder ||
                  'Search products...'
                }
                type="search"
                value={searchQuery}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <MobileButton
                className="flex-1"
                importance="primary"
                touchSize="comfortable"
                type="submit"
              >
                Search
              </MobileButton>
              <MobileButton
                onClick={() => setIsSearchOpen(false)}
                touchSize="comfortable"
                type="button"
                variant="outline"
              >
                Cancel
              </MobileButton>
            </div>
          </form>

          {/* Popular Searches */}
          <div className="mt-6">
            <p className="mb-2 text-muted-foreground text-sm">
              Popular searches
            </p>
            <div className="flex flex-wrap gap-2">
              {['Vintage', 'Designer', 'Sneakers', 'Dresses'].map((term) => (
                <button
                  className="rounded-full bg-muted px-4 py-2 text-sm transition-colors hover:bg-muted/80"
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch(new Event('submit') as any);
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Menu Sheet */}
      <Sheet onOpenChange={setIsMenuOpen} open={isMenuOpen}>
        <SheetContent className="w-[85vw] max-w-sm" side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <nav className="mt-6 space-y-1">
            {/* User Section */}
            {isSignedIn && isLoaded && (
              <div className="mb-4 border-b pb-4">
                <Link
                  className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted"
                  href={`/${locale}/account`}
                  onClick={() => {
                    hapticFeedback.light();
                    setIsMenuOpen(false);
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-semibold text-primary">U</span>
                  </div>
                  <div>
                    <p className="font-medium">My Account</p>
                    <p className="text-muted-foreground text-sm">
                      View profile & orders
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* Categories */}
            <div className="space-y-1">
              <p className="px-2 py-1 font-medium text-muted-foreground text-sm">
                Categories
              </p>
              {['women', 'men', 'kids', 'accessories', 'shoes', 'bags'].map(
                (category) => (
                  <Link
                    className={cn(
                      'block rounded-lg px-4 py-3 transition-colors hover:bg-muted',
                      pathname.includes(`/category/${category}`) && 'bg-muted'
                    )}
                    href={`/${locale}/category/${category}`}
                    key={category}
                    onClick={() => {
                      hapticFeedback.light();
                      setIsMenuOpen(false);
                    }}
                  >
                    <span className="capitalize">
                      {dictionary.web?.global?.categories?.[
                        category as keyof typeof dictionary.web.global.categories
                      ] || category}
                    </span>
                  </Link>
                )
              )}
            </div>

            {/* Quick Links */}
            <div className="space-y-1 border-t pt-4">
              <p className="px-2 py-1 font-medium text-muted-foreground text-sm">
                Quick Links
              </p>

              <Link
                className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-muted"
                href={`/${locale}/favorites`}
                onClick={() => {
                  hapticFeedback.light();
                  setIsMenuOpen(false);
                }}
              >
                <Heart className="h-5 w-5" />
                <span>Favorites</span>
              </Link>

              {isSignedIn ? (
                <>
                  <Link
                    className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-muted"
                    href={`/${locale}/orders`}
                    onClick={() => {
                      hapticFeedback.light();
                      setIsMenuOpen(false);
                    }}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span>My Orders</span>
                  </Link>
                </>
              ) : (
                <Link
                  className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-muted"
                  href={`/${locale}/sign-in`}
                  onClick={() => {
                    hapticFeedback.light();
                    setIsMenuOpen(false);
                  }}
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
                  importance="primary"
                  onClick={() => setIsMenuOpen(false)}
                  touchSize="comfortable"
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
