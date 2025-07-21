'use client';

import {
  Badge,
  Button,
  Label,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Slider,
} from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

interface FilterOptions {
  categories?: string[];
  brands?: string[];
  sizes?: string[];
  colors?: string[];
  conditions?: ('NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR')[];
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'oldest';
}

interface IntegratedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  availableCategories?: Array<{ id: string; name: string; count?: number }>;
  availableBrands?: Array<{ name: string; count?: number }>;
  maxPrice?: number;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const CONDITIONS = [
  { value: 'NEW', label: 'New with tags' },
  { value: 'LIKE_NEW', label: 'Like new' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
] as const;

const SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '0',
  '2',
  '4',
  '6',
  '8',
  '10',
  '12',
  '14',
  '16',
  '18',
  '24',
  '26',
  '28',
  '30',
  '32',
  '34',
  '36',
  '38',
  '40',
  '42',
];

const COLORS = [
  { value: 'black', label: 'Black', className: 'bg-black' },
  { value: 'white', label: 'White', className: 'bg-white' },
  { value: 'gray', label: 'Gray', className: 'bg-gray-500' },
  { value: 'red', label: 'Red', className: 'bg-red-500' },
  { value: 'blue', label: 'Blue', className: 'bg-blue-500' },
  { value: 'green', label: 'Green', className: 'bg-green-500' },
  { value: 'yellow', label: 'Yellow', className: 'bg-yellow-500' },
  { value: 'purple', label: 'Purple', className: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', className: 'bg-pink-500' },
  { value: 'brown', label: 'Brown', className: 'bg-amber-800' },
  { value: 'navy', label: 'Navy', className: 'bg-blue-900' },
  { value: 'beige', label: 'Beige', className: 'bg-orange-100' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export function IntegratedFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  availableCategories = [],
  availableBrands = [],
  maxPrice = 1000,
  isOpen = false,
  onOpenChange,
  className,
}: IntegratedFiltersProps) {
  const [priceRange, setPriceRange] = useState([
    filters.priceRange?.min || 0,
    filters.priceRange?.max || maxPrice,
  ]);

  const hasActiveFilters = Object.values(filters).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some((v) => v !== undefined && v !== 0);
    }
    return value !== undefined && value !== 'relevance';
  });

  const activeFilterCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) {
      return count + value.length;
    }
    if (typeof value === 'object' && value !== null) {
      return (
        count +
        (Object.values(value).some((v) => v !== undefined && v !== 0) ? 1 : 0)
      );
    }
    return count + (value !== undefined && value !== 'relevance' ? 1 : 0);
  }, 0);

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      ...filters,
      priceRange: {
        min: values[0],
        max: values[1],
      },
    });
  };

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onFiltersChange({
      ...filters,
      [key]: newValues,
    });
  };

  const QuickFilters = () => (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <Select
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            sortBy: value as FilterOptions['sortBy'],
          })
        }
        value={filters.sortBy || 'relevance'}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Quick condition filters */}
      {CONDITIONS.slice(0, 2).map((condition) => (
        <Button
          className="whitespace-nowrap"
          key={condition.value}
          onClick={() => toggleArrayFilter('conditions', condition.value)}
          size="sm"
          variant={
            filters.conditions?.includes(condition.value)
              ? 'default'
              : 'outline'
          }
        >
          {condition.label}
        </Button>
      ))}
    </div>
  );

  const FilterContent = () => (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {/* Price Range */}
        <div className="space-y-4">
          <Label className="font-medium text-base">Price Range</Label>
          <div className="px-2">
            <Slider
              className="w-full"
              max={maxPrice}
              min={0}
              onValueChange={handlePriceChange}
              step={5}
              value={priceRange}
            />
            <div className="mt-2 flex justify-between text-muted-foreground text-sm">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Conditions */}
        <div className="space-y-3">
          <Label className="font-medium text-base">Condition</Label>
          <div className="grid grid-cols-2 gap-2">
            {CONDITIONS.map((condition) => (
              <Button
                className="justify-start"
                key={condition.value}
                onClick={() => toggleArrayFilter('conditions', condition.value)}
                size="sm"
                variant={
                  filters.conditions?.includes(condition.value)
                    ? 'default'
                    : 'outline'
                }
              >
                {condition.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Categories */}
        {availableCategories.length > 0 && (
          <>
            <div className="space-y-3">
              <Label className="font-medium text-base">Categories</Label>
              <div className="space-y-2">
                {availableCategories.map((category) => (
                  <div
                    className="flex items-center justify-between"
                    key={category.id}
                  >
                    <Button
                      className="flex-1 justify-start"
                      onClick={() =>
                        toggleArrayFilter('categories', category.id)
                      }
                      size="sm"
                      variant={
                        filters.categories?.includes(category.id)
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {category.name}
                    </Button>
                    {category.count && (
                      <span className="ml-2 text-muted-foreground text-xs">
                        {category.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Brands */}
        {availableBrands.length > 0 && (
          <>
            <div className="space-y-3">
              <Label className="font-medium text-base">Brands</Label>
              <div className="space-y-2">
                {availableBrands.slice(0, 10).map((brand) => (
                  <div
                    className="flex items-center justify-between"
                    key={brand.name}
                  >
                    <Button
                      className="flex-1 justify-start"
                      onClick={() => toggleArrayFilter('brands', brand.name)}
                      size="sm"
                      variant={
                        filters.brands?.includes(brand.name)
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {brand.name}
                    </Button>
                    {brand.count && (
                      <span className="ml-2 text-muted-foreground text-xs">
                        {brand.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Sizes */}
        <div className="space-y-3">
          <Label className="font-medium text-base">Size</Label>
          <div className="grid grid-cols-4 gap-2">
            {SIZES.map((size) => (
              <Button
                className="aspect-square"
                key={size}
                onClick={() => toggleArrayFilter('sizes', size)}
                size="sm"
                variant={filters.sizes?.includes(size) ? 'default' : 'outline'}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Colors */}
        <div className="space-y-3">
          <Label className="font-medium text-base">Color</Label>
          <div className="grid grid-cols-4 gap-2">
            {COLORS.map((color) => (
              <Button
                className="justify-start"
                key={color.value}
                onClick={() => toggleArrayFilter('colors', color.value)}
                size="sm"
                variant={
                  filters.colors?.includes(color.value) ? 'default' : 'outline'
                }
              >
                <div
                  className={cn(
                    "mr-2 h-3 w-3 rounded-full border",
                    color.className
                  )}
                />
                {color.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Quick Filters */}
      <QuickFilters />

      {/* Filter Sheet */}
      <div className="flex items-center justify-between">
        <Sheet onOpenChange={onOpenChange} open={isOpen}>
          <SheetTrigger asChild>
            <Button className="relative" size="sm" variant="outline">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              More Filters
              {activeFilterCount > 0 && (
                <Badge
                  className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  variant="destructive"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md" side="right">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Refine your search results</SheetDescription>
            </SheetHeader>
            <FilterContent />
          </SheetContent>
        </Sheet>

        {hasActiveFilters && (
          <Button
            className="text-destructive hover:text-destructive/90"
            onClick={onClearFilters}
            size="sm"
            variant="ghost"
          >
            <X className="mr-1 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.categories?.map((category) => (
            <Badge className="px-2 py-1" key={category} variant="secondary">
              {availableCategories.find((c) => c.id === category)?.name ||
                category}
              <Button
                className="ml-1 h-3 w-3 p-0"
                onClick={() => toggleArrayFilter('categories', category)}
                size="sm"
                variant="ghost"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          {filters.conditions?.map((condition) => (
            <Badge className="px-2 py-1" key={condition} variant="secondary">
              {CONDITIONS.find((c) => c.value === condition)?.label ||
                condition}
              <Button
                className="ml-1 h-3 w-3 p-0"
                onClick={() => toggleArrayFilter('conditions', condition)}
                size="sm"
                variant="ghost"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          {filters.brands?.map((brand) => (
            <Badge className="px-2 py-1" key={brand} variant="secondary">
              {brand}
              <Button
                className="ml-1 h-3 w-3 p-0"
                onClick={() => toggleArrayFilter('brands', brand)}
                size="sm"
                variant="ghost"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          {filters.sizes?.map((size) => (
            <Badge className="px-2 py-1" key={size} variant="secondary">
              Size {size}
              <Button
                className="ml-1 h-3 w-3 p-0"
                onClick={() => toggleArrayFilter('sizes', size)}
                size="sm"
                variant="ghost"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          {filters.colors?.map((color) => (
            <Badge className="px-2 py-1" key={color} variant="secondary">
              {COLORS.find((c) => c.value === color)?.label || color}
              <Button
                className="ml-1 h-3 w-3 p-0"
                onClick={() => toggleArrayFilter('colors', color)}
                size="sm"
                variant="ghost"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
