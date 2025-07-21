# @repo/search - Unified Search Package

A comprehensive search solution for the Threadly marketplace that provides consistent search functionality across all applications.

## Features

### 🔍 **Unified Search Engine**
- **Algolia-first** with database fallback
- **Consistent API** across web, app, and API services
- **Advanced filtering** (categories, brands, price ranges, etc.)
- **Intelligent caching** with Redis integration
- **Performance optimized** with request deduplication

### 📚 **Search History & Saved Searches**
- **Local storage** for anonymous users
- **Database persistence** for authenticated users  
- **Search alerts** for saved searches
- **Cross-device sync** for user accounts

### 🎨 **Ready-to-Use Components**
- **UnifiedSearchBar** - Smart search with autocomplete
- **SearchHistory** - Recent searches management
- **SavedSearches** - Saved searches with alerts
- **Advanced filters** - Category, brand, price filtering

### 🚀 **Easy Integration**
- **Drop-in API routes** for Next.js applications
- **React hooks** for client-side search
- **TypeScript support** with comprehensive types
- **Next.js 15 ready** with async params support

## Installation

```bash
# Already included in the monorepo
# Individual apps can use:
import { ... } from '@repo/search'
import { ... } from '@repo/search/client'
```

## Quick Start

### 1. API Routes Setup

Copy the example API routes to your app:

```typescript
// app/api/search/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSearchHandler } from '@repo/search';

const searchHandler = createSearchHandler({
  useAlgolia: true,
  useDatabaseFallback: true,
  cacheResults: true,
  trackHistory: true,
});

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  return searchHandler.search(request, userId || undefined);
}
```

### 2. Client Components

```tsx
import { useSearch, UnifiedSearchBar } from '@repo/search/client';

function SearchPage() {
  const { search, results, isLoading } = useSearch();
  
  return (
    <div>
      <UnifiedSearchBar 
        onSearch={search}
        placeholder="Search products..."
        showSuggestions={true}
      />
      
      {isLoading && <div>Searching...</div>}
      
      <div className="grid grid-cols-3 gap-4">
        {results.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### 3. Search History & Saved Searches

```tsx
import { SearchHistory, SavedSearches } from '@repo/search/client';

function SearchSidebar() {
  const { executeSearch } = useSearch();
  
  return (
    <div className="space-y-6">
      <SavedSearches onSearchSelect={executeSearch} />
      <SearchHistory onSearchSelect={(query) => search({ query })} />
    </div>
  );
}
```

## API Reference

### Core Services

#### `UnifiedSearchService`
The main search engine that handles both Algolia and database search.

```typescript
const searchService = new UnifiedSearchService({
  useAlgolia: true,
  useDatabaseFallback: true,
  cacheResults: true,
  trackHistory: true,
  userId: 'user-123'
});

const results = await searchService.search({
  query: 'vintage jacket',
  categories: ['clothing'],
  priceRange: { min: 50, max: 200 }
});
```

#### `SearchHistoryService`
Manages search history with local storage and database persistence.

```typescript
// Add to local history
SearchHistoryService.addToLocalHistory('vintage jacket', filters, 42);

// Save to database (for authenticated users)
await SearchHistoryService.saveToDatabase(userId, 'vintage jacket', filters, 42);

// Get user's history
const history = await SearchHistoryService.getDatabaseHistory(userId);
```

#### `SavedSearchService`
Handles saved searches with alert functionality.

```typescript
// Save a search
const saved = await SavedSearchService.saveSearch(
  userId,
  'Vintage Jackets',
  'vintage jacket',
  filters,
  true // alerts enabled
);

// Toggle alerts
await SavedSearchService.toggleAlerts(savedId, userId, false);
```

### React Hooks

#### `useSearch`
The main hook for search functionality.

```typescript
const {
  // State
  results,
  suggestions,
  history,
  savedSearches,
  isLoading,
  error,
  totalHits,
  hasNextPage,
  
  // Actions
  search,
  loadMore,
  getSuggestions,
  saveSearch,
  executeSearch,
  clearHistory
} = useSearch({
  autoSearch: false,
  debounceMs: 300,
  trackHistory: true
});
```

### API Route Handlers

#### `createSearchHandler`
Creates standardized API route handlers.

```typescript
const handlers = createSearchHandler({
  useAlgolia: true,
  useDatabaseFallback: true,
  cacheResults: true,
  trackHistory: true
});

