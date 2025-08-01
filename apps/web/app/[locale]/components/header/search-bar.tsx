'use client';

import { UnifiedSearch } from '@repo/search/client';
import { forwardRef, memo } from 'react';
import { useI18n } from '../providers/i18n-provider';

interface SearchBarProps {
  showCategories: boolean;
  onToggleCategories: () => void;
}

export const SearchBar = memo(
  forwardRef<HTMLDivElement, SearchBarProps>(
    ({ showCategories, onToggleCategories }, ref) => {
      const { dictionary } = useI18n();

      return (
        <div ref={ref}>
          <UnifiedSearch
            categoriesExpanded={showCategories}
            onCategoriesToggle={onToggleCategories}
            placeholder={
              dictionary.web.global.navigation?.searchPlaceholder ||
              'Search for items, brands, or members'
            }
            showCategoriesButton={true}
          />
        </div>
      );
    }
  )
);

SearchBar.displayName = 'SearchBar';
