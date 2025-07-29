'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Checkbox,
  Input,
  Label,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Slider,
} from '@repo/ui/components';
import type { Dictionary } from '@repo/internationalization';
import { SlidersHorizontal, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

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

export function ProductFiltersMobile({
  categories,
  currentFilters,
  dictionary,
}: ProductFiltersMobileProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (currentFilters.category) {
      count++;
    }
    if (currentFilters.minPrice && currentFilters.minPrice !== '0') {
      count++;
    }
    if (currentFilters.maxPrice && currentFilters.maxPrice !== '1000') {
      count++;
    }
    if (currentFilters.condition) {
      count++;
    }
    return count;
  }, [currentFilters]);

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
    if (!currentFilters.category) {
      return null;
    }

    const findCategory = (cats: Category[]): string | null => {
      for (const cat of cats) {
        if (cat.id === currentFilters.category) {
          return cat.name;
        }
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    return findCategory(categories);
  };

  const getCurrentConditionName = () => {
    if (!currentFilters.condition) {
      return null;
    }
    const condition = conditions.find(
      (c) => c.value === currentFilters.condition
    );
    return condition?.label || null;
  };

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <Button
          className="relative min-h-[44px] min-w-[44px] touch-manipulation"
          size="mobile"
          variant="outline"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">
            {dictionary.web.global.filters.filters}
          </span>
          <span className="sm:hidden">
            {dictionary.web.global.filters.filters}
          </span>
          {activeFiltersCount > 0 && (
            <Badge
              className="-top-2 -right-2 absolute flex h-5 w-5 items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="h-[85vh] overflow-y-auto px-0" side="bottom">
        <div className="px-4 py-6">
          <SheetHeader className="pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>{dictionary.web.global.filters.filters}</SheetTitle>
              <Button
                className="h-8 w-8 p-0"
                onClick={() => setIsOpen(false)}
                size="sm"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="mb-6 rounded-[var(--radius-lg)] bg-muted p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium text-sm">
                  {dictionary.web.global.filters.filters}
                </span>
                <Button
                  className="h-6 px-2 text-xs"
                  onClick={clearFilters}
                  size="sm"
                  variant="ghost"
                >
                  {dictionary.web.global.filters.clearAll}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {getCurrentCategoryName() && (
                  <Badge className="text-xs" variant="secondary">
                    {getCurrentCategoryName()}
                  </Badge>
                )}
                {getCurrentConditionName() && (
                  <Badge className="text-xs" variant="secondary">
                    {getCurrentConditionName()}
                  </Badge>
                )}
                {(currentFilters.minPrice || currentFilters.maxPrice) && (
                  <Badge className="text-xs" variant="secondary">
                    ${currentFilters.minPrice || 0} - $
                    {currentFilters.maxPrice || 1000}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Separator className="mb-6" />

          {/* Filter Options */}
          <Accordion
            defaultValue={['category', 'price', 'condition']}
            type="multiple"
          >
            <AccordionItem value="category">
              <AccordionTrigger className="py-4 text-base">
                {dictionary.web.global.filters.categories}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pb-4">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <Label className="-mx-2 flex min-h-[44px] cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 hover:bg-muted">
                        <Checkbox
                          checked={currentFilters.category === category.id}
                          className="h-5 w-5"
                          onCheckedChange={(checked) => {
                            updateFilters({
                              category: checked ? category.id : undefined,
                            });
                          }}
                        />
                        <span className="font-medium text-sm">
                          {category.name}
                        </span>
                      </Label>
                      {category.children && category.children.length > 0 && (
                        <div className="mt-2 ml-8 space-y-2">
                          {category.children.map((child) => (
                            <Label
                              className="-mx-2 flex min-h-[44px] cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 hover:bg-muted"
                              key={child.id}
                            >
                              <Checkbox
                                checked={currentFilters.category === child.id}
                                className="h-5 w-5"
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
              <AccordionTrigger className="py-4 text-base">
                Price Range
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pb-4">
                  <div className="px-2">
                    <Slider
                      className="w-full"
                      max={1000}
                      onValueChange={setPriceRange}
                      step={10}
                      value={priceRange}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="mb-1 block text-muted-foreground text-xs">
                        Min
                      </Label>
                      <Input
                        className="h-11 text-base"
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
                    <div className="flex-1">
                      <Label className="mb-1 block text-muted-foreground text-xs">
                        Max
                      </Label>
                      <Input
                        className="h-11 text-base"
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
                    className="w-full"
                    onClick={applyPriceFilter}
                    size="mobile"
                    variant="brand-primary"
                  >
                    {dictionary.web.global.filters.applyFilters}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="condition">
              <AccordionTrigger className="py-4 text-base">
                {dictionary.web.global.filters.condition}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-4">
                  {conditions.map((condition) => (
                    <Label
                      className="-mx-2 flex min-h-[44px] cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 hover:bg-muted"
                      key={condition.value}
                    >
                      <Checkbox
                        checked={currentFilters.condition === condition.value}
                        className="h-5 w-5"
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

          {/* Apply/Close Actions */}
          <div className="mt-8 space-y-3 border-t pt-6">
            <Button
              className="w-full"
              onClick={() => setIsOpen(false)}
              size="mobile-lg"
              variant="brand-primary"
            >
              {dictionary.web.global.filters.applyFilters}
            </Button>
            <Button
              className="w-full"
              onClick={clearFilters}
              size="mobile"
              variant="outline"
            >
              {dictionary.web.global.filters.clearAll}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
