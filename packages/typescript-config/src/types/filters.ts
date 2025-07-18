export interface PriceRange {
  min: number
  max: number
}

export interface FilterOptions {
  categories?: string[]
  brands?: string[]
  sizes?: string[]
  colors?: string[]
  conditions?: string[]
  priceRange?: PriceRange
  sortBy?: SortOption
  searchQuery?: string
}

export type SortOption = 
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "oldest"

export interface AppliedFilters extends FilterOptions {
  page?: number
  limit?: number
}

export interface FilterCount {
  categories: Record<string, number>
  brands: Record<string, number>
  sizes: Record<string, number>
  colors: Record<string, number>
  conditions: Record<string, number>
  priceRange: {
    min: number
    max: number
  }
}