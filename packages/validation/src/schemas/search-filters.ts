import { z } from 'zod';

export const SearchFiltersSchema = z.object({
  query: z.string().optional(),
  categories: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  conditions: z.array(z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'])).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'newest', 'most_viewed', 'most_favorited']).optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  sellerId: z.string().optional(),
  excludeSold: z.boolean().optional(),
  inStock: z.boolean().optional(),
});

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

export const SearchSortOptions = z.enum([
  'relevance',
  'price_asc',
  'price_desc',
  'newest',
  'most_viewed',
  'most_favorited'
]);

export type SearchSortOption = z.infer<typeof SearchSortOptions>;