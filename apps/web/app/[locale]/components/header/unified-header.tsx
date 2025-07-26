'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Header,
  MobileDropdownMenu,
  HeaderActions,
  StickyHeader,
} from '@repo/design-system/components/navigation';
import { Button } from '@repo/design-system/components';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { UserButton, useUser } from '@repo/auth/client';
import { ShoppingCart, Heart, Bell, Home, Search as SearchIcon, User, ShoppingBag, Sparkles, MessageSquare, Settings, Package } from 'lucide-react';
import { useI18n } from '../providers/i18n-provider';
import Link from 'next/link';
import { CATEGORIES } from '../navigation/categories';

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
    'Men': '👔',
    'Women': '👗',
    'Kids': '👶',
    'Unisex': '🌈',
    'Accessories': '👜',
    'Shoes': '👟',
    'Jewelry': '💍',
    'Bags': '🎒',
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
        ...(!isSignedIn && isLoaded ? [{
          label: 'Sign In',
          icon: User,
          emoji: '👤',
          onClick: () => router.push(`/${locale}/sign-in`),
        }] : []),
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
        ...(isSignedIn ? [
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
        ] : []),
        {
          label: 'Settings',
          href: `/${locale}/settings`,
          emoji: '⚙️',
        },
      ],
    },
  ];


  const mobileMenuFooter = (
    <Link href={`/${locale}/selling/new`} className="block">
      <Button className="w-full h-9 text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md">
        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
        {dictionary.web.global.navigation.startSelling}
      </Button>
    </Link>
  );

  // Desktop only actions - mobile has these in bottom nav
  const headerActions = (
    <>
      <ModeToggle />
      {isLoaded && (
        isSignedIn ? (
          <UserButton />
        ) : (
          <Link href={`/${locale}/sign-in`}>
            <Button variant="default" size="sm">
              Sign In
            </Button>
          </Link>
        )
      )}
    </>
  );

  return (
    <StickyHeader>
      <Header
        logo={{
          text: 'Threadly',
          href: `/${locale}`,
        }}
        search={{
          placeholder: dictionary.web.global.navigation.searchPlaceholder || 'Search products...',
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          onSearch: handleSearch,
        }}
        actions={<HeaderActions>{headerActions}</HeaderActions>}
        mobileMenu={
          <MobileDropdownMenu
            sections={navigationSections}
            footer={mobileMenuFooter}
            contentClassName="md:hidden"
          />
        }
      />
    </StickyHeader>
  );
}