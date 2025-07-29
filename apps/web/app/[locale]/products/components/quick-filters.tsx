'use client';

import { Badge, Button } from '@repo/ui/components';
import { cn } from '@repo/ui/lib/utils';
import { Baby, Crown, Sparkles, Tag, User, Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface QuickFiltersProps {
  currentFilters: {
    category?: string;
    gender?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

const quickFilters = [
  {
    id: 'women',
    label: 'Women',
    icon: Users,
    type: 'gender',
    value: 'women',
    color: 'pink',
  },
  {
    id: 'men',
    label: 'Men',
    icon: User,
    type: 'gender',
    value: 'men',
    color: 'blue',
  },
  {
    id: 'kids',
    label: 'Kids',
    icon: Baby,
    type: 'gender',
    value: 'kids',
    color: 'green',
  },
  {
    id: 'new',
    label: 'New with tags',
    icon: Tag,
    type: 'condition',
    value: 'NEW_WITH_TAGS',
    color: 'emerald',
  },
  {
    id: 'designer',
    label: 'Designer',
    icon: Crown,
    type: 'category',
    value: 'designer',
    color: 'amber',
  },
  {
    id: 'under50',
    label: 'Under $50',
    icon: Sparkles,
    type: 'price',
    value: { maxPrice: '50', minPrice: '0' },
    color: 'purple',
  },
];

export function QuickFilters({ currentFilters }: QuickFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isFilterActive = (filter: (typeof quickFilters)[0]) => {
    if (filter.type === 'gender') {
      return currentFilters.gender === filter.value;
    }
    if (filter.type === 'condition') {
      return currentFilters.condition === filter.value;
    }
    if (filter.type === 'category') {
      return currentFilters.category === filter.value;
    }
    if (filter.type === 'price' && typeof filter.value === 'object') {
      return currentFilters.maxPrice === filter.value.maxPrice;
    }
    return false;
  };

  const toggleFilter = (filter: (typeof quickFilters)[0]) => {
    const params = new URLSearchParams();

    // Copy existing filters except the one being toggled
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const isActive = isFilterActive(filter);

    if (filter.type === 'gender') {
      if (isActive) {
        params.delete('gender');
      } else {
        params.set('gender', filter.value as string);
      }
    } else if (filter.type === 'condition') {
      if (isActive) {
        params.delete('condition');
      } else {
        params.set('condition', filter.value as string);
      }
    } else if (filter.type === 'category') {
      if (isActive) {
        params.delete('category');
      } else {
        params.set('category', filter.value as string);
      }
    } else if (filter.type === 'price' && typeof filter.value === 'object') {
      if (isActive) {
        params.delete('maxPrice');
        params.delete('minPrice');
      } else {
        if ('maxPrice' in filter.value && filter.value.maxPrice) {
          params.set('maxPrice', filter.value.maxPrice);
        }
        if ('minPrice' in filter.value && filter.value.minPrice) {
          params.set('minPrice', filter.value.minPrice);
        }
      }
    }

    // Reset to page 1 when filters change
    params.delete('page');

    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto">
      {quickFilters.map((filter) => {
        const Icon = filter.icon;
        const active = isFilterActive(filter);

        return (
          <Button
            className={cn(
              'h-12 flex-shrink-0 touch-manipulation snap-start whitespace-nowrap px-6 py-3 font-semibold text-base transition-all',
              active
                ? 'bg-foreground text-background hover:bg-secondary-foreground'
                : 'hover:border-gray-400',
              !active &&
                filter.color === 'pink' &&
                'hover:border-pink-300 hover:bg-pink-50 hover:text-pink-700',
              !active &&
                filter.color === 'blue' &&
                'hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700',
              !active &&
                filter.color === 'green' &&
                'hover:border-green-300 hover:bg-green-50 hover:text-green-700',
              !active &&
                filter.color === 'emerald' &&
                'hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700',
              !active &&
                filter.color === 'amber' &&
                'hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700',
              !active &&
                filter.color === 'purple' &&
                'hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700'
            )}
            key={filter.id}
            onClick={() => toggleFilter(filter)}
            size="sm"
            variant={active ? 'default' : 'outline'}
          >
            <Icon className="mr-2 h-5 w-5" />
            {filter.label}
            {active && (
              <Badge
                className="ml-2 h-5 bg-background/20 px-1.5 text-background"
                variant="secondary"
              >
                ✓
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
