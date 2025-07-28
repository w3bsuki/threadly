export type {
  MobileSearchProps,
  UnifiedSearchProps,
} from '../components/unified-search';
// UI Components for client-side use
export { MobileSearch, UnifiedSearch } from '../components/unified-search';
export * from './hooks';
export * from './search-box';
export * from './search-filters';
export * from './search-provider';
export * from './search-results';
export {
  SavedSearches,
  type SavedSearchesProps,
  SaveSearchForm,
  type SaveSearchFormProps,
  SearchHistory,
  type SearchHistoryProps,
  UnifiedSearchBar,
  type UnifiedSearchBarProps,
} from './unified-search-components';
// New unified search functionality
export {
  type UseSearchOptions,
  type UseSearchReturn,
  useSearch,
} from './unified-search-hook';
