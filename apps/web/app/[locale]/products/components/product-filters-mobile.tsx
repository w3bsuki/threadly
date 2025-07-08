"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Label } from '@repo/design-system/components';
import { Checkbox } from '@repo/design-system/components';
import { Slider } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/design-system/components';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface ProductFiltersMobileProps {
  categories: Category[];
  currentFilters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
  };
  dictionary: Dictionary;
}

export function ProductFiltersMobile({ categories, currentFilters, dictionary }: ProductFiltersMobileProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Map conditions from dictionary
  const conditions = [
    { value: "NEW_WITH_TAGS", label: dictionary.product.conditions.newWithTags },
    { value: "NEW_WITHOUT_TAGS", label: dictionary.product.conditions.newWithoutTags },
    { value: "VERY_GOOD", label: dictionary.product.conditions.veryGood },
    { value: "GOOD", label: dictionary.product.conditions.good },
    { value: "SATISFACTORY", label: dictionary.product.conditions.satisfactory },
  ];
  
  const [priceRange, setPriceRange] = useState([
    parseInt(currentFilters.minPrice || "0"),
    parseInt(currentFilters.maxPrice || "1000"),
  ]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (currentFilters.category) count++;
    if (currentFilters.minPrice && currentFilters.minPrice !== "0") count++;
    if (currentFilters.maxPrice && currentFilters.maxPrice !== "1000") count++;
    if (currentFilters.condition) count++;
    return count;
  }, [currentFilters]);

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
    setPriceRange([0, 1000]);
    setIsOpen(false);
  };

  const applyPriceFilter = () => {
    updateFilters({
      minPrice: priceRange[0] > 0 ? priceRange[0].toString() : undefined,
      maxPrice: priceRange[1] < 1000 ? priceRange[1].toString() : undefined,
    });
  };

  // Get current category name for display
  const getCurrentCategoryName = () => {
    if (!currentFilters.category) return null;
    
    const findCategory = (cats: Category[]): string | null => {
      for (const cat of cats) {
        if (cat.id === currentFilters.category) return cat.name;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findCategory(categories);
  };

  const getCurrentConditionName = () => {
    if (!currentFilters.condition) return null;
    const condition = conditions.find(c => c.value === currentFilters.condition);
    return condition?.label || null;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="mobile"
          className="relative min-h-[44px] min-w-[44px] touch-manipulation"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{dictionary.search.filters}</span>
          <span className="sm:hidden">{dictionary.search.filters}</span>
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="bottom" 
        className="h-[85vh] overflow-y-auto px-0"
      >
        <div className="px-4 py-6">
          <SheetHeader className="pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>{dictionary.search.filters}</SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">{dictionary.search.filters}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs h-6 px-2"
                >
                  {dictionary.search.filters.clearAllFilters}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {getCurrentCategoryName() && (
                  <Badge variant="secondary" className="text-xs">
                    {getCurrentCategoryName()}
                  </Badge>
                )}
                {getCurrentConditionName() && (
                  <Badge variant="secondary" className="text-xs">
                    {getCurrentConditionName()}
                  </Badge>
                )}
                {(currentFilters.minPrice || currentFilters.maxPrice) && (
                  <Badge variant="secondary" className="text-xs">
                    ${currentFilters.minPrice || 0} - ${currentFilters.maxPrice || 1000}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Separator className="mb-6" />

          {/* Filter Options */}
          <Accordion type="multiple" defaultValue={["category", "price", "condition"]}>
            <AccordionItem value="category">
              <AccordionTrigger className="text-base py-4">
                {dictionary.search.filters.categories}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pb-4">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <Label className="flex items-center gap-3 cursor-pointer py-2 px-2 -mx-2 rounded-md hover:bg-gray-50 min-h-[44px]">
                        <Checkbox
                          checked={currentFilters.category === category.id}
                          onCheckedChange={(checked) => {
                            updateFilters({
                              category: checked ? category.id : undefined,
                            });
                          }}
                          className="h-5 w-5"
                        />
                        <span className="text-sm font-medium">{category.name}</span>
                      </Label>
                      {category.children && category.children.length > 0 && (
                        <div className="ml-8 mt-2 space-y-2">
                          {category.children.map((child) => (
                            <Label key={child.id} className="flex items-center gap-3 cursor-pointer py-2 px-2 -mx-2 rounded-md hover:bg-gray-50 min-h-[44px]">
                              <Checkbox
                                checked={currentFilters.category === child.id}
                                onCheckedChange={(checked) => {
                                  updateFilters({
                                    category: checked ? child.id : undefined,
                                  });
                                }}
                                className="h-5 w-5"
                              />
                              <span className="text-sm">{child.name}</span>
                            </Label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="price">
              <AccordionTrigger className="text-base py-4">
                {dictionary.search.filters.priceRange}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pb-4">
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-600 mb-1 block">{dictionary.search.filters.min}</Label>
                      <Input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="h-11 text-base"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-600 mb-1 block">{dictionary.search.filters.max}</Label>
                      <Input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                        className="h-11 text-base"
                        placeholder="1000"
                      />
                    </div>
                  </div>
                  <Button
                    size="mobile"
                    variant="brand-primary"
                    className="w-full"
                    onClick={applyPriceFilter}
                  >
                    {dictionary.search.filters.applyFilters}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="condition">
              <AccordionTrigger className="text-base py-4">
                {dictionary.search.filters.condition}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-4">
                  {conditions.map((condition) => (
                    <Label key={condition.value} className="flex items-center gap-3 cursor-pointer py-2 px-2 -mx-2 rounded-md hover:bg-gray-50 min-h-[44px]">
                      <Checkbox
                        checked={currentFilters.condition === condition.value}
                        onCheckedChange={(checked) => {
                          updateFilters({
                            condition: checked ? condition.value : undefined,
                          });
                        }}
                        className="h-5 w-5"
                      />
                      <span className="text-sm">{condition.label}</span>
                    </Label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Apply/Close Actions */}
          <div className="mt-8 pt-6 border-t space-y-3">
            <Button
              size="mobile-lg"
              variant="brand-primary"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              {dictionary.search.filters.applyFilters}
            </Button>
            <Button
              size="mobile"
              variant="outline"
              className="w-full"
              onClick={clearFilters}
            >
              {dictionary.search.filters.clearAllFilters}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}