'use client';

import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Slider,
} from '@repo/design-system/components';
import type { Dictionary } from '@repo/internationalization';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';
import type { SearchFilters } from '@/lib/hooks/use-search';

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  facets?: Record<string, Record<string, number>>;
  dictionary: Dictionary;
}

const getConditions = (dictionary: Dictionary) => [
  { value: 'NEW', label: dictionary.dashboard.search.filters.conditions.new },
  {
    value: 'LIKE_NEW',
    label: dictionary.dashboard.search.filters.conditions.likeNew,
  },
  { value: 'GOOD', label: dictionary.dashboard.search.filters.conditions.good },
  { value: 'FAIR', label: dictionary.dashboard.search.filters.conditions.fair },
];

const SIZES = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
  { value: '0', label: '0' },
  { value: '2', label: '2' },
  { value: '4', label: '4' },
  { value: '6', label: '6' },
  { value: '8', label: '8' },
  { value: '10', label: '10' },
  { value: '12', label: '12' },
  { value: '14', label: '14' },
];

const getColors = (dictionary: Dictionary) => [
  {
    value: 'black',
    label: dictionary.dashboard.search.filters.colors.black,
    hex: '#000000',
  },
  {
    value: 'white',
    label: dictionary.dashboard.search.filters.colors.white,
    hex: '#FFFFFF',
  },
  {
    value: 'gray',
    label: dictionary.dashboard.search.filters.colors.gray,
    hex: '#6B7280',
  },
  {
    value: 'red',
    label: dictionary.dashboard.search.filters.colors.red,
    hex: '#EF4444',
  },
  {
    value: 'blue',
    label: dictionary.dashboard.search.filters.colors.blue,
    hex: '#3B82F6',
  },
  {
    value: 'green',
    label: dictionary.dashboard.search.filters.colors.green,
    hex: '#10B981',
  },
  {
    value: 'yellow',
    label: dictionary.dashboard.search.filters.colors.yellow,
    hex: '#F59E0B',
  },
  {
    value: 'purple',
    label: dictionary.dashboard.search.filters.colors.purple,
    hex: '#8B5CF6',
  },
  {
    value: 'pink',
    label: dictionary.dashboard.search.filters.colors.pink,
    hex: '#EC4899',
  },
  {
    value: 'brown',
    label: dictionary.dashboard.search.filters.colors.brown,
    hex: '#92400E',
  },
  {
    value: 'navy',
    label: dictionary.dashboard.search.filters.colors.navy,
    hex: '#1E3A8A',
  },
  {
    value: 'beige',
    label: dictionary.dashboard.search.filters.colors.beige,
    hex: '#D2B48C',
  },
];

const getSortOptions = (dictionary: Dictionary) => [
  {
    value: 'relevance',
    label: dictionary.dashboard.search.filters.mostRelevant,
  },
  {
    value: 'price_asc',
    label: dictionary.dashboard.search.filters.priceLowToHigh,
  },
  {
    value: 'price_desc',
    label: dictionary.dashboard.search.filters.priceHighToLow,
  },
  { value: 'newest', label: dictionary.dashboard.search.filters.newest },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_favorited', label: 'Most Favorited' },
];

export function SearchFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  facets,
  dictionary,
}: SearchFiltersProps) {
  const CONDITIONS = getConditions(dictionary);
  const COLORS = getColors(dictionary);
  const SORT_OPTIONS = getSortOptions(dictionary);
  const [priceRange, setPriceRange] = useState([
    filters.priceMin || 0,
    filters.priceMax || 1000,
  ]);

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      key !== 'query' && key !== 'sortBy' && filters[key as keyof SearchFilters]
  );

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      priceMin: values[0],
      priceMax: values[1],
    });
  };

  const toggleCondition = (condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR') => {
    const currentConditions = filters.conditions || [];
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter((c) => c !== condition)
      : [...currentConditions, condition];

    onFiltersChange({ conditions: newConditions });
  };

  const toggleBrand = (brand: string) => {
    const currentBrands = filters.brands || [];
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter((b) => b !== brand)
      : [...currentBrands, brand];

    onFiltersChange({ brands: newBrands });
  };

  const toggleCategory = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    onFiltersChange({ categories: newCategories });
  };

  const toggleSize = (size: string) => {
    const currentSizes = filters.sizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];

    onFiltersChange({ sizes: newSizes });
  };

  const toggleColor = (color: string) => {
    const currentColors = filters.colors || [];
    const newColors = currentColors.includes(color)
      ? currentColors.filter((c) => c !== color)
      : [...currentColors, color];

    onFiltersChange({ colors: newColors });
  };

  // Get popular brands and categories from facets
  const popularBrands = facets?.brand
    ? Object.entries(facets.brand).slice(0, 10)
    : [];
  const popularCategories = facets?.categoryName
    ? Object.entries(facets.categoryName).slice(0, 8)
    : [];

  return (
    <div className="space-y-4">
      {/* Quick filters and sort */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Select
          onValueChange={(value) =>
            onFiltersChange({
              sortBy: value as
                | 'relevance'
                | 'price_asc'
                | 'price_desc'
                | 'newest'
                | 'most_viewed'
                | 'most_favorited',
            })
          }
          value={filters.sortBy || 'relevance'}
        >
          <SelectTrigger className="w-48">
            <SelectValue
              placeholder={dictionary.dashboard.search.filters.sortBy}
            />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced filters sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm" variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {dictionary.web.global.filters.filters}
              {hasActiveFilters && (
                <Badge
                  className="ml-2 h-5 w-5 rounded-[var(--radius-full)] p-0 text-xs"
                  variant="destructive"
                >
                  !
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{dictionary.web.global.filters.filters}</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="font-medium">
                  {dictionary.dashboard.search.filters.priceRange}
                </h4>
                <div className="px-2">
                  <Slider
                    className="w-full"
                    max={1000}
                    min={0}
                    onValueChange={handlePriceChange}
                    step={10}
                    value={priceRange}
                  />
                  <div className="mt-1 flex justify-between text-muted-foreground text-sm">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-3">
                <h4 className="font-medium">
                  {dictionary.dashboard.search.filters.condition}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((condition) => (
                    <Badge
                      className="cursor-pointer"
                      key={condition.value}
                      onClick={() =>
                        toggleCondition(
                          condition.value as
                            | 'NEW'
                            | 'LIKE_NEW'
                            | 'GOOD'
                            | 'FAIR'
                        )
                      }
                      variant={
                        filters.conditions?.includes(
                          condition.value as
                            | 'NEW'
                            | 'LIKE_NEW'
                            | 'GOOD'
                            | 'FAIR'
                        )
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {condition.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Categories (from facets) */}
              {popularCategories.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">
                    {dictionary.dashboard.search.filters.categories}
                  </h4>
                  <div className="space-y-2">
                    {popularCategories.map(([category, count]) => (
                      <div
                        className="flex items-center justify-between"
                        key={category}
                      >
                        <Badge
                          className="flex-1 cursor-pointer justify-start"
                          onClick={() => toggleCategory(category)}
                          variant={
                            filters.categories?.includes(category)
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {category}
                        </Badge>
                        <span className="ml-2 text-muted-foreground text-xs">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands (from facets) */}
              {popularBrands.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">
                    {dictionary.dashboard.search.filters.brands}
                  </h4>
                  <div className="space-y-2">
                    {popularBrands.map(([brand, count]) => (
                      <div
                        className="flex items-center justify-between"
                        key={brand}
                      >
                        <Badge
                          className="flex-1 cursor-pointer justify-start"
                          onClick={() => toggleBrand(brand)}
                          variant={
                            filters.brands?.includes(brand)
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {brand}
                        </Badge>
                        <span className="ml-2 text-muted-foreground text-xs">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="space-y-3">
                <h4 className="font-medium">
                  {dictionary.dashboard.search.filters.sizes}
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {SIZES.map((size) => (
                    <Badge
                      className="cursor-pointer justify-center py-2"
                      key={size.value}
                      onClick={() => toggleSize(size.value)}
                      variant={
                        filters.sizes?.includes(size.value)
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {size.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-3">
                <h4 className="font-medium">Color</h4>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map((color) => (
                    <div
                      className={`cursor-pointer rounded-[var(--radius-lg)] border-2 p-2 transition-all ${
                        filters.colors?.includes(color.value)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      key={color.value}
                      onClick={() => toggleColor(color.value)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-[var(--radius-full)] border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="font-medium text-xs">
                          {color.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button
                  className="w-full"
                  onClick={onClearFilters}
                  variant="outline"
                >
                  {dictionary.dashboard.search.filters.clearAllFilters}
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.conditions?.map((condition) => (
            <Badge className="gap-1" key={condition} variant="secondary">
              {condition}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleCondition(condition)}
              />
            </Badge>
          ))}
          {filters.brands?.map((brand) => (
            <Badge className="gap-1" key={brand} variant="secondary">
              {brand}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleBrand(brand)}
              />
            </Badge>
          ))}
          {filters.categories?.map((category) => (
            <Badge className="gap-1" key={category} variant="secondary">
              {category}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleCategory(category)}
              />
            </Badge>
          ))}
          {filters.sizes?.map((size) => (
            <Badge className="gap-1" key={size} variant="secondary">
              {dictionary.web.global.filters.size} {size}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleSize(size)}
              />
            </Badge>
          ))}
          {filters.colors?.map((color) => (
            <Badge className="gap-1" key={color} variant="secondary">
              <div className="flex items-center gap-1">
                <div
                  className="h-3 w-3 rounded-[var(--radius-full)] border"
                  style={{
                    backgroundColor: COLORS.find((c) => c.value === color)?.hex,
                  }}
                />
                {color}
              </div>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleColor(color)}
              />
            </Badge>
          ))}
          {(filters.priceMin || filters.priceMax) && (
            <Badge className="gap-1" variant="secondary">
              ${filters.priceMin || 0} - ${filters.priceMax || 1000}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  onFiltersChange({ priceMin: undefined, priceMax: undefined })
                }
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
