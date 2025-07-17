'use client';

import { Badge } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Sheet, SheetContent, SheetTrigger } from '@repo/design-system/components';
import { X, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { ExpandableCategoryButton } from './expandable-category-button';

interface QuickFiltersBarProps {
  totalCount?: number;
  categories?: string[];
}

export const QuickFiltersBar = ({ 
  totalCount,
  categories = ['Women', 'Men', 'Kids', 'Vintage', 'Designer']
}: QuickFiltersBarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAllFilters, setShowAllFilters] = useState(false);
  
  const currentSort = searchParams.get('sort') || 'newest';
  const currentGender = searchParams.get('gender');
  const currentCondition = searchParams.get('condition');
  const currentBrand = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const updateFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset pagination
    router.push(`/products?${params.toString()}`);
  }, [searchParams, router]);

  const clearFilter = useCallback((key: string) => {
    updateFilter(key, null);
  }, [updateFilter]);

  const activeFiltersCount = [currentGender, currentCondition, currentBrand, minPrice, maxPrice, currentSort !== 'newest'].filter(Boolean).length;

  const clearAllFilters = useCallback(() => {
    router.push('/products');
    setShowAllFilters(false);
  }, [router]);

  return (
    <div className="sticky top-[104px] md:top-16 z-30 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-start gap-2 py-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {/* Category Pills with Expandable Subcategories */}
          {categories.map((category) => (
            <ExpandableCategoryButton
              key={category}
              categoryName={category}
              isActive={currentGender === category.toLowerCase()}
              onClick={() => {
                const value = category.toLowerCase();
                updateFilter('gender', currentGender === value ? null : value);
              }}
            />
          ))}
          
          <div className="w-px h-8 bg-gray-200 mx-2 flex-shrink-0" />
          
          {/* Sort Options */}
          <select
            value={currentSort}
            onChange={(e) => updateFilter('sort', e.target.value === 'newest' ? null : e.target.value)}
            className="flex-shrink-0 px-8 py-4 rounded-full text-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all appearance-none pr-12 cursor-pointer touch-manipulation min-h-[56px] whitespace-nowrap snap-start"
            style={{
              backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23666\' d=\'M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z\'/%3E%3C/svg%3E")',
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="popular">Popular</option>
          </select>
          
          {/* All Filters Button */}
          <Sheet open={showAllFilters} onOpenChange={setShowAllFilters}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0 h-14 px-8 rounded-full relative touch-manipulation text-lg font-bold whitespace-nowrap snap-start"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1.5 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">All Filters</h2>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-sm"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                
                <div className="space-y-6">
                  {/* Condition Filter */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Condition</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'NEW_WITH_TAGS', label: 'New with tags' },
                        { value: 'LIKE_NEW', label: 'Like new' },
                        { value: 'GOOD', label: 'Good' },
                        { value: 'FAIR', label: 'Fair' }
                      ].map(condition => (
                        <Button
                          key={condition.value}
                          variant={currentCondition === condition.value ? 'default' : 'outline'}
                          size="sm"
                          className="justify-start"
                          onClick={() => updateFilter('condition', currentCondition === condition.value ? null : condition.value)}
                        >
                          {condition.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Price Range</h3>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice || ''}
                        onChange={(e) => updateFilter('minPrice', e.target.value || null)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice || ''}
                        onChange={(e) => updateFilter('maxPrice', e.target.value || null)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button
                    className="w-full bg-black text-white hover:bg-gray-800"
                    onClick={() => setShowAllFilters(false)}
                  >
                    View Results
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Clear filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex-shrink-0 p-4 text-gray-500 hover:text-gray-700 active:text-gray-800 touch-manipulation snap-start"
            >
              <X className="h-5 w-5 sm:h-4 sm:w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};