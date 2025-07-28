/**
 * Unified Search API Routes
 * Standardized API utilities for search endpoints across all apps
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SavedSearchService, SearchHistoryService } from './history';
import type { SearchFilters } from './types';
import { UnifiedSearchService } from './unified-search';

// Validation schemas
const searchParamsSchema = z.object({
  q: z.string().optional(),
  categories: z.string().optional(),
  brands: z.string().optional(),
  conditions: z.string().optional(),
  sizes: z.string().optional(),
  colors: z.string().optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  sellerRating: z.string().transform(Number).optional(),
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
  page: z.string().optional().default('0').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
});

const suggestionsParamsSchema = z.object({
  q: z.string().min(1),
  limit: z.string().optional().default('5').transform(Number),
});

const saveSearchSchema = z.object({
  name: z.string().min(1).max(100),
  query: z.string().min(1),
  filters: z.record(z.string(), z.unknown()).optional(),
  alertsEnabled: z.boolean().default(false),
});

/**
 * Unified Search Route Handler
 * Use this in your app's API routes for consistent search functionality
 */
export class SearchApiHandler {
  private searchService: UnifiedSearchService;

  constructor(
    config: {
      useAlgolia?: boolean;
      useDatabaseFallback?: boolean;
      cacheResults?: boolean;
      trackHistory?: boolean;
    } = {}
  ) {
    this.searchService = new UnifiedSearchService({
      useAlgolia: config.useAlgolia ?? true,
      useDatabaseFallback: config.useDatabaseFallback ?? true,
      cacheResults: config.cacheResults ?? true,
      trackHistory: config.trackHistory ?? true,
    });
  }

  /**
   * Main search endpoint
   */
  async handleSearch(
    request: NextRequest,
    userId?: string
  ): Promise<NextResponse> {
    try {
      const url = new URL(request.url);
      const params = Object.fromEntries(url.searchParams.entries());
      const validated = searchParamsSchema.parse(params);

      // Convert string arrays to arrays
      const filters: SearchFilters = {
        query: validated.q,
        categories: validated.categories?.split(',').filter(Boolean),
        brands: validated.brands?.split(',').filter(Boolean),
        conditions: validated.conditions?.split(',').filter(Boolean),
        sizes: validated.sizes?.split(',').filter(Boolean),
        colors: validated.colors?.split(',').filter(Boolean),
        priceRange:
          validated.minPrice || validated.maxPrice
            ? {
                min: validated.minPrice ?? 0,
                max: validated.maxPrice ?? 999_999,
              }
            : undefined,
        sellerRating: validated.sellerRating,
        sortBy: validated.sortBy,
      };

      // Update search service with user context
      if (userId) {
        this.searchService = new UnifiedSearchService({
          ...this.searchService['config'],
          userId,
        });
      }

      const result = await this.searchService.search(
        filters,
        validated.page,
        validated.limit
      );

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid search parameters', details: error.issues },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: 'Search failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }

  /**
   * Search suggestions endpoint
   */
  async handleSuggestions(request: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(request.url);
      const params = Object.fromEntries(url.searchParams.entries());
      const validated = suggestionsParamsSchema.parse(params);

      const suggestions = await this.searchService.searchSuggestions(
        validated.q,
        validated.limit
      );

      return NextResponse.json({ suggestions });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid parameters', details: error.issues },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to get suggestions' },
        { status: 500 }
      );
    }
  }

  /**
   * Popular products endpoint
   */
  async handlePopular(request: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(request.url);
      const limit = Number(url.searchParams.get('limit')) || 10;

      const products = await this.searchService.getPopularProducts(limit);

      return NextResponse.json({ products });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to get popular products' },
        { status: 500 }
      );
    }
  }

  /**
   * Search history endpoint
   */
  async handleSearchHistory(
    request: NextRequest,
    userId: string
  ): Promise<NextResponse> {
    try {
      if (request.method === 'GET') {
        const url = new URL(request.url);
        const limit = Number(url.searchParams.get('limit')) || 50;

        const history = await SearchHistoryService.getDatabaseHistory(
          userId,
          limit
        );
        return NextResponse.json({ history });
      }

      if (request.method === 'DELETE') {
        const success = await SearchHistoryService.clearDatabaseHistory(userId);
        return NextResponse.json({ success });
      }

      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to handle search history' },
        { status: 500 }
      );
    }
  }

  /**
   * Saved searches endpoint
   */
  async handleSavedSearches(
    request: NextRequest,
    userId: string
  ): Promise<NextResponse> {
    try {
      if (request.method === 'GET') {
        const searches = await SavedSearchService.getSavedSearches(userId);
        return NextResponse.json({ searches });
      }

      if (request.method === 'POST') {
        const body = await request.json();
        const validated = saveSearchSchema.parse(body);

        const saved = await SavedSearchService.saveSearch(
          userId,
          validated.name,
          validated.query,
          validated.filters,
          validated.alertsEnabled
        );

        if (!saved) {
          return NextResponse.json(
            { error: 'Failed to save search' },
            { status: 500 }
          );
        }

        return NextResponse.json({ search: saved });
      }

      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid data', details: error.issues },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to handle saved searches' },
        { status: 500 }
      );
    }
  }

  /**
   * Individual saved search endpoint
   */
  async handleSavedSearch(
    request: NextRequest,
    userId: string,
    searchId: string
  ): Promise<NextResponse> {
    try {
      if (request.method === 'PUT') {
        const body = await request.json();
        const updates = saveSearchSchema.partial().parse(body);

        const updated = await SavedSearchService.updateSavedSearch(
          searchId,
          userId,
          updates
        );

        if (!updated) {
          return NextResponse.json(
            { error: 'Search not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({ search: updated });
      }

      if (request.method === 'DELETE') {
        const success = await SavedSearchService.deleteSavedSearch(
          searchId,
          userId
        );

        if (!success) {
          return NextResponse.json(
            { error: 'Search not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid data', details: error.issues },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to handle saved search' },
        { status: 500 }
      );
    }
  }

  /**
   * Toggle alerts for saved search
   */
  async handleToggleAlerts(
    request: NextRequest,
    userId: string,
    searchId: string
  ): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { enabled } = z.object({ enabled: z.boolean() }).parse(body);

      const success = await SavedSearchService.toggleAlerts(
        searchId,
        userId,
        enabled
      );

      if (!success) {
        return NextResponse.json(
          { error: 'Search not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid data', details: error.issues },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to toggle alerts' },
        { status: 500 }
      );
    }
  }
}

/**
 * Convenience functions for Next.js API routes
 */

export function createSearchHandler(
  config?: ConstructorParameters<typeof SearchApiHandler>[0]
) {
  const handler = new SearchApiHandler(config);

  return {
    search: (request: NextRequest, userId?: string) =>
      handler.handleSearch(request, userId),
    suggestions: (request: NextRequest) => handler.handleSuggestions(request),
    popular: (request: NextRequest) => handler.handlePopular(request),
    history: (request: NextRequest, userId: string) =>
      handler.handleSearchHistory(request, userId),
    savedSearches: (request: NextRequest, userId: string) =>
      handler.handleSavedSearches(request, userId),
    savedSearch: (request: NextRequest, userId: string, searchId: string) =>
      handler.handleSavedSearch(request, userId, searchId),
    toggleAlerts: (request: NextRequest, userId: string, searchId: string) =>
      handler.handleToggleAlerts(request, userId, searchId),
  };
}