// Use in your API routes
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  return handlers.search(request, userId);
}
```

## Components

### `UnifiedSearchBar`
Smart search bar with autocomplete and suggestions.

```tsx
<UnifiedSearchBar
  onSearch={(filters) => search(filters)}
  placeholder="Search products..."
  showSuggestions={true}
  className="w-full"
/>
```

### `SearchHistory`
Displays and manages recent searches.

```tsx
<SearchHistory
  onSearchSelect={(query) => search({ query })}
  className="p-4"
/>
```

### `SavedSearches`
Manages saved searches with editing and alerts.

```tsx
<SavedSearches
  onSearchSelect={executeSearch}
  className="space-y-3"
/>
```

### `SaveSearchForm`
Form for saving current search with alerts option.

```tsx
<SaveSearchForm
  filters={currentFilters}
  onSave={(name, alerts) => saveSearch(name, currentFilters, alerts)}
  onCancel={() => setShowSaveForm(false)}
/>
```

## Configuration

### Environment Variables

```env
# Algolia (optional - will fallback to database)
ALGOLIA_APP_ID=your_app_id
ALGOLIA_ADMIN_API_KEY=your_admin_key
ALGOLIA_SEARCH_ONLY_API_KEY=your_search_key
ALGOLIA_INDEX_NAME=threadly_products

# Redis for caching (optional)
REDIS_URL=redis://localhost:6379
```

### Search Configuration

```typescript
const config = {
  useAlgolia: true,           // Use Algolia for search
  useDatabaseFallback: true,  // Fallback to database if Algolia fails
  cacheResults: true,         // Cache results in Redis
  cacheTTL: 300,             // Cache for 5 minutes
  trackHistory: true,         // Track search history
  userId: 'user-123'         // User context for personalization
};
```

## Advanced Usage

### Custom Search Filters

```typescript
const filters: SearchFilters = {
  query: 'vintage jacket',
  categories: ['clothing', 'outerwear'],
  brands: ['Levi\'s', 'Nike'],
  conditions: ['excellent', 'good'],
  sizes: ['M', 'L'],
  colors: ['blue', 'black'],
  priceRange: { min: 50, max: 200 },
  sellerRating: 4.5,
  sortBy: 'price_asc',
  availableForTrade: true
};
```

### Analytics Integration

```typescript
// Track search clicks
await searchService.trackClick(productId, query, position);

// Track conversions  
await searchService.trackConversion(productId, query);

// Get analytics
const analytics = await searchService.getAnalytics(startDate, endDate);
```

### Batch Operations

```typescript
// Load multiple saved searches
const searches = await SavedSearchService.getSavedSearches(userId);

// Execute multiple searches
const results = await Promise.all(
  searches.map(saved => searchService.search(saved.filters))
);
```

## Database Schema

The search package expects these tables to exist:

```sql
-- Search History
CREATE TABLE "SearchHistory" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "query" TEXT NOT NULL,
  "filters" JSONB,
  "resultsCount" INTEGER DEFAULT 0,
  "timestamp" TIMESTAMP DEFAULT NOW()
);

-- Saved Searches  
CREATE TABLE "SavedSearch" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "query" TEXT NOT NULL,
  "filters" JSONB,
  "alertsEnabled" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

## Best Practices

### 1. **Performance**
- Use caching for frequently searched queries
- Implement request deduplication
- Lazy load search history and saved searches

### 2. **User Experience**  
- Debounce search input (300ms recommended)
- Show loading states during search
- Provide fallback when search fails

### 3. **SEO & Analytics**
- Track search terms for trending analysis
- Monitor search performance and conversion rates
- Implement search result click tracking

### 4. **Error Handling**
- Always provide database fallback
- Handle network failures gracefully  
- Show user-friendly error messages

## Migration Guide

### From Individual Search Implementations

1. **Replace API routes** with unified handlers
2. **Update client hooks** to use `useSearch`
3. **Replace search components** with unified versions
4. **Add search history** and saved searches features
5. **Configure caching** and analytics

### Breaking Changes

- Search result format is now standardized
- API response structure has changed
- Component prop names may be different

## Troubleshooting

### Common Issues

**Search not working:**
- Check Algolia configuration
- Verify database fallback is enabled
- Check network connectivity

**Suggestions not appearing:**
- Ensure debounce timing is appropriate
- Check API route configuration
- Verify Algolia index has data

**History not persisting:**
- Check user authentication
- Verify database schema
- Check local storage permissions

## Contributing

When adding new features:
1. Update types in `src/types.ts`
2. Add tests for new functionality  
3. Update documentation
4. Ensure backward compatibility

## License

Part of the Threadly monorepo - private use only.