'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { getCategoriesFlat, type CategoryOption } from '../actions/get-categories';

interface CategorySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function CategorySelector({ value, onValueChange, placeholder = "Select a category" }: CategorySelectorProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedCategories = await getCategoriesFlat();
        setCategories(fetchedCategories);
      } catch (err) {
        setError('Failed to load categories. Please refresh the page.');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading categories..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="space-y-2">
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Error loading categories" />
          </SelectTrigger>
        </Select>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Retry loading categories
        </button>
      </div>
    );
  }

  return (
    <Select onValueChange={onValueChange} value={value || ""}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}