"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Label } from '@repo/design-system/components';
import { Checkbox } from '@repo/design-system/components';
import { Slider } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/design-system/components';
import type { Dictionary } from '@repo/internationalization';

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface ProductFiltersProps {
  categories: Category[];
  currentFilters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
  };
  dictionary: Dictionary;
}

export function ProductFilters({ categories, currentFilters, dictionary }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Map conditions from dictionary
  const conditions = [
    { value: "NEW_WITH_TAGS", label: dictionary.web.global.filters.newWithTags },
    { value: "NEW_WITHOUT_TAGS", label: dictionary.web.global.filters.newWithTags }, // Using newWithTags as fallback
    { value: "VERY_GOOD", label: dictionary.web.global.filters.veryGood },
    { value: "GOOD", label: dictionary.web.global.filters.good },
    { value: "SATISFACTORY", label: dictionary.web.global.filters.fair }, // Using fair as fallback
  ];
  
  const [priceRange, setPriceRange] = useState([
    parseInt(currentFilters.minPrice || "0"),
    parseInt(currentFilters.maxPrice || "1000"),
  ]);

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    
    // Preserve existing filters
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && !updates.hasOwnProperty(key)) {
        params.set(key, value);
      }
    });
    
    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    // Reset to page 1 when filters change
    params.delete("page");
    
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  // Count active filters
  const activeFiltersCount = Object.values(currentFilters).filter(Boolean).length;
  
  return (
    <div className="space-y-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{dictionary.web.global.filters.filters}</h2>
          {activeFiltersCount > 0 && (
            <span className="text-sm text-gray-500 mt-1">
              {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {dictionary.web.global.filters.clearAll}
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={[]} className="w-full">
        <AccordionItem value="category" className="border-b border-gray-100">
          <AccordionTrigger className="py-4 hover:no-underline text-sm font-medium text-gray-900">
            {dictionary.web.global.filters.categories}
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <Accordion type="multiple" defaultValue={[]} className="w-full space-y-2">
              {categories.map((category) => (
                <div key={category.id}>
                  {category.children && category.children.length > 0 ? (
                    <AccordionItem value={category.id} className="border-0">
                      <AccordionTrigger className="py-2 px-2 -mx-2 rounded-md hover:bg-gray-50 hover:no-underline">
                        <div className="flex items-center gap-3 w-full">
                          <Checkbox
                            checked={currentFilters.category === category.id}
                            onCheckedChange={(checked) => {
                              updateFilters({
                                category: checked ? category.id : undefined,
                              });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4"
                          />
                          <span className="text-sm font-medium text-gray-700">{category.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-7 pt-2">
                        <div className="space-y-2">
                          {category.children.map((child) => (
                            <Label key={child.id} className="flex items-center gap-3 cursor-pointer py-1.5 px-2 -mx-2 rounded-md hover:bg-gray-50 transition-colors">
                              <Checkbox
                                checked={currentFilters.category === child.id}
                                onCheckedChange={(checked) => {
                                  updateFilters({
                                    category: checked ? child.id : undefined,
                                  });
                                }}
                                className="h-4 w-4"
                              />
                              <span className="text-sm text-gray-600">{child.name}</span>
                            </Label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <Label className="flex items-center gap-3 cursor-pointer py-2 px-2 -mx-2 rounded-md hover:bg-gray-50 transition-colors">
                      <Checkbox
                        checked={currentFilters.category === category.id}
                        onCheckedChange={(checked) => {
                          updateFilters({
                            category: checked ? category.id : undefined,
                          });
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    </Label>
                  )}
                </div>
              ))}
            </Accordion>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border-b border-gray-100">
          <AccordionTrigger className="py-4 hover:no-underline text-sm font-medium text-gray-900">
            Price Range
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-5">
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={1000}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>$0</span>
                  <span>$1000+</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Min Price</Label>
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="h-9 text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Max Price</Label>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                    className="h-9 text-sm"
                    placeholder="1000"
                  />
                </div>
              </div>
              <Button
                size="sm"
                variant="brand-primary"
                className="w-full h-9"
                onClick={() => {
                  updateFilters({
                    minPrice: priceRange[0] > 0 ? priceRange[0].toString() : undefined,
                    maxPrice: priceRange[1] < 1000 ? priceRange[1].toString() : undefined,
                  });
                }}
              >
                {dictionary.web.global.filters.applyFilters}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="condition" className="border-b-0">
          <AccordionTrigger className="py-4 hover:no-underline text-sm font-medium text-gray-900">
            {dictionary.web.global.filters.condition}
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3">
              {conditions.map((condition) => (
                <Label key={condition.value} className="flex items-center gap-3 cursor-pointer py-2 px-2 -mx-2 rounded-md hover:bg-gray-50 transition-colors">
                  <Checkbox
                    checked={currentFilters.condition === condition.value}
                    onCheckedChange={(checked) => {
                      updateFilters({
                        condition: checked ? condition.value : undefined,
                      });
                    }}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-gray-700">{condition.label}</span>
                </Label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {/* Quick Actions */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            {dictionary.web.global.filters.clearAll}
          </Button>
        </div>
      )}
    </div>
  );
}