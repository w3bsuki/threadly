export interface Category {
  name: string;
  href: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  name: string;
  href: string;
  icon: string;
  popular?: boolean;
}

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

export const CATEGORIES: readonly Category[] = [
  {
    name: 'Women',
    href: '/women',
    icon: '👗',
    subcategories: [
      { name: 'Dresses', href: '/women/dresses', icon: '👗', popular: true },
      { name: 'Tops', href: '/women/tops', icon: '👚', popular: true },
      { name: 'Bottoms', href: '/women/bottoms', icon: '👖', popular: true },
      { name: 'Jackets', href: '/women/jackets', icon: '🧥' },
      { name: 'Shoes', href: '/women/shoes', icon: '👠', popular: true },
      { name: 'Bags', href: '/women/bags', icon: '👜' },
      { name: 'Swimwear', href: '/women/swimwear', icon: '👙' },
      { name: 'Lingerie', href: '/women/lingerie', icon: '👙' },
      { name: 'Accessories', href: '/women/accessories', icon: '💍' },
      { name: 'Activewear', href: '/women/activewear', icon: '🏃‍♀️' },
    ],
  },
  {
    name: 'Men',
    href: '/men',
    icon: '👔',
    subcategories: [
      { name: 'Shirts', href: '/men/shirts', icon: '👔', popular: true },
      { name: 'T-shirts', href: '/men/tshirts', icon: '👕', popular: true },
      { name: 'Pants', href: '/men/pants', icon: '👖', popular: true },
      { name: 'Jackets', href: '/men/jackets', icon: '🧥' },
      { name: 'Shoes', href: '/men/shoes', icon: '👟', popular: true },
      { name: 'Accessories', href: '/men/accessories', icon: '⌚' },
      { name: 'Suits', href: '/men/suits', icon: '🤵' },
      { name: 'Shorts', href: '/men/shorts', icon: '🩳' },
      { name: 'Activewear', href: '/men/activewear', icon: '🏃‍♂️' },
      { name: 'Underwear', href: '/men/underwear', icon: '🩲' },
    ],
  },
  {
    name: 'Kids',
    href: '/kids',
    icon: '👶',
    subcategories: [
      { name: 'Boys', href: '/kids/boys', icon: '👦', popular: true },
      { name: 'Girls', href: '/kids/girls', icon: '👧', popular: true },
      { name: 'Baby', href: '/kids/baby', icon: '👶', popular: true },
      { name: 'Shoes', href: '/kids/shoes', icon: '👟' },
      { name: 'Toys', href: '/kids/toys', icon: '🧸' },
      { name: 'School', href: '/kids/school', icon: '🎒' },
    ],
  },
  {
    name: 'Unisex',
    href: '/unisex',
    icon: '👕',
    subcategories: [
      { name: 'T-shirts', href: '/unisex/tshirts', icon: '👕' },
      { name: 'Hoodies', href: '/unisex/hoodies', icon: '🧥' },
      { name: 'Accessories', href: '/unisex/accessories', icon: '👓' },
      { name: 'Bags', href: '/unisex/bags', icon: '🎒' },
    ],
  },
  {
    name: 'Designer',
    href: '/designer',
    icon: '👑',
    subcategories: [
      { name: 'Luxury', href: '/designer/luxury', icon: '💎' },
      { name: 'Streetwear', href: '/designer/streetwear', icon: '🧢' },
      { name: 'Handbags', href: '/designer/handbags', icon: '👜' },
      { name: 'Shoes', href: '/designer/shoes', icon: '👠' },
    ],
  },
  {
    name: 'Vintage',
    href: '/vintage',
    icon: '📿',
    subcategories: [
      { name: '80s', href: '/vintage/80s', icon: '🕺' },
      { name: '90s', href: '/vintage/90s', icon: '📼' },
      { name: 'Y2K', href: '/vintage/y2k', icon: '💿' },
      { name: 'Retro', href: '/vintage/retro', icon: '🎭' },
    ],
  },
] as const;

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
      {
        href: 'https://twitter.com/threadly',
        label: 'Twitter',
        external: true,
      },
      {
        href: 'https://instagram.com/threadly',
        label: 'Instagram',
        external: true,
      },
      {
        href: 'https://facebook.com/threadly',
        label: 'Facebook',
        external: true,
      },
      { href: 'https://tiktok.com/@threadly', label: 'TikTok', external: true },
    ],
  },
];
