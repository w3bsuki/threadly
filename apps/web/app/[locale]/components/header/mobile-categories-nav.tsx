'use client';

import { Button } from '@repo/design-system/components';
import Link from 'next/link';
import { memo } from 'react';
import { CATEGORIES } from '@repo/navigation';
import { useI18n } from '../providers/i18n-provider';

interface MobileCategoriesNavProps {
  expandedCategories: string[];
  onToggleCategory: (categoryName: string) => void;
  onClose: () => void;
}

export const MobileCategoriesNav = memo(({
  expandedCategories,
  onToggleCategory,
  onClose,
}: MobileCategoriesNavProps) => {
  const { dictionary, locale } = useI18n();

  const categories = CATEGORIES.map((category) => {
    const translatedName =
      dictionary.web.global.categories?.[
        category.name.toLowerCase() as keyof typeof dictionary.web.global.categories
      ] || category.name;
    
    return {
      ...category,
      name: translatedName,
      href: `/${locale}${category.href}`,
      subcategories: category.subcategories.map((sub) => ({
        ...sub,
        href: `/${locale}${sub.href}`,
      })),
    };
  });

  return (
    <div className="p-4">
      <h3 className="mb-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
        Shop by Category
      </h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            className="overflow-hidden rounded-[var(--radius-xl)] border border-border"
            key={category.name}
          >
            <div className="flex min-h-[44px] items-center">
              <Link
                aria-label={`Browse ${category.name} category`}
                className="flex flex-1 items-center gap-3 p-4 transition-colors hover:bg-muted active:scale-95"
                href={category.href}
                onClick={onClose}
              >
                <span aria-hidden="true" className="text-2xl">
                  {category.icon}
                </span>
                <span className="font-medium text-foreground">
                  {category.name}
                </span>
              </Link>

              {category.subcategories.length > 0 && (
                <Button
                  aria-expanded={expandedCategories.includes(category.name)}
                  aria-label={`${expandedCategories.includes(category.name) ? 'Hide' : 'Show'} ${category.name} subcategories`}
                  className="m-2 h-10 min-w-[44px] px-3 font-medium text-muted-foreground text-xs hover:text-foreground"
                  onClick={() => onToggleCategory(category.name)}
                  size="sm"
                  variant="ghost"
                >
                  {expandedCategories.includes(category.name) ? 'Less' : 'More'}
                </Button>
              )}
            </div>

            {expandedCategories.includes(category.name) &&
              category.subcategories.length > 0 && (
                <div className="border-border border-t bg-muted">
                  <div className="grid grid-cols-2 gap-px bg-accent p-2">
                    {category.subcategories.map((sub) => (
                      <Link
                        aria-label={`Browse ${sub.name} in ${category.name}${(sub as any).popular ? ' - Popular' : ''}`}
                        className={`flex min-h-[44px] items-center gap-2 rounded bg-background p-3 transition-colors hover:bg-muted active:scale-95 ${
                          (sub as any).popular ? 'ring-1 ring-blue-200' : ''
                        }`}
                        href={sub.href}
                        key={sub.name}
                        onClick={onClose}
                      >
                        <span aria-hidden="true" className="text-lg">
                          {sub.icon}
                        </span>
                        <span className="font-medium text-secondary-foreground text-sm">
                          {sub.name}
                        </span>
                        {(sub as any).popular && (
                          <span
                            aria-label="Popular"
                            className="text-blue-600 text-xs"
                          >
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
  );
});

MobileCategoriesNav.displayName = 'MobileCategoriesNav';