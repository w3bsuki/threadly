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
}

const conditions = [
  { value: "NEW_WITH_TAGS", label: "New with tags" },
  { value: "NEW_WITHOUT_TAGS", label: "New without tags" },
  { value: "VERY_GOOD", label: "Very good" },
  { value: "GOOD", label: "Good" },
  { value: "SATISFACTORY", label: "Satisfactory" },
];

export function ProductFilters({ categories, currentFilters }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs"
        >
          Clear all
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["category", "price", "condition"]}>
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id}>
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={currentFilters.category === category.id}
                      onCheckedChange={(checked) => {
                        updateFilters({
                          category: checked ? category.id : undefined,
                        });
                      }}
                    />
                    <span className="text-sm">{category.name}</span>
                  </Label>
                  {category.children && category.children.length > 0 && (
                    <div className="ml-6 mt-2 space-y-2">
                      {category.children.map((child) => (
                        <Label key={child.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={currentFilters.category === child.id}
                            onCheckedChange={(checked) => {
                              updateFilters({
                                category: checked ? child.id : undefined,
                              });
                            }}
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
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={1000}
                step={10}
                className="w-full"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="h-8"
                />
                <span className="text-sm">-</span>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="h-8"
                />
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  updateFilters({
                    minPrice: priceRange[0] > 0 ? priceRange[0].toString() : undefined,
                    maxPrice: priceRange[1] < 1000 ? priceRange[1].toString() : undefined,
                  });
                }}
              >
                Apply Price Filter
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="condition">
          <AccordionTrigger>Condition</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {conditions.map((condition) => (
                <Label key={condition.value} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={currentFilters.condition === condition.value}
                    onCheckedChange={(checked) => {
                      updateFilters({
                        condition: checked ? condition.value : undefined,
                      });
                    }}
                  />
                  <span className="text-sm">{condition.label}</span>
                </Label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}