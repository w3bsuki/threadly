'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { Crown, Tag, Package, Sparkles, Users, Baby, User } from 'lucide-react';

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
    color: 'pink'
  },
  { 
    id: 'men', 
    label: 'Men', 
    icon: User,
    type: 'gender',
    value: 'men',
    color: 'blue'
  },
  { 
    id: 'kids', 
    label: 'Kids', 
    icon: Baby,
    type: 'gender',
    value: 'kids',
    color: 'green'
  },
  { 
    id: 'new', 
    label: 'New with tags', 
    icon: Tag,
    type: 'condition',
    value: 'NEW_WITH_TAGS',
    color: 'emerald'
  },
  { 
    id: 'designer', 
    label: 'Designer', 
    icon: Crown,
    type: 'category',
    value: 'designer',
    color: 'amber'
  },
  { 
    id: 'under50', 
    label: 'Under $50', 
    icon: Sparkles,
    type: 'price',
    value: { maxPrice: '50', minPrice: '0' },
    color: 'purple'
  },
];

export function QuickFilters({ currentFilters }: QuickFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isFilterActive = (filter: typeof quickFilters[0]) => {
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

  const toggleFilter = (filter: typeof quickFilters[0]) => {
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
    <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => {
          const Icon = filter.icon;
          const active = isFilterActive(filter);
          
          return (
            <Button
              key={filter.id}
              variant={active ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleFilter(filter)}
              className={cn(
                'h-9 px-3 transition-all',
                active ? 'bg-gray-900 text-white hover:bg-gray-800' : 'hover:border-gray-400',
                !active && filter.color === 'pink' && 'hover:border-pink-300 hover:text-pink-700 hover:bg-pink-50',
                !active && filter.color === 'blue' && 'hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50',
                !active && filter.color === 'green' && 'hover:border-green-300 hover:text-green-700 hover:bg-green-50',
                !active && filter.color === 'emerald' && 'hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50',
                !active && filter.color === 'amber' && 'hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50',
                !active && filter.color === 'purple' && 'hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50'
              )}
            >
              <Icon className="h-4 w-4 mr-1.5" />
              {filter.label}
              {active && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 bg-white/20 text-white">
                  ✓
                </Badge>
              )}
            </Button>
          );
        })}
    </div>
  );
}