'use client';

import { useUser } from '@repo/auth/client';
import { cn } from '@repo/design-system/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Clock,
  Heart,
  Home,
  Search,
  ShoppingBag,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
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

export const MobileBottomNav = memo(
  ({ onSearchOpen }: MobileBottomNavProps) => {
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
        shortcutKey: 'h',
      },
      {
        icon: Search,
        label: dictionary.web?.global?.navigation?.search || 'Search',
        onClick: () => {
          triggerHapticFeedback();
          if (onSearchOpen) {
            onSearchOpen();
          } else {
            setIsSearchOpen(true);
          }
          announceToScreenReader('Search panel opened');
        },
        shortcutKey: 's',
      },
      {
        icon: ShoppingBag,
        label: dictionary.web?.global?.navigation?.shop || 'Shop',
        href: `/${locale}/products`,
        shortcutKey: 'p',
      },
      {
        icon: Heart,
        label: dictionary.web?.global?.navigation?.saved || 'Saved',
        href: `/${locale}/favorites`,
        shortcutKey: 'f',
      },
      {
        icon: User,
        label: dictionary.web?.global?.navigation?.account || 'Account',
        href: isSignedIn ? `/${locale}/account` : `/${locale}/sign-in`,
        shortcutKey: 'a',
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
          const item = navItems.find(
            (item) => item.shortcutKey === e.key.toLowerCase()
          );
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
              setFocusedIndex((prev) => {
                const newIndex = prev <= 0 ? navItems.length - 1 : prev - 1;
                itemRefs.current[newIndex]?.focus();
                return newIndex;
              });
              break;
            case 'ArrowRight':
              e.preventDefault();
              setFocusedIndex((prev) => {
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
          animate={{ y: isVisible ? 0 : 100 }}
          aria-label="Mobile bottom navigation"
          className={cn(
            'fixed right-0 bottom-0 left-0 z-40 md:hidden',
            'border-border/50 border-t bg-background/95 backdrop-blur-xl',
            'pb-[env(safe-area-inset-bottom)]',
            'shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'
          )}
          initial={{ y: 0 }}
          ref={navRef}
          role="navigation"
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <div className="flex items-center justify-around" role="list">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item);
              const ariaLabel = `${item.label}${active ? ' (current page)' : ''}${item.shortcutKey ? `. Keyboard shortcut: Alt + ${item.shortcutKey.toUpperCase()}` : ''}`;

              if (item.onClick) {
                return (
                  <button
                    aria-current={active ? 'page' : undefined}
                    aria-label={ariaLabel}
                    className={cn(
                      'relative flex min-h-[60px] w-full flex-col items-center justify-center gap-0.5 px-2',
                      'transition-all duration-200 active:scale-95',
                      'hover:bg-muted/30 focus-visible:bg-muted/30',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                      'touch-manipulation',
                      'rounded-xl'
                    )}
                    key={item.label}
                    onClick={item.onClick}
                    onFocus={() => setFocusedIndex(index)}
                    ref={(el) => (itemRefs.current[index] = el)}
                    role="listitem"
                    type="button"
                  >
                    <motion.div
                      animate={active ? { scale: 1.1 } : { scale: 1 }}
                      className="relative flex h-8 w-8 items-center justify-center"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon
                        aria-hidden="true"
                        className={cn(
                          'h-5 w-5 transition-all duration-200',
                          active ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      {active && (
                        <motion.div
                          aria-hidden="true"
                          className="absolute inset-0 rounded-lg bg-primary/10"
                          layoutId="activeTabBg"
                          transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.div>
                    <span
                      className={cn(
                        'mt-0.5 font-medium text-[10px] transition-all duration-200',
                        active
                          ? 'font-semibold text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  aria-current={active ? 'page' : undefined}
                  aria-label={ariaLabel}
                  className={cn(
                    'relative flex min-h-[60px] w-full flex-col items-center justify-center gap-0.5 px-2',
                    'transition-all duration-200 active:scale-95',
                    'hover:bg-muted/30 focus-visible:bg-muted/30',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                    'touch-manipulation',
                    'rounded-xl'
                  )}
                  href={item.href!}
                  key={item.label}
                  onClick={triggerHapticFeedback}
                  onFocus={() => setFocusedIndex(index)}
                  ref={(el) => (itemRefs.current[index] = el)}
                  role="listitem"
                >
                  <motion.div
                    animate={active ? { scale: 1.1 } : { scale: 1 }}
                    className="relative flex h-8 w-8 items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon
                      aria-hidden="true"
                      className={cn(
                        'h-5 w-5 transition-all duration-200',
                        active ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    {active && (
                      <motion.div
                        aria-hidden="true"
                        className="absolute inset-0 rounded-lg bg-primary/10"
                        layoutId="activeTabBg"
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.div>
                  <span
                    className={cn(
                      'mt-0.5 font-medium text-[10px] transition-all duration-200',
                      active
                        ? 'font-semibold text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Screen reader only instructions */}
          <div
            aria-label="Navigation instructions"
            className="sr-only"
            role="region"
          >
            <p>
              Use arrow keys to navigate between items. Press Alt plus the first
              letter of each section for quick access:
            </p>
            <ul>
              {navItems.map((item) => (
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
                  animate={{ opacity: 1 }}
                  aria-hidden="true"
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  onClick={() => setIsSearchOpen(false)}
                  transition={{ duration: 0.2 }}
                />

                {/* Search Panel */}
                <motion.div
                  animate={{ y: 0 }}
                  className="fixed right-0 bottom-0 left-0 z-50 rounded-t-3xl bg-background pb-[env(safe-area-inset-bottom)] shadow-2xl"
                  exit={{ y: '100%' }}
                  initial={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  {/* Drag Handle */}
                  <div className="flex justify-center pt-2 pb-1">
                    <div className="h-1 w-12 rounded-full bg-muted-foreground/20" />
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 pb-3">
                    <h2 className="font-semibold text-lg">
                      {dictionary.web?.search?.title || 'Search'}
                    </h2>
                    <button
                      aria-label={
                        dictionary.web?.global?.navigation?.close || 'Close'
                      }
                      className="rounded-full p-2 transition-colors hover:bg-muted"
                      onClick={() => {
                        setIsSearchOpen(false);
                        triggerHapticFeedback();
                      }}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Search Form */}
                  <form
                    className="px-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (searchQuery.trim()) {
                        triggerHapticFeedback();
                        router.push(
                          `/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`
                        );
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }
                    }}
                  >
                    <div className="relative mb-4">
                      <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-muted-foreground" />
                      <input
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        autoFocus
                        className="h-14 w-full rounded-2xl border-0 bg-muted/50 pr-4 pl-12 text-base transition-all focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                          dictionary.web?.global?.navigation
                            ?.searchPlaceholder ||
                          'Search for items, brands, or members'
                        }
                        type="search"
                        value={searchQuery}
                      />
                    </div>

                    {/* Quick Search Suggestions */}
                    <div className="mb-4">
                      <div className="mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground text-sm">
                          {dictionary.web?.search?.trending || 'Trending'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Vintage',
                          'Designer',
                          'Streetwear',
                          'Sustainable',
                        ].map((term) => (
                          <button
                            className="rounded-full bg-muted/50 px-4 py-2 text-sm transition-colors hover:bg-muted"
                            key={term}
                            onClick={() => {
                              setSearchQuery(term);
                              triggerHapticFeedback();
                            }}
                            type="button"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recent Searches */}
                    <div className="mb-6">
                      <div className="mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground text-sm">
                          {dictionary.web?.search?.recent || 'Recent'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {['Denim jacket', 'Nike sneakers', 'Summer dress'].map(
                          (term) => (
                            <button
                              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-muted/50"
                              key={term}
                              onClick={() => {
                                setSearchQuery(term);
                                triggerHapticFeedback();
                              }}
                              type="button"
                            >
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{term}</span>
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pb-4">
                      <button
                        className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!searchQuery.trim()}
                        type="submit"
                      >
                        <Search className="h-5 w-5" />
                        {dictionary.web?.global?.navigation?.search || 'Search'}
                      </button>
                      <button
                        className="h-14 rounded-2xl border-2 border-muted px-6 font-medium transition-colors hover:bg-muted"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          triggerHapticFeedback();
                        }}
                        type="button"
                      >
                        {dictionary.web?.global?.navigation?.cancel || 'Cancel'}
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
  }
);

MobileBottomNav.displayName = 'MobileBottomNav';
