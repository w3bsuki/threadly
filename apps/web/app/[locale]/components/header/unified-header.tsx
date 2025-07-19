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
import { UserButton } from '@repo/auth/client';
import { ShoppingCart, Heart, Bell, Home, Search as SearchIcon, User, ShoppingBag, Sparkles, MessageSquare, Settings, Package } from 'lucide-react';
import { useI18n } from '../providers/i18n-provider';
import { CATEGORIES } from '@repo/navigation';
import Link from 'next/link';

export function UnifiedHeader() {
  const { dictionary, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

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
        { 
          label: 'Orders', 
          href: `/${locale}/orders`,
          emoji: '📦',
        },
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
      <Link href={`/${locale}/cart`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">{dictionary.web.global.navigation.cart}</span>
        </Button>
      </Link>
      <UserButton />
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