// Core types and interfaces
export * from './types';

// Search engines
export * from './algolia-search';
export { UnifiedSearchService } from './unified-search';

// History and saved searches
export { 
  SearchHistoryService, 
  SavedSearchService,
  type SearchHistoryItem,
  type SavedSearch 
} from './history';

// API route handlers
export { 
  SearchApiHandler, 
  createSearchHandler 
} from './api-routes';

// Legacy export - deprecated
export * from './search-service';

// New exports - use these
export { createSearchService, type SearchServiceClient } from './search-service-client';
export type { Product, ProductRepository } from './repositories';

// Algolia sync service
export { AlgoliaSyncService, getAlgoliaSyncService } from './sync';