'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Checkbox,
  Input,
  Label,
  Slider,
} from '@repo/ui/components';
import type { Dictionary } from '@repo/content/internationalization';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

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

export function ProductFilters({
  categories,
  currentFilters,
  dictionary,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Map conditions from dictionary
  const conditions = [
    {
      value: 'NEW_WITH_TAGS',
      label: dictionary.web.global.filters.newWithTags,
    },
    {
      value: 'NEW_WITHOUT_TAGS',
      label: dictionary.web.global.filters.newWithTags,
    }, // Using newWithTags as fallback
    { value: 'VERY_GOOD', label: dictionary.web.global.filters.veryGood },
    { value: 'GOOD', label: dictionary.web.global.filters.good },
    { value: 'SATISFACTORY', label: dictionary.web.global.filters.fair }, // Using fair as fallback
  ];

  const [priceRange, setPriceRange] = useState([
    Number.parseInt(currentFilters.minPrice || '0', 10),
    Number.parseInt(currentFilters.maxPrice || '1000', 10),
  ]);

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();

    // Preserve existing filters
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && !Object.hasOwn(updates, key)) {
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
    params.delete('page');

    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  // Count active filters
  const activeFiltersCount =
    Object.values(currentFilters).filter(Boolean).length;

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900 text-lg">
            {dictionary.web.global.filters.filters}
          </h2>
          {activeFiltersCount > 0 && (
            <span className="mt-1 text-gray-500 text-sm">
              {activeFiltersCount} active filter
              {activeFiltersCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            className="text-red-600 text-xs hover:bg-red-50 hover:text-red-700"
            onClick={clearFilters}
            size="sm"
            variant="ghost"
          >
            {dictionary.web.global.filters.clearAll}
          </Button>
        )}
      </div>

      <Accordion className="w-full" defaultValue={[]} type="multiple">
        <AccordionItem className="border-gray-100 border-b" value="category">
          <AccordionTrigger className="py-4 font-medium text-gray-900 text-sm hover:no-underline">
            {dictionary.web.global.filters.categories}
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <Accordion
              className="w-full space-y-2"
              defaultValue={[]}
              type="multiple"
            >
              {categories.map((category) => (
                <div key={category.id}>
                  {category.children && category.children.length > 0 ? (
                    <AccordionItem className="border-0" value={category.id}>
                      <AccordionTrigger className="-mx-2 rounded-md px-2 py-2 hover:bg-gray-50 hover:no-underline">
                        <div className="flex w-full items-center gap-3">
                          <Checkbox
                            checked={currentFilters.category === category.id}
                            className="h-4 w-4"
                            onCheckedChange={(checked) => {
                              updateFilters({
                                category: checked ? category.id : undefined,
                              });
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="font-medium text-gray-700 text-sm">
                            {category.name}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pl-7">
                        <div className="space-y-2">
                          {category.children.map((child) => (
                            <Label
                              className="-mx-2 flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-50"
                              key={child.id}
                            >
                              <Checkbox
                                checked={currentFilters.category === child.id}
                                className="h-4 w-4"
                                onCheckedChange={(checked) => {
                                  updateFilters({
                                    category: checked ? child.id : undefined,
                                  });
                                }}
                              />
                              <span className="text-gray-600 text-sm">
                                {child.name}
                              </span>
                            </Label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <Label className="-mx-2 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-gray-50">
                      <Checkbox
                        checked={currentFilters.category === category.id}
                        className="h-4 w-4"
                        onCheckedChange={(checked) => {
                          updateFilters({
                            category: checked ? category.id : undefined,
                          });
                        }}
                      />
                      <span className="font-medium text-gray-700 text-sm">
                        {category.name}
                      </span>
                    </Label>
                  )}
                </div>
              ))}
            </Accordion>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem className="border-gray-100 border-b" value="price">
          <AccordionTrigger className="py-4 font-medium text-gray-900 text-sm hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-5">
              <div className="px-2">
                <Slider
                  className="w-full"
                  max={1000}
                  onValueChange={setPriceRange}
                  step={10}
                  value={priceRange}
                />
                <div className="mt-2 flex justify-between text-gray-500 text-xs">
                  <span>$0</span>
                  <span>$1000+</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 block text-gray-600 text-xs">
                    Min Price
                  </Label>
                  <Input
                    className="h-9 text-sm"
                    onChange={(e) =>
                      setPriceRange([
                        Number.parseInt(e.target.value, 10) || 0,
                        priceRange[1],
                      ])
                    }
                    placeholder="0"
                    type="number"
                    value={priceRange[0]}
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-gray-600 text-xs">
                    Max Price
                  </Label>
                  <Input
                    className="h-9 text-sm"
                    onChange={(e) =>
                      setPriceRange([
                        priceRange[0],
                        Number.parseInt(e.target.value, 10) || 1000,
                      ])
                    }
                    placeholder="1000"
                    type="number"
                    value={priceRange[1]}
                  />
                </div>
              </div>
              <Button
                className="h-9 w-full"
                onClick={() => {
                  updateFilters({
                    minPrice:
                      priceRange[0] > 0 ? priceRange[0].toString() : undefined,
                    maxPrice:
                      priceRange[1] < 1000
                        ? priceRange[1].toString()
                        : undefined,
                  });
                }}
                size="sm"
                variant="brand-primary"
              >
                {dictionary.web.global.filters.applyFilters}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem className="border-b-0" value="condition">
          <AccordionTrigger className="py-4 font-medium text-gray-900 text-sm hover:no-underline">
            {dictionary.web.global.filters.condition}
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3">
              {conditions.map((condition) => (
                <Label
                  className="-mx-2 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-gray-50"
                  key={condition.value}
                >
                  <Checkbox
                    checked={currentFilters.condition === condition.value}
                    className="h-4 w-4"
                    onCheckedChange={(checked) => {
                      updateFilters({
                        condition: checked ? condition.value : undefined,
                      });
                    }}
                  />
                  <span className="text-gray-700 text-sm">
                    {condition.label}
                  </span>
                </Label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Quick Actions */}
      {activeFiltersCount > 0 && (
        <div className="border-gray-100 border-t pt-4">
          <Button
            className="w-full border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
            onClick={clearFilters}
            size="sm"
            variant="outline"
          >
            {dictionary.web.global.filters.clearAll}
          </Button>
        </div>
      )}
    </div>
  );
}
