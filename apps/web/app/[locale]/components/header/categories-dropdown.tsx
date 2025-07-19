'use client';

import Link from 'next/link';
import { memo, useState } from 'react';
interface CategoriesDropdownProps {
  categories: Array<{
    name: string;
    href: string;
    icon: string;
    subcategories: Array<{
      name: string;
      href: string;
      icon: string;
      popular?: boolean;
    }>;
  }>;
  onClose: () => void;
}

export const CategoriesDropdown = memo(({ categories, onClose }: CategoriesDropdownProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <div
      aria-label="Product categories"
      className="absolute top-full left-0 z-50 mt-1 w-[520px] rounded-[var(--radius-lg)] border border-gray-200 bg-background shadow-lg"
      id="categories-menu"
      role="menu"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        <div className="p-4">
          <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Categories
          </p>
          <div className="space-y-1">
            {categories.map((category) => (
              <div
                className="overflow-hidden rounded-[var(--radius-lg)] border border-gray-100"
                key={category.name}
              >
                <div className="flex items-center">
                  <Link
                    className="group flex flex-1 items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-muted"
                    href={category.href}
                    onClick={onClose}
                    role="menuitem"
                  >
                    <span className="text-lg opacity-70 group-hover:opacity-100">
                      {category.icon}
                    </span>
                    <span className="font-medium text-secondary-foreground text-sm group-hover:text-foreground">
                      {category.name}
                    </span>
                  </Link>

                  {category.subcategories.length > 0 && (
                    <button
                      aria-expanded={expandedCategories.includes(category.name)}
                      aria-label={`${expandedCategories.includes(category.name) ? 'Hide' : 'Show'} ${category.name} subcategories`}
                      className="border-gray-100 border-l px-3 py-2.5 font-medium text-muted-foreground text-xs hover:bg-muted hover:text-secondary-foreground"
                      onClick={() => toggleCategoryExpansion(category.name)}
                    >
                      {expandedCategories.includes(category.name) ? 'Less' : 'More'}
                    </button>
                  )}
                </div>

                {expandedCategories.includes(category.name) &&
                  category.subcategories.length > 0 && (
                    <div className="border-gray-100 border-t bg-muted">
                      <div className="grid grid-cols-2 gap-px bg-accent p-2">
                        {category.subcategories.map((sub) => (
                          <Link
                            aria-label={`Browse ${sub.name} in ${category.name}${(sub as any).popular ? ' - Popular' : ''}`}
                            className={`flex items-center gap-2 rounded-[var(--radius-md)] bg-background px-3 py-2 transition-colors hover:bg-muted ${
                              (sub as any).popular ? 'ring-1 ring-blue-200' : ''
                            }`}
                            href={sub.href}
                            key={sub.name}
                            onClick={onClose}
                            role="menuitem"
                          >
                            <span aria-hidden="true" className="text-sm">
                              {sub.icon}
                            </span>
                            <span className="font-medium text-secondary-foreground text-sm">
                              {sub.name}
                            </span>
                            {(sub as any).popular && (
                              <span aria-label="Popular" className="text-blue-600 text-xs">
                                •
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-gray-100 border-t p-3">
        <Link
          className="flex-1 rounded-[var(--radius-lg)] bg-primary px-3 py-2 text-center font-medium text-sm text-background transition-colors hover:bg-primary/90"
          href="/products?condition=NEW_WITH_TAGS"
          onClick={onClose}
          role="menuitem"
        >
          NEW
        </Link>
        <Link
          className="flex-1 rounded-[var(--radius-lg)] bg-red-500 px-3 py-2 text-center font-medium text-sm text-background transition-colors hover:bg-red-600"
          href="/products?sale=true"
          onClick={onClose}
          role="menuitem"
        >
          SALE
        </Link>
        <Link
          className="flex-1 rounded-[var(--radius-lg)] bg-orange-500 px-3 py-2 text-center font-medium text-sm text-background transition-colors hover:bg-orange-600"
          href="/products?sort=popular"
          onClick={onClose}
          role="menuitem"
        >
          HOT
        </Link>
      </div>
    </div>
  );
});

CategoriesDropdown.displayName = 'CategoriesDropdown';