export interface Subcategory {
  name: string;
  href: string;
  icon: string;
  popular?: boolean;
}

export interface Category {
  name: string;
  href: string;
  icon: string;
  subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
  {
    name: 'Women',
    href: '/category/women',
    icon: '👗',
    subcategories: [
      { name: 'Clothing', href: '/category/women/clothing', icon: '👚' },
      { name: 'Shoes', href: '/category/women/shoes', icon: '👠' },
      { name: 'Accessories', href: '/category/women/accessories', icon: '👜' },
      { name: 'Bags', href: '/category/women/bags', icon: '👛', popular: true },
    ],
  },
  {
    name: 'Men',
    href: '/category/men',
    icon: '👔',
    subcategories: [
      { name: 'Clothing', href: '/category/men/clothing', icon: '👕' },
      { name: 'Shoes', href: '/category/men/shoes', icon: '👞' },
      { name: 'Accessories', href: '/category/men/accessories', icon: '⌚' },
      { name: 'Bags', href: '/category/men/bags', icon: '💼' },
    ],
  },
  {
    name: 'Kids',
    href: '/category/kids',
    icon: '👶',
    subcategories: [
      { name: 'Clothing', href: '/category/kids/clothing', icon: '👕' },
      { name: 'Shoes', href: '/category/kids/shoes', icon: '👟' },
      { name: 'Toys', href: '/category/kids/toys', icon: '🧸', popular: true },
    ],
  },
  {
    name: 'Electronics',
    href: '/category/electronics',
    icon: '📱',
    subcategories: [
      {
        name: 'Phones',
        href: '/category/electronics/phones',
        icon: '📱',
        popular: true,
      },
      { name: 'Laptops', href: '/category/electronics/laptops', icon: '💻' },
      {
        name: 'Accessories',
        href: '/category/electronics/accessories',
        icon: '🎧',
      },
    ],
  },
  {
    name: 'Home',
    href: '/category/home',
    icon: '🏠',
    subcategories: [
      { name: 'Furniture', href: '/category/home/furniture', icon: '🛋️' },
      { name: 'Decor', href: '/category/home/decor', icon: '🖼️' },
      { name: 'Kitchen', href: '/category/home/kitchen', icon: '🍳' },
    ],
  },
  {
    name: 'Beauty',
    href: '/category/beauty',
    icon: '💄',
    subcategories: [
      { name: 'Makeup', href: '/category/beauty/makeup', icon: '💄' },
      {
        name: 'Skincare',
        href: '/category/beauty/skincare',
        icon: '🧴',
        popular: true,
      },
      { name: 'Fragrance', href: '/category/beauty/fragrance', icon: '🌸' },
    ],
  },
];
