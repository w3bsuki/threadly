// Core types and interfaces

// Search engines
export * from './algolia-search';
// API route handlers
export {
  createSearchHandler,
  SearchApiHandler,
} from './api-routes';
// History and saved searches
export {
  type SavedSearch,
  SavedSearchService,
  type SearchHistoryItem,
  SearchHistoryService,
} from './history';
export type { Product, ProductRepository } from './repositories';
// Legacy export - deprecated
export * from './search-service';
// New exports - use these
export {
  createSearchService,
  type SearchServiceClient,
} from './search-service-client';
// Search webhook client
export {
  getSearchWebhookClient,
  SearchWebhookClient,
  searchIndexing,
} from './search-webhook-client';
// Algolia sync service
export { AlgoliaSyncService, getAlgoliaSyncService } from './sync';
export * from './types';
export { UnifiedSearchService } from './unified-search';

// UI Components - moved to client export to avoid server-side import issues
// Use @repo/search/client for client components
