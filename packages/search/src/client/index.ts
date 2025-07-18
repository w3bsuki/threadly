export * from './search-provider';
export * from './search-box';
export * from './search-filters';
export * from './search-results';
export * from './hooks';

// New unified search functionality
export { useSearch, type UseSearchOptions, type UseSearchReturn } from './unified-search-hook';
export { 
  UnifiedSearchBar,
  SearchHistory,
  SavedSearches,
  SaveSearchForm,
  type UnifiedSearchBarProps,
  type SearchHistoryProps,
  type SavedSearchesProps,
  type SaveSearchFormProps
} from './unified-search-components';

// UI Components for client-side use
export { UnifiedSearch, MobileSearch } from '../components/unified-search';
export type { UnifiedSearchProps, MobileSearchProps } from '../components/unified-search';