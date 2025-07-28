/**
 * Search and filter validation schemas and types
 */

import { z } from 'zod';

// Sort options enum
export const SortOption = {
  RELEVANCE: 'relevance',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  NEWEST: 'newest',
  MOST_VIEWED: 'most_viewed',
  MOST_FAVORITED: 'most_favorited',
} as const;

export type SortOptionType = (typeof SortOption)[keyof typeof SortOption];

// Product conditions enum (matching product.ts)
export const ProductCondition = {
  NEW_WITH_TAGS: 'NEW_WITH_TAGS',
  NEW_WITHOUT_TAGS: 'NEW_WITHOUT_TAGS',
  VERY_GOOD: 'VERY_GOOD',
  GOOD: 'GOOD',
  SATISFACTORY: 'SATISFACTORY',
  LIKE_NEW: 'LIKE_NEW',
  FAIR: 'FAIR',
} as const;

export type ProductConditionType =
  (typeof ProductCondition)[keyof typeof ProductCondition];

// Search filters schema
export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  categories: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  conditions: z
    .array(
      z.enum([
        'NEW_WITH_TAGS',
        'NEW_WITHOUT_TAGS',
        'VERY_GOOD',
        'GOOD',
        'SATISFACTORY',
        'LIKE_NEW',
        'FAIR',
      ])
    )
    .optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  sortBy: z
    .enum([
      'relevance',
      'price_asc',
      'price_desc',
      'newest',
      'most_viewed',
      'most_favorited',
    ])
    .optional(),
});

// TypeScript interface derived from schema
export type SearchFilters = z.infer<typeof searchFiltersSchema>;

// Filter state for UI components
export interface FilterState {
  category: string;
  brand: string;
  size: string;
  priceRange: [number, number];
  condition: string;
  searchQuery: string;
}

// Filter options provided by server
export interface FilterOptions {
  categories: string[];
  brands: string[];
  sizes: string[];
  conditions: string[];
  totalCount: number;
}

// Product filter value types
export type FilterValue =
  | string
  | number
  | [number, number]
  | string[]
  | boolean;

// Filter update function type
export type FilterUpdateFunction = (
  key: keyof FilterState,
  value: FilterValue
) => void;
