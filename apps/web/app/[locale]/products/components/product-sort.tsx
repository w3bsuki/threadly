"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components';
import { ArrowUpDown, TrendingUp, DollarSign, Clock } from 'lucide-react';

interface ProductSortProps {
  currentSort?: string;
}

const sortOptions = [
  { 
    value: "newest", 
    label: "Newest first",
    shortLabel: "Newest",
    icon: Clock
  },
  { 
    value: "price-asc", 
    label: "Price: Low to High",
    shortLabel: "Price ↑",
    icon: DollarSign
  },
  { 
    value: "price-desc", 
    label: "Price: High to Low",
    shortLabel: "Price ↓",
    icon: DollarSign
  },
  { 
    value: "popular", 
    label: "Most Popular",
    shortLabel: "Popular",
    icon: TrendingUp
  },
];

export function ProductSort({ currentSort = "newest" }: ProductSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    
    // Reset to page 1 when sort changes
    params.delete("page");
    
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
  };

  const currentOption = sortOptions.find(option => option.value === currentSort) || sortOptions[0];
  const CurrentIcon = currentOption.icon;

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-full sm:w-[180px] lg:w-[200px] h-10 sm:h-9 text-sm bg-white border-gray-200 hover:border-gray-300 transition-colors">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-500" />
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
              key={option.value} 
              value={option.value}
              className="flex items-center gap-2 py-2.5 cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <Icon className="h-4 w-4 text-gray-500" />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}