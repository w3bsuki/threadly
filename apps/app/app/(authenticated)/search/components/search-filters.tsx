'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@repo/design-system/components';
import { Slider } from '@repo/design-system/components';
import { Filter, X } from 'lucide-react';
import { type SearchFilters } from '@/lib/hooks/use-search';

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  facets?: Record<string, Record<string, number>>;
}

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
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

const COLORS = [
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'white', label: 'White', hex: '#FFFFFF' },
  { value: 'gray', label: 'Gray', hex: '#6B7280' },
  { value: 'red', label: 'Red', hex: '#EF4444' },
  { value: 'blue', label: 'Blue', hex: '#3B82F6' },
  { value: 'green', label: 'Green', hex: '#10B981' },
  { value: 'yellow', label: 'Yellow', hex: '#F59E0B' },
  { value: 'purple', label: 'Purple', hex: '#8B5CF6' },
  { value: 'pink', label: 'Pink', hex: '#EC4899' },
  { value: 'brown', label: 'Brown', hex: '#92400E' },
  { value: 'navy', label: 'Navy', hex: '#1E3A8A' },
  { value: 'beige', label: 'Beige', hex: '#D2B48C' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_favorited', label: 'Most Favorited' },
];

export function SearchFilters({ filters, onFiltersChange, onClearFilters, facets }: SearchFiltersProps) {
  const [priceRange, setPriceRange] = useState([
    filters.priceMin || 0,
    filters.priceMax || 1000,
  ]);

  const hasActiveFilters = Object.keys(filters).some(
    key => key !== 'query' && key !== 'sortBy' && filters[key as keyof SearchFilters]
  );

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      priceMin: values[0],
      priceMax: values[1],
    });
  };

  const toggleCondition = (condition: string) => {
    const currentConditions = filters.conditions || [];
    const newConditions = currentConditions.includes(condition as any)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition as any];
    
    onFiltersChange({ conditions: newConditions });
  };

  const toggleBrand = (brand: string) => {
    const currentBrands = filters.brands || [];
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand];
    
    onFiltersChange({ brands: newBrands });
  };

  const toggleCategory = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    onFiltersChange({ categories: newCategories });
  };

  const toggleSize = (size: string) => {
    const currentSizes = filters.sizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    
    onFiltersChange({ sizes: newSizes });
  };

  const toggleColor = (color: string) => {
    const currentColors = filters.colors || [];
    const newColors = currentColors.includes(color)
      ? currentColors.filter(c => c !== color)
      : [...currentColors, color];
    
    onFiltersChange({ colors: newColors });
  };

  // Get popular brands and categories from facets
  const popularBrands = facets?.brand ? Object.entries(facets.brand).slice(0, 10) : [];
  const popularCategories = facets?.categoryName ? Object.entries(facets.categoryName).slice(0, 8) : [];

  return (
    <div className="space-y-4">
      {/* Quick filters and sort */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Select
          value={filters.sortBy || 'relevance'}
          onValueChange={(value) => onFiltersChange({ sortBy: value as any })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced filters sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  !
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="font-medium">Price Range</h4>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    max={1000}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-3">
                <h4 className="font-medium">Condition</h4>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map(condition => (
                    <Badge
                      key={condition.value}
                      variant={filters.conditions?.includes(condition.value as any) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCondition(condition.value)}
                    >
                      {condition.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Categories (from facets) */}
              {popularCategories.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Categories</h4>
                  <div className="space-y-2">
                    {popularCategories.map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <Badge
                          variant={filters.categories?.includes(category) ? "default" : "outline"}
                          className="cursor-pointer flex-1 justify-start"
                          onClick={() => toggleCategory(category)}
                        >
                          {category}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
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
                  <h4 className="font-medium">Brands</h4>
                  <div className="space-y-2">
                    {popularBrands.map(([brand, count]) => (
                      <div key={brand} className="flex items-center justify-between">
                        <Badge
                          variant={filters.brands?.includes(brand) ? "default" : "outline"}
                          className="cursor-pointer flex-1 justify-start"
                          onClick={() => toggleBrand(brand)}
                        >
                          {brand}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="space-y-3">
                <h4 className="font-medium">Sizes</h4>
                <div className="grid grid-cols-4 gap-2">
                  {SIZES.map(size => (
                    <Badge
                      key={size.value}
                      variant={filters.sizes?.includes(size.value) ? "default" : "outline"}
                      className="cursor-pointer justify-center py-2"
                      onClick={() => toggleSize(size.value)}
                    >
                      {size.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-3">
                <h4 className="font-medium">Colors</h4>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map(color => (
                    <div
                      key={color.value}
                      className={`cursor-pointer p-2 rounded-lg border-2 transition-all ${
                        filters.colors?.includes(color.value) 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleColor(color.value)}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-medium">{color.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button onClick={onClearFilters} variant="outline" className="w-full">
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.conditions?.map(condition => (
            <Badge key={condition} variant="secondary" className="gap-1">
              {condition}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleCondition(condition)}
              />
            </Badge>
          ))}
          {filters.brands?.map(brand => (
            <Badge key={brand} variant="secondary" className="gap-1">
              {brand}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleBrand(brand)}
              />
            </Badge>
          ))}
          {filters.categories?.map(category => (
            <Badge key={category} variant="secondary" className="gap-1">
              {category}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleCategory(category)}
              />
            </Badge>
          ))}
          {filters.sizes?.map(size => (
            <Badge key={size} variant="secondary" className="gap-1">
              Size {size}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleSize(size)}
              />
            </Badge>
          ))}
          {filters.colors?.map(color => (
            <Badge key={color} variant="secondary" className="gap-1">
              <div className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: COLORS.find(c => c.value === color)?.hex }}
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
            <Badge variant="secondary" className="gap-1">
              ${filters.priceMin || 0} - ${filters.priceMax || 1000}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({ priceMin: undefined, priceMax: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}