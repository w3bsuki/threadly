'use client';

import { useUser } from '@repo/auth/client';
import { cn } from '@repo/design-system/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Home, Search, ShoppingBag, User, X, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useState, useRef } from 'react';
import { useI18n } from './providers/i18n-provider';

interface NavItem {
  icon: typeof Home;
  label: string;
  href?: string;
  onClick?: () => void;
  shortcutKey?: string;
}

interface MobileBottomNavProps {
  onSearchOpen?: () => void;
}

// Screen reader announcement utility
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
};

export const MobileBottomNav = memo(({ onSearchOpen }: MobileBottomNavProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { dictionary, locale } = useI18n();
  const { isSignedIn } = useUser();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // Hide/show nav on scroll with better thresholds
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDelta = currentScrollY - lastScrollY;
          
          // Show when at top or scrolling up significantly
          if (currentScrollY < 50 || scrollDelta < -10) {
            setIsVisible(true);
          } 
          // Hide when scrolling down significantly
          else if (scrollDelta > 10) {
            setIsVisible(false);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const navItems: NavItem[] = [
    {
      icon: Home,
      label: dictionary.web?.global?.navigation?.home || 'Home',
      href: `/${locale}`,
      shortcutKey: 'h'
    },
    {
      icon: Search,
      label: dictionary.web?.global?.actions?.search || 'Search',
      onClick: () => {
        triggerHapticFeedback();
        if (onSearchOpen) {
          onSearchOpen();
        } else {
          setIsSearchOpen(true);
        }
        announceToScreenReader('Search panel opened');
      },
      shortcutKey: 's'
    },
    {
      icon: ShoppingBag,
      label: dictionary.web?.global?.navigation?.shop || 'Shop',
      href: `/${locale}/products`,
      shortcutKey: 'p'
    },
    {
      icon: Heart,
      label: dictionary.web?.global?.navigation?.saved || 'Saved',
      href: `/${locale}/favorites`,
      shortcutKey: 'f'
    },
    {
      icon: User,
      label: dictionary.web?.settings?.account || 'Account',
      href: isSignedIn ? `/${locale}/account` : `/${locale}/sign-in`,
      shortcutKey: 'a'
    },
  ];

  const isActive = (item: NavItem) => {
    if (item.href) {
      return pathname === item.href || pathname.startsWith(item.href + '/');
    }
    return false;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + key shortcuts for quick navigation
      if (e.altKey) {
        const item = navItems.find(item => item.shortcutKey === e.key.toLowerCase());
        if (item) {
          e.preventDefault();
          triggerHapticFeedback();
          
          if (item.onClick) {
            item.onClick();
          } else if (item.href) {
            window.location.href = item.href;
          }
          
          announceToScreenReader(`Navigating to ${item.label}`);
          return;
        }
      }

      // Tab navigation within the nav
      if (navRef.current?.contains(document.activeElement)) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            setFocusedIndex(prev => {
              const newIndex = prev <= 0 ? navItems.length - 1 : prev - 1;
              itemRefs.current[newIndex]?.focus();
              return newIndex;
            });
            break;
          case 'ArrowRight':
            e.preventDefault();
            setFocusedIndex(prev => {
              const newIndex = prev >= navItems.length - 1 ? 0 : prev + 1;
              itemRefs.current[newIndex]?.focus();
              return newIndex;
            });
            break;
          case 'Home':
            e.preventDefault();
            setFocusedIndex(0);
            itemRefs.current[0]?.focus();
            break;
          case 'End':
            e.preventDefault();
            setFocusedIndex(navItems.length - 1);
            itemRefs.current[navItems.length - 1]?.focus();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navItems, triggerHapticFeedback]);

  // Announce visibility changes to screen readers
  useEffect(() => {
    if (isVisible) {
      announceToScreenReader('Navigation menu is visible');
    } else {
      announceToScreenReader('Navigation menu is hidden');
    }
  }, [isVisible]);

  return (
    <>
    <motion.nav
      ref={navRef}
      animate={{ y: isVisible ? 0 : 100 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 md:hidden',
        'bg-background/95 backdrop-blur-xl border-t border-border/50',
        'pb-[env(safe-area-inset-bottom)]',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'
      )}
      initial={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center justify-around" role="list">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item);
          const ariaLabel = `${item.label}${active ? ' (current page)' : ''}${item.shortcutKey ? `. Keyboard shortcut: Alt + ${item.shortcutKey.toUpperCase()}` : ''}`;

          if (item.onClick) {
            return (
              <button
                key={item.label}
                ref={el => itemRefs.current[index] = el}
                aria-label={ariaLabel}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-[60px] w-full flex-col items-center justify-center gap-0.5 px-2',
                  'transition-all duration-200 active:scale-95',
                  'hover:bg-muted/30 focus-visible:bg-muted/30',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                  'touch-manipulation',
                  'rounded-xl'
                )}
                onClick={item.onClick}
                onFocus={() => setFocusedIndex(index)}
                type="button"
                role="listitem"
              >
                <motion.div
                  animate={active ? { scale: 1.1 } : { scale: 1 }}
                  className="relative flex items-center justify-center w-8 h-8"
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-all duration-200',
                      active ? 'text-primary' : 'text-muted-foreground'
                    )}
                    aria-hidden="true"
                  />
                  {active && (
                    <motion.div
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      layoutId="activeTabBg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      aria-hidden="true"
                    />
                  )}
                </motion.div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-all duration-200 mt-0.5',
                    active ? 'text-primary font-semibold' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              ref={el => itemRefs.current[index] = el}
              aria-label={ariaLabel}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-[60px] w-full flex-col items-center justify-center gap-0.5 px-2',
                'transition-all duration-200 active:scale-95',
                'hover:bg-muted/30 focus-visible:bg-muted/30',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                'touch-manipulation',
                'rounded-xl'
              )}
              href={item.href!}
              onClick={triggerHapticFeedback}
              onFocus={() => setFocusedIndex(index)}
              role="listitem"
            >
              <motion.div
                animate={active ? { scale: 1.1 } : { scale: 1 }}
                className="relative flex items-center justify-center w-8 h-8"
                whileTap={{ scale: 0.9 }}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all duration-200',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                  aria-hidden="true"
                />
                {active && (
                  <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    layoutId="activeTabBg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    aria-hidden="true"
                  />
                )}
              </motion.div>
              <span
                className={cn(
                  'text-[10px] font-medium transition-all duration-200 mt-0.5',
                  active ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Screen reader only instructions */}
      <div className="sr-only" role="region" aria-label="Navigation instructions">
        <p>Use arrow keys to navigate between items. Press Alt plus the first letter of each section for quick access:</p>
        <ul>
          {navItems.map(item => (
            <li key={item.label}>
              Alt + {item.shortcutKey?.toUpperCase()}: {item.label}
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>

    {/* Modern Search Modal */}
    {!onSearchOpen && (
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsSearchOpen(false)}
              aria-hidden="true"
            />
            
            {/* Search Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl pb-[env(safe-area-inset-bottom)]"
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-12 h-1 bg-muted-foreground/20 rounded-full" />
              </div>
              
              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3">
                <h2 className="text-lg font-semibold">
                  {dictionary.web?.search?.title || 'Search'}
                </h2>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    triggerHapticFeedback();
                  }}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label={dictionary.web?.global?.actions?.close || 'Close'}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Search Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    triggerHapticFeedback();
                    router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }
                }} 
                className="px-4"
              >
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={dictionary.web?.global?.navigation?.searchPlaceholder || 'Search for items, brands, or members'}
                    className="w-full h-14 pl-12 pr-4 text-base bg-muted/50 rounded-2xl border-0 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                </div>
                
                {/* Quick Search Suggestions */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {dictionary.web?.search?.trending || 'Trending'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Vintage', 'Designer', 'Streetwear', 'Sustainable'].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setSearchQuery(term);
                          triggerHapticFeedback();
                        }}
                        className="px-4 py-2 text-sm bg-muted/50 hover:bg-muted rounded-full transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Recent Searches */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {dictionary.web?.search?.recent || 'Recent'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {['Denim jacket', 'Nike sneakers', 'Summer dress'].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setSearchQuery(term);
                          triggerHapticFeedback();
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-muted/50 rounded-xl transition-colors flex items-center gap-3"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pb-4">
                  <button
                    type="submit"
                    disabled={!searchQuery.trim()}
                    className="flex-1 h-14 px-6 bg-primary text-primary-foreground rounded-2xl font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Search className="h-5 w-5" />
                    {dictionary.web?.global?.actions?.search || 'Search'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      triggerHapticFeedback();
                    }}
                    className="px-6 h-14 border-2 border-muted rounded-2xl font-medium hover:bg-muted transition-colors"
                  >
                    {dictionary.web?.global?.actions?.cancel || 'Cancel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )}
    </>
  );
});

MobileBottomNav.displayName = 'MobileBottomNav';