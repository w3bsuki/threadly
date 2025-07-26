'use client';

import { Button } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { memo, useCallback, useRef } from 'react';
import { CATEGORIES } from '../navigation/categories';
import { useI18n } from '../providers/i18n-provider';

interface MobileCategoriesNavProps {
  expandedCategories: string[];
  onToggleCategory: (categoryName: string) => void;
  onClose: () => void;
  horizontal?: boolean;
}

export const MobileCategoriesNav = memo(({
  expandedCategories,
  onToggleCategory,
  onClose,
  horizontal = false,
}: MobileCategoriesNavProps) => {
  const { dictionary, locale } = useI18n();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

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

  // Horizontal scrollable chips view
  if (horizontal) {
    return (
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className={cn(
            "flex gap-2 overflow-x-auto scrollbar-hide",
            "scroll-smooth snap-x snap-mandatory",
            "-mx-4 px-4"
          )}
        >
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              onClick={() => {
                triggerHapticFeedback();
                onClose();
              }}
              className={cn(
                "flex-shrink-0 snap-start",
                "inline-flex items-center gap-2",
                "h-11 px-4 rounded-full",
                "bg-muted hover:bg-secondary transition-colors",
                "active:scale-95 transition-transform"
              )}
            >
              <span aria-hidden="true" className="text-lg">
                {category.icon}
              </span>
              <span className="font-medium text-sm whitespace-nowrap">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Vertical expandable view
  return (
    <div className="p-4">
      <h3 className="mb-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
        Shop by Category
      </h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <motion.div
            key={category.name}
            className="overflow-hidden rounded-[var(--radius-xl)] border border-border"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex min-h-[56px] items-center">
              <Link
                aria-label={`Browse ${category.name} category`}
                className="flex flex-1 items-center gap-3 p-4 transition-colors hover:bg-muted active:scale-95"
                href={category.href}
                onClick={() => {
                  triggerHapticFeedback();
                  onClose();
                }}
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
                  className="m-2 h-11 min-w-[44px] px-3 font-medium text-muted-foreground text-xs hover:text-foreground"
                  onClick={() => {
                    triggerHapticFeedback();
                    onToggleCategory(category.name);
                  }}
                  size="sm"
                  variant="ghost"
                >
                  {expandedCategories.includes(category.name) ? 'Less' : 'More'}
                </Button>
              )}
            </div>

            {expandedCategories.includes(category.name) &&
              category.subcategories.length > 0 && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-border border-t bg-muted"
                >
                  <div className="grid grid-cols-2 gap-px bg-accent p-2">
                    {category.subcategories.map((sub) => (
                      <Link
                        aria-label={`Browse ${sub.name} in ${category.name}${sub.popular ? ' - Popular' : ''}`}
                        className={cn(
                          "flex min-h-[44px] items-center gap-2 rounded bg-background p-3",
                          "transition-colors hover:bg-muted active:scale-95",
                          sub.popular && 'ring-1 ring-blue-200'
                        )}
                        href={sub.href}
                        key={sub.name}
                        onClick={() => {
                          triggerHapticFeedback();
                          onClose();
                        }}
                      >
                        <span aria-hidden="true" className="text-lg">
                          {sub.icon}
                        </span>
                        <span className="font-medium text-secondary-foreground text-sm">
                          {sub.name}
                        </span>
                        {sub.popular && (
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
                </motion.div>
              )}
          </motion.div>
        ))}
      </div>
    </div>
  );
});

MobileCategoriesNav.displayName = 'MobileCategoriesNav';