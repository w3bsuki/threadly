'use client';

import { Button } from '@repo/design-system/components';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { InstantSearch } from '../../../../components/instant-search';
import { SortDropdown } from './sort-dropdown';

interface SearchHeaderProps {
  totalCount: number;
  onFiltersToggle?: () => void;
  showFiltersButton?: boolean;
  searchQuery?: string;
}

export function SearchHeader({
  totalCount,
  onFiltersToggle,
  showFiltersButton = true,
  searchQuery,
}: SearchHeaderProps) {
  return (
    <div className="border-b bg-background px-4 py-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <InstantSearch 
              placeholder="Search products, brands, categories..."
              className="w-full"
            />
          </div>
          
          {showFiltersButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFiltersToggle}
              className="flex items-center gap-2 lg:hidden"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          )}
          
          <div className="hidden lg:block">
            <SortDropdown />
          </div>
        </div>
        
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {totalCount.toLocaleString()} {totalCount === 1 ? 'product' : 'products'}
            {searchQuery && ` for "${searchQuery}"`}
          </span>
          <span className="text-xs">
            Updated just now
          </span>
        </div>
      </div>
    </div>
  );
}