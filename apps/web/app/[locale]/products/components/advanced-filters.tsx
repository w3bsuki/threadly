'use client';

import { Button, Label } from '@repo/design-system/components';
import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface AdvancedFiltersProps {
  onClose?: () => void;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'NEW_WITH_TAGS', label: 'New with Tags' },
  { value: 'NEW_WITHOUT_TAGS', label: 'New without Tags' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'VERY_GOOD', label: 'Very Good' },
  { value: 'GOOD', label: 'Good' },
  { value: 'SATISFACTORY', label: 'Fair' },
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
  { value: '16', label: '16' },
];

export function AdvancedFilters({
  onClose,
  categories = [],
}: AdvancedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get('minPrice') || '0'),
    Number(searchParams.get('maxPrice') || '1000'),
  ]);

  const [selectedCondition, setSelectedCondition] = useState(
    searchParams.get('condition') || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  );
  const [selectedSize, setSelectedSize] = useState(
    searchParams.get('size') || ''
  );

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);

    if (priceRange[0] > 0) {
      params.set('minPrice', priceRange[0].toString());
    } else {
      params.delete('minPrice');
    }

    if (priceRange[1] < 1000) {
      params.set('maxPrice', priceRange[1].toString());
    } else {
      params.delete('maxPrice');
    }

    if (selectedCondition) {
      params.set('condition', selectedCondition);
    } else {
      params.delete('condition');
    }

    if (selectedCategory) {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }

    if (selectedSize) {
      params.set('size', selectedSize);
    } else {
      params.delete('size');
    }

    params.delete('page');

    router.push(`/products?${params.toString()}`);
    onClose?.();
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('condition');
    params.delete('category');
    params.delete('size');
    params.delete('page');

    router.push(`/products?${params.toString()}`);
    onClose?.();
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {onClose && (
          <Button onClick={onClose} size="sm" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label>Price Range</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              className="flex-1 rounded border border-border px-3 py-2 text-sm"
              onChange={(e) =>
                setPriceRange([Number(e.target.value), priceRange[1]])
              }
              placeholder="Min"
              type="number"
              value={priceRange[0]}
            />
            <input
              className="flex-1 rounded border border-border px-3 py-2 text-sm"
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              placeholder="Max"
              type="number"
              value={priceRange[1]}
            />
          </div>
          <div className="flex justify-between text-muted-foreground text-sm">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-3">
        <Label>Condition</Label>
        <select
          className="w-full rounded border border-border px-3 py-2 text-sm"
          onChange={(e) => setSelectedCondition(e.target.value)}
          value={selectedCondition}
        >
          <option value="">Any condition</option>
          {CONDITIONS.map((condition) => (
            <option key={condition.value} value={condition.value}>
              {condition.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <Label>Category</Label>
          <select
            className="w-full rounded border border-border px-3 py-2 text-sm"
            onChange={(e) => setSelectedCategory(e.target.value)}
            value={selectedCategory}
          >
            <option value="">Any category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Size */}
      <div className="space-y-3">
        <Label>Size</Label>
        <select
          className="w-full rounded border border-border px-3 py-2 text-sm"
          onChange={(e) => setSelectedSize(e.target.value)}
          value={selectedSize}
        >
          <option value="">Any size</option>
          {SIZES.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button className="flex-1" onClick={applyFilters}>
          Apply Filters
        </Button>
        <Button onClick={clearFilters} variant="outline">
          Clear
        </Button>
      </div>
    </div>
  );
}
