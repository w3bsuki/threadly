'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@repo/design-system/components';
import { ArrowUpDown, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface ProductSortProps {
  currentSort?: string;
}

const sortOptions = [
  {
    value: 'newest',
    label: 'Newest first',
    shortLabel: 'Newest',
    icon: Clock,
  },
  {
    value: 'price-asc',
    label: 'Price: Low to High',
    shortLabel: 'Price ↑',
    icon: DollarSign,
  },
  {
    value: 'price-desc',
    label: 'Price: High to Low',
    shortLabel: 'Price ↓',
    icon: DollarSign,
  },
  {
    value: 'popular',
    label: 'Most Popular',
    shortLabel: 'Popular',
    icon: TrendingUp,
  },
];

export function ProductSort({ currentSort = 'newest' }: ProductSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }

    // Reset to page 1 when sort changes
    params.delete('page');

    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  const currentOption =
    sortOptions.find((option) => option.value === currentSort) ||
    sortOptions[0];
  const _CurrentIcon = currentOption.icon;

  return (
    <Select onValueChange={handleSortChange} value={currentSort}>
      <SelectTrigger className="h-10 w-full border-border bg-background text-sm transition-colors hover:border-border sm:h-9 sm:w-[180px] lg:w-[200px]">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <span className="hidden sm:inline">Sort by:</span>
          <span className="font-medium">
            <span className="sm:hidden">{currentOption.shortLabel}</span>
            <span className="hidden sm:inline">{currentOption.label}</span>
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="w-full min-w-[200px]">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          return (
            <SelectItem
              className="flex cursor-pointer items-center gap-2 py-2.5"
              key={option.value}
              value={option.value}
            >
              <div className="flex w-full items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
