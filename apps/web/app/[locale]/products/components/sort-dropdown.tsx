'use client';

import { Button } from '@repo/design-system/components';
import { ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'alphabetical', label: 'Alphabetical' },
];

export function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'newest';

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams);

    if (sortValue === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', sortValue);
    }

    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((option) => option.value === currentSort)?.label ||
    'Newest First';

  return (
    <select
      className="rounded border border-border px-3 py-2 text-sm"
      onChange={(e) => handleSortChange(e.target.value)}
      value={currentSort}
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
