import { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '../../../app/[locale]/components/navigation/categories';
import { useI18n } from '../../../app/[locale]/components/providers/i18n-provider';

export function useHeaderState() {
  const { dictionary, locale } = useI18n();
  const [showCategories, setShowCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const categories = CATEGORIES.map((category) => ({
    ...category,
    name:
      dictionary.web.global.categories?.[
        category.name.toLowerCase() as keyof typeof dictionary.web.global.categories
      ] || category.name,
    href: `/${locale}${category.href}`,
    subcategories: category.subcategories.map((sub) => ({
      ...sub,
      href: `/${locale}${sub.href}`,
    })),
  }));

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const closeMenus = () => {
    setShowCategories(false);
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideDesktop =
        searchRef.current && !searchRef.current.contains(target);

      if (isOutsideDesktop) {
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    showCategories,
    setShowCategories,
    expandedCategories,
    isMenuOpen,
    setMenuOpen,
    searchRef,
    categories,
    toggleCategoryExpansion,
    closeMenus,
    dictionary,
    locale,
  };
}
