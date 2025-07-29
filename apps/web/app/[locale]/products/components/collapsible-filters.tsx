'use client';

import { Button } from '@repo/ui/components';
import { cn } from '@repo/ui/lib/utils';
import type { Dictionary } from '@repo/internationalization';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useState } from 'react';
import { ProductFilters } from './product-filters';

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

export function CollapsibleFilters({
  categories,
  currentFilters,
  dictionary,
}: CollapsibleFiltersProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        'relative transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-12' : 'w-72'
      )}
    >
      {/* Collapse/Expand Button */}
      <Button
        className={cn(
          'absolute top-0 z-10 h-10 w-10 border border-border bg-background shadow-sm hover:bg-muted',
          isCollapsed ? 'right-1' : '-right-5'
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
        size="icon"
        variant="ghost"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="flex flex-col items-center space-y-3 py-4">
          <div className="rounded-[var(--radius-lg)] bg-secondary p-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="writing-mode-vertical font-medium text-muted-foreground text-xs">
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
