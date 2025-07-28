'use client';

import { UserButton, useUser } from '@repo/auth/client';
import { Button } from '@repo/design-system/components';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import {
  Header,
  HeaderActions,
  MobileDropdownMenu,
  StickyHeader,
} from '@repo/design-system/components/navigation';
import {
  Bell,
  Heart,
  Home,
  MessageSquare,
  Package,
  Search as SearchIcon,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CATEGORIES } from '../navigation/categories';
import { useI18n } from '../providers/i18n-provider';

export function UnifiedHeader() {
  const { dictionary, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const { isSignedIn, isLoaded } = useUser();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const categoryEmojis: Record<string, string> = {
    Men: '👔',
    Women: '👗',
    Kids: '👶',
    Unisex: '🌈',
    Accessories: '👜',
    Shoes: '👟',
    Jewelry: '💍',
    Bags: '🎒',
  };

  const categories = CATEGORIES.map((category) => {
    const translatedName =
      dictionary.web.global.categories?.[
        category.name.toLowerCase() as keyof typeof dictionary.web.global.categories
      ] || category.name;

    return {
      label: translatedName,
      href: `/${locale}${category.href}`,
      emoji: categoryEmojis[category.name] || '🛍️',
      children: category.subcategories.map((sub) => ({
        label: sub.name,
        href: `/${locale}${sub.href}`,
        emoji: '✨',
      })),
    };
  });

  // Mobile menu sections with emojis - compact version
  const navigationSections = [
    {
      items: [
        {
          label: 'Search',
          icon: SearchIcon,
          emoji: '🔍',
          onClick: () => router.push(`/${locale}/search`),
        },
        ...(!isSignedIn && isLoaded
          ? [
              {
                label: 'Sign In',
                icon: User,
                emoji: '👤',
                onClick: () => router.push(`/${locale}/sign-in`),
              },
            ]
          : []),
      ],
    },
    {
      title: 'Categories',
      items: categories.slice(0, 4), // Show only first 4 categories
    },
    {
      title: 'Quick Links',
      grid: true,
      items: [
        ...(isSignedIn
          ? [
              {
                label: 'Orders',
                href: `/${locale}/orders`,
                emoji: '📦',
              },
              {
                label: 'Account',
                href: `/${locale}/account`,
                emoji: '👤',
              },
            ]
          : []),
        {
          label: 'Settings',
          href: `/${locale}/settings`,
          emoji: '⚙️',
        },
      ],
    },
  ];

  const mobileMenuFooter = (
    <Link className="block" href={`/${locale}/selling/new`}>
      <Button className="h-9 w-full bg-gradient-to-r from-primary to-primary/80 text-sm shadow-md hover:from-primary/90 hover:to-primary/70">
        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
        {dictionary.web.global.navigation.startSelling}
      </Button>
    </Link>
  );

  // Desktop only actions - mobile has these in bottom nav
  const headerActions = (
    <>
      <ModeToggle />
      {isLoaded &&
        (isSignedIn ? (
          <UserButton />
        ) : (
          <Link href={`/${locale}/sign-in`}>
            <Button size="sm" variant="default">
              Sign In
            </Button>
          </Link>
        ))}
    </>
  );

  return (
    <StickyHeader>
      <Header
        actions={<HeaderActions>{headerActions}</HeaderActions>}
        logo={{
          text: 'Threadly',
          href: `/${locale}`,
        }}
        mobileMenu={
          <MobileDropdownMenu
            contentClassName="md:hidden"
            footer={mobileMenuFooter}
            sections={navigationSections}
          />
        }
        search={{
          placeholder:
            dictionary.web.global.navigation.searchPlaceholder ||
            'Search products...',
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          onSearch: handleSearch,
        }}
      />
    </StickyHeader>
  );
}
