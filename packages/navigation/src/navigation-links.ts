export interface NavigationLink {
  href: string;
  label: string;
  icon?: string;
  badge?: string | number;
  external?: boolean;
}

export interface NavigationSection {
  title: string;
  links: NavigationLink[];
}

export const mainNavigationLinks: NavigationLink[] = [
  { href: '/browse', label: 'Browse' },
  { href: '/categories', label: 'Categories' },
  { href: '/collections', label: 'Collections' },
  { href: '/pricing', label: 'Pricing' },
];

export const quickLinks: NavigationLink[] = [
  { href: '/products?condition=NEW_WITH_TAGS', label: 'NEW', badge: 'Hot' },
  { href: '/products?sale=true', label: 'SALE', badge: 'Limited' },
  { href: '/products?sort=popular', label: 'HOT', badge: 'Trending' },
];

export const footerLinks: NavigationSection[] = [
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      { href: '/careers', label: 'Careers' },
      { href: '/press', label: 'Press' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/help', label: 'Help Center' },
      { href: '/safety', label: 'Safety' },
      { href: '/shipping', label: 'Shipping' },
      { href: '/returns', label: 'Returns' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/legal/terms', label: 'Terms of Service' },
      { href: '/legal/privacy', label: 'Privacy Policy' },
      { href: '/legal/cookies', label: 'Cookie Policy' },
      { href: '/legal/community', label: 'Community Guidelines' },
    ],
  },
  {
    title: 'Social',
    links: [
      { href: 'https://twitter.com/threadly', label: 'Twitter', external: true },
      { href: 'https://instagram.com/threadly', label: 'Instagram', external: true },
      { href: 'https://facebook.com/threadly', label: 'Facebook', external: true },
      { href: 'https://tiktok.com/@threadly', label: 'TikTok', external: true },
    ],
  },
];