'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { ProductFilters } from './product-filters';
import type { Dictionary } from '@repo/internationalization';

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface CollapsibleFiltersProps {
  categories: Category[];
  currentFilters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
  };
  dictionary: Dictionary;
}

export function CollapsibleFilters({ categories, currentFilters, dictionary }: CollapsibleFiltersProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      'relative transition-all duration-300 ease-in-out',
      isCollapsed ? 'w-12' : 'w-72'
    )}>
      {/* Collapse/Expand Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          'absolute top-0 z-10 h-10 w-10 border border-gray-200 bg-white shadow-sm hover:bg-gray-50',
          isCollapsed ? 'right-1' : '-right-5'
        )}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="flex flex-col items-center py-4 space-y-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Filter className="h-5 w-5 text-gray-600" />
          </div>
          <div className="writing-mode-vertical text-xs text-gray-500 font-medium">
            {dictionary.web.global.filters.filters}
          </div>
        </div>
      )}

      {/* Expanded State */}
      {!isCollapsed && (
        <div className="pr-5">
          <ProductFilters 
            categories={categories}
            currentFilters={currentFilters}
            dictionary={dictionary}
          />
        </div>
      )}
    </div>
  );
}