'use client';

import { ChevronDown, Grid } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface CategoryNavProps {
  category: 'men' | 'women' | 'kids' | 'unisex';
  title: string;
  description: string;
}

const subcategories = {
  men: {
    clothing: [
      {
        name: 'T-shirts & Tops',
        href: '/products?gender=men&category=t-shirts',
      },
      { name: 'Shirts', href: '/products?gender=men&category=shirts' },
      {
        name: 'Hoodies & Sweatshirts',
        href: '/products?gender=men&category=hoodies',
      },
      { name: 'Jeans', href: '/products?gender=men&category=jeans' },
      { name: 'Trousers', href: '/products?gender=men&category=trousers' },
      {
        name: 'Jackets & Coats',
        href: '/products?gender=men&category=jackets',
      },
      { name: 'Shorts', href: '/products?gender=men&category=shorts' },
      { name: 'Suits', href: '/products?gender=men&category=suits' },
    ],
    shoes: [
      { name: 'Sneakers', href: '/products?gender=men&category=sneakers' },
      { name: 'Boots', href: '/products?gender=men&category=boots' },
      {
        name: 'Formal Shoes',
        href: '/products?gender=men&category=formal-shoes',
      },
      { name: 'Sandals', href: '/products?gender=men&category=sandals' },
      { name: 'Trainers', href: '/products?gender=men&category=trainers' },
    ],
    accessories: [
      { name: 'Bags', href: '/products?gender=men&category=bags' },
      { name: 'Watches', href: '/products?gender=men&category=watches' },
      { name: 'Belts', href: '/products?gender=men&category=belts' },
      { name: 'Wallets', href: '/products?gender=men&category=wallets' },
      { name: 'Sunglasses', href: '/products?gender=men&category=sunglasses' },
      { name: 'Jewelry', href: '/products?gender=men&category=jewelry' },
    ],
  },
  women: {
    clothing: [
      { name: 'Dresses', href: '/products?gender=women&category=dresses' },
      { name: 'Tops & T-shirts', href: '/products?gender=women&category=tops' },
      { name: 'Jeans', href: '/products?gender=women&category=jeans' },
      { name: 'Skirts', href: '/products?gender=women&category=skirts' },
      {
        name: 'Jackets & Coats',
        href: '/products?gender=women&category=jackets',
      },
      { name: 'Knitwear', href: '/products?gender=women&category=knitwear' },
      { name: 'Trousers', href: '/products?gender=women&category=trousers' },
      {
        name: 'Lingerie & Sleepwear',
        href: '/products?gender=women&category=lingerie',
      },
    ],
    shoes: [
      { name: 'Heels', href: '/products?gender=women&category=heels' },
      { name: 'Boots', href: '/products?gender=women&category=boots' },
      { name: 'Sneakers', href: '/products?gender=women&category=sneakers' },
      { name: 'Flats', href: '/products?gender=women&category=flats' },
      { name: 'Sandals', href: '/products?gender=women&category=sandals' },
    ],
    accessories: [
      { name: 'Bags & Purses', href: '/products?gender=women&category=bags' },
      { name: 'Jewelry', href: '/products?gender=women&category=jewelry' },
      { name: 'Scarves', href: '/products?gender=women&category=scarves' },
      { name: 'Belts', href: '/products?gender=women&category=belts' },
      {
        name: 'Sunglasses',
        href: '/products?gender=women&category=sunglasses',
      },
      { name: 'Watches', href: '/products?gender=women&category=watches' },
    ],
  },
  kids: {
    clothing: [
      {
        name: 'T-shirts & Tops',
        href: '/products?gender=kids&category=t-shirts',
      },
      { name: 'Dresses', href: '/products?gender=kids&category=dresses' },
      { name: 'Jeans', href: '/products?gender=kids&category=jeans' },
      {
        name: 'Jackets & Coats',
        href: '/products?gender=kids&category=jackets',
      },
      { name: 'Shorts', href: '/products?gender=kids&category=shorts' },
      { name: 'Sleepwear', href: '/products?gender=kids&category=sleepwear' },
    ],
    shoes: [
      { name: 'Sneakers', href: '/products?gender=kids&category=sneakers' },
      { name: 'Boots', href: '/products?gender=kids&category=boots' },
      { name: 'Sandals', href: '/products?gender=kids&category=sandals' },
      {
        name: 'School Shoes',
        href: '/products?gender=kids&category=school-shoes',
      },
    ],
    accessories: [
      { name: 'Bags', href: '/products?gender=kids&category=bags' },
      { name: 'Toys', href: '/products?gender=kids&category=toys' },
      {
        name: 'Hair Accessories',
        href: '/products?gender=kids&category=hair-accessories',
      },
    ],
  },
  unisex: {
    clothing: [
      {
        name: 'T-shirts & Tops',
        href: '/products?gender=unisex&category=t-shirts',
      },
      {
        name: 'Hoodies & Sweatshirts',
        href: '/products?gender=unisex&category=hoodies',
      },
      { name: 'Jeans', href: '/products?gender=unisex&category=jeans' },
      { name: 'Joggers', href: '/products?gender=unisex&category=joggers' },
      {
        name: 'Jackets & Coats',
        href: '/products?gender=unisex&category=jackets',
      },
      {
        name: 'Oversized Items',
        href: '/products?gender=unisex&category=oversized',
      },
    ],
    shoes: [
      { name: 'Sneakers', href: '/products?gender=unisex&category=sneakers' },
      { name: 'Boots', href: '/products?gender=unisex&category=boots' },
      { name: 'Sandals', href: '/products?gender=unisex&category=sandals' },
      { name: 'Slip-ons', href: '/products?gender=unisex&category=slip-ons' },
    ],
    accessories: [
      { name: 'Bags', href: '/products?gender=unisex&category=bags' },
      { name: 'Watches', href: '/products?gender=unisex&category=watches' },
      {
        name: 'Sunglasses',
        href: '/products?gender=unisex&category=sunglasses',
      },
      { name: 'Hats & Caps', href: '/products?gender=unisex&category=hats' },
      { name: 'Jewelry', href: '/products?gender=unisex&category=jewelry' },
    ],
  },
};

export const CategoryNav = ({
  category,
  title,
  description,
}: CategoryNavProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const categoryData = subcategories[category];

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center space-x-2 text-muted-foreground text-sm">
          <Link className="hover:text-foreground" href="/">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground capitalize">{category}</span>
        </div>

        <h1 className="mb-2 font-bold text-3xl text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Navigation Dropdowns */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center space-x-8 pb-4">
          {/* Clothing Dropdown */}
          <div className="relative">
            <button
              className="flex items-center space-x-1 py-2 font-medium text-foreground text-sm hover:text-secondary-foreground"
              onClick={() =>
                setActiveDropdown(
                  activeDropdown === 'clothing' ? null : 'clothing'
                )
              }
            >
              <span>Clothing</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {activeDropdown === 'clothing' && (
              <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-[var(--radius-lg)] border border-gray-200 bg-background shadow-lg">
                <div className="p-2">
                  {categoryData.clothing.map((item) => (
                    <Link
                      className="block rounded-[var(--radius-md)] px-3 py-2 text-secondary-foreground text-sm hover:bg-muted"
                      href={item.href}
                      key={item.name}
                      onClick={() => setActiveDropdown(null)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Shoes Dropdown */}
          <div className="relative">
            <button
              className="flex items-center space-x-1 py-2 font-medium text-foreground text-sm hover:text-secondary-foreground"
              onClick={() =>
                setActiveDropdown(activeDropdown === 'shoes' ? null : 'shoes')
              }
            >
              <span>Shoes</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {activeDropdown === 'shoes' && (
              <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-[var(--radius-lg)] border border-gray-200 bg-background shadow-lg">
                <div className="p-2">
                  {categoryData.shoes.map((item) => (
                    <Link
                      className="block rounded-[var(--radius-md)] px-3 py-2 text-secondary-foreground text-sm hover:bg-muted"
                      href={item.href}
                      key={item.name}
                      onClick={() => setActiveDropdown(null)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Accessories Dropdown */}
          <div className="relative">
            <button
              className="flex items-center space-x-1 py-2 font-medium text-foreground text-sm hover:text-secondary-foreground"
              onClick={() =>
                setActiveDropdown(
                  activeDropdown === 'accessories' ? null : 'accessories'
                )
              }
            >
              <span>Accessories</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {activeDropdown === 'accessories' && (
              <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-[var(--radius-lg)] border border-gray-200 bg-background shadow-lg">
                <div className="p-2">
                  {categoryData.accessories.map((item) => (
                    <Link
                      className="block rounded-[var(--radius-md)] px-3 py-2 text-secondary-foreground text-sm hover:bg-muted"
                      href={item.href}
                      key={item.name}
                      onClick={() => setActiveDropdown(null)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* All Categories Link */}
          <Link
            className="flex items-center space-x-1 py-2 font-medium text-foreground text-sm hover:text-secondary-foreground"
            href={`/products?gender=${category}`}
          >
            <Grid className="h-4 w-4" />
            <span>All {category}</span>
          </Link>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};
