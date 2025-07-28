/**
 * Unified Search Service
 * Combines Algolia and database search with fallback capabilities
 */

import { getCacheService } from '@repo/cache';
import { database } from '@repo/database';
import { AlgoliaSearchService } from './algolia-search';
import { SearchHistoryService } from './history';
import type {
  SearchConfig,
  SearchEngine,
  SearchFilters,
  SearchProduct,
  SearchResult,
  SearchSuggestion,
} from './types';

export interface UnifiedSearchConfig {
  useAlgolia: boolean;
  useDatabaseFallback: boolean;
  algoliaConfig?: SearchConfig;
  cacheResults: boolean;
  cacheTTL?: number; // in seconds
  trackHistory: boolean;
  userId?: string;
}

/**
 * Unified Search Service that handles both Algolia and database search
 */
export class UnifiedSearchService implements SearchEngine {
  private algoliaService?: AlgoliaSearchService;
  private cache = getCacheService();
  private config: UnifiedSearchConfig;

  constructor(config: UnifiedSearchConfig) {
    this.config = {
      cacheTTL: 300, // 5 minutes default
      ...config,
    };

    if (this.config.useAlgolia && this.config.algoliaConfig) {
      try {
        this.algoliaService = new AlgoliaSearchService(
          this.config.algoliaConfig
        );
      } catch (error) {
        console.warn('Failed to initialize Algolia service:', error);
      }
    }
  }

  /**
   * Main search method with Algolia-first, database fallback
   */
  async search(
    filters: SearchFilters,
    page = 0,
    hitsPerPage = 20
  ): Promise<SearchResult> {
    const cacheKey = this.generateCacheKey(
      'search',
      filters,
      page,
      hitsPerPage
    );

    // Try cache first if enabled
    if (this.config.cacheResults) {
      const cached = await this.cache.get<SearchResult>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    let result: SearchResult;

    // Try Algolia first
    if (this.algoliaService) {
      try {
        result = await this.algoliaService.search(filters, page, hitsPerPage);

        // Cache successful result
        if (this.config.cacheResults) {
          await this.cache.set(cacheKey, result, { ttl: this.config.cacheTTL });
        }

        // Track search history
        if (this.config.trackHistory && filters.query && this.config.userId) {
          await SearchHistoryService.saveToDatabase(
            this.config.userId,
            filters.query,
            filters,
            result.totalHits
          );
        }

        return result;
      } catch (error) {
        console.warn('Algolia search failed, falling back to database:', error);
      }
    }

    // Fallback to database search
    if (this.config.useDatabaseFallback) {
      result = await this.searchDatabase(filters, page, hitsPerPage);

      // Cache successful result
      if (this.config.cacheResults) {
        await this.cache.set(cacheKey, result, { ttl: this.config.cacheTTL });
      }

      // Track search history
      if (this.config.trackHistory && filters.query && this.config.userId) {
        await SearchHistoryService.saveToDatabase(
          this.config.userId,
          filters.query,
          filters,
          result.totalHits
        );
      }

      return result;
    }

    // No search method available
    throw new Error('No search service available');
  }

  /**
   * Database search implementation
   */
  private async searchDatabase(
    filters: SearchFilters,
    page = 0,
    hitsPerPage = 20
  ): Promise<SearchResult> {
    const skip = page * hitsPerPage;

    // Build where clause
    const where: any = {
      status: 'AVAILABLE',
    };

    // Text search
    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { brand: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (filters.categories?.length) {
      where.categoryId = { in: filters.categories };
    }

    // Brand filter
    if (filters.brands?.length) {
      where.brand = { in: filters.brands };
    }

    // Condition filter
    if (filters.conditions?.length) {
      where.condition = { in: filters.conditions };
    }

    // Size filter
    if (filters.sizes?.length) {
      where.size = { in: filters.sizes };
    }

    // Color filter
    if (filters.colors?.length) {
      where.color = { in: filters.colors };
    }

    // Price range filter
    if (filters.priceRange) {
      where.price = {
        gte: filters.priceRange.min,
        lte: filters.priceRange.max,
      };
    }

    // Seller rating filter (requires join)
    if (filters.sellerRating) {
      where.seller = {
        averageRating: { gte: filters.sellerRating },
      };
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' }; // default

    switch (filters.sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'most_viewed':
        orderBy = { views: 'desc' };
        break;
      case 'most_favorited':
        orderBy = { favorites: 'desc' };
        break;
    }

    // Execute search
    const [products, totalCount] = await Promise.all([
      database.product.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          images: {
            orderBy: { displayOrder: 'asc' },
            take: 3,
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          favorites: true,
        },
        orderBy,
        skip,
        take: hitsPerPage,
      }),
      database.product.count({ where }),
    ]);

    // Transform to SearchProduct format
    const hits: SearchProduct[] = products.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description || '',
      brand: product.brand || '',
      price: Number(product.price),
      condition: product.condition,
      size: product.size || undefined,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      sellerId: product.sellerId,
      sellerName:
        `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim(),
      sellerRating: undefined,
      sellerLocation: undefined,
      images: product.images.map((img) => img.imageUrl),
      views: product.views,
      favorites: product.favorites?.length || 0,
      status: product.status,
      createdAt: product.createdAt.getTime(),
      tags: [],
      colors: product.color ? [product.color] : undefined,
      materials: undefined,
      availableForTrade: false,
    }));

    return {
      hits,
      totalHits: totalCount,
      page,
      totalPages: Math.ceil(totalCount / hitsPerPage),
      processingTimeMS: 0, // Not applicable for database search
      filters,
    };
  }

  /**
   * Search suggestions with fallback
   */
  async searchSuggestions(
    query: string,
    limit = 5
  ): Promise<SearchSuggestion[]> {
    const cacheKey = this.generateCacheKey('suggestions', { query }, limit);

    if (this.config.cacheResults) {
      const cached = await this.cache.get<SearchSuggestion[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Try Algolia first
    if (this.algoliaService) {
      try {
        const suggestions = await this.algoliaService.searchSuggestions(
          query,
          limit
        );

        if (this.config.cacheResults) {
          await this.cache.set(cacheKey, suggestions, {
            ttl: this.config.cacheTTL,
          });
        }

        return suggestions;
      } catch (error) {
        console.warn(
          'Algolia suggestions failed, falling back to database:',
          error
        );
      }
    }

    // Database fallback for suggestions
    const suggestions = await this.getDatabaseSuggestions(query, limit);

    if (this.config.cacheResults) {
      await this.cache.set(cacheKey, suggestions, {
        ttl: this.config.cacheTTL,
      });
    }

    return suggestions;
  }

  /**
   * Get suggestions from database
   */
  private async getDatabaseSuggestions(
    query: string,
    limit: number
  ): Promise<SearchSuggestion[]> {
    const searchResults = await database.product.groupBy({
      by: ['title'],
      where: {
        status: 'AVAILABLE',
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      _count: {
        title: true,
      },
      orderBy: {
        _count: {
          title: 'desc',
        },
      },
      take: limit,
    });

    return searchResults.map((result) => ({
      query: result.title,
      count: result._count.title,
    }));
  }

  /**
   * Get popular products
   */
  async getPopularProducts(limit = 10): Promise<SearchProduct[]> {
    if (this.algoliaService) {
      try {
        return await this.algoliaService.getPopularProducts(limit);
      } catch (error) {
        console.warn(
          'Algolia popular products failed, falling back to database:',
          error
        );
      }
    }

    // Database fallback
    const result = await this.searchDatabase(
      { sortBy: 'most_viewed' },
      0,
      limit
    );

    return result.hits;
  }

  /**
   * Get similar products
   */
  async getSimilarProducts(
    productId: string,
    limit = 6
  ): Promise<SearchProduct[]> {
    if (this.algoliaService) {
      try {
        return await this.algoliaService.getSimilarProducts(productId, limit);
      } catch (error) {
        console.warn(
          'Algolia similar products failed, falling back to database:',
          error
        );
      }
    }

    // Database fallback - find similar products by category and brand
    const product = await database.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) return [];

    const result = await this.searchDatabase(
      {
        categories: [product.categoryId],
        brands: product.brand ? [product.brand] : undefined,
      },
      0,
      limit + 1 // Get one extra to exclude the original product
    );

    // Filter out the original product
    return result.hits.filter((hit) => hit.id !== productId).slice(0, limit);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    category: string,
    limit = 20
  ): Promise<SearchProduct[]> {
    const result = await this.search({ categories: [category] }, 0, limit);

    return result.hits;
  }

  /**
   * Track click analytics (placeholder - extend as needed)
   */
  async trackClick(
    productId: string,
    query: string,
    position: number
  ): Promise<void> {
    if (this.algoliaService) {
      try {
        await this.algoliaService.trackClick(productId, query, position);
      } catch (error) {
        console.warn('Failed to track click:', error);
      }
    }

    // Could also track in database for analytics
  }

  /**
   * Track conversion analytics (placeholder - extend as needed)
   */
  async trackConversion(productId: string, query: string): Promise<void> {
    if (this.algoliaService) {
      try {
        await this.algoliaService.trackConversion(productId, query);
      } catch (error) {
        console.warn('Failed to track conversion:', error);
      }
    }

    // Could also track in database for analytics
  }

  /**
   * Get analytics (placeholder - extend as needed)
   */
  async getAnalytics(startDate: Date, endDate: Date) {
    if (this.algoliaService) {
      try {
        return await this.algoliaService.getAnalytics(startDate, endDate);
      } catch (error) {
        console.warn('Failed to get analytics:', error);
      }
    }

    // Return empty analytics if no service available
    return {
      totalSearches: 0,
      topQueries: [],
      topCategories: [],
      averageClickPosition: 0,
      conversionRate: 0,
    };
  }

  /**
   * Generate cache key for consistent caching
   */
  private generateCacheKey(
    operation: string,
    filters: any,
    ...args: any[]
  ): string {
    const key = `search:${operation}:${JSON.stringify(filters)}:${args.join(':')}`;
    return key.replace(/\s+/g, '').toLowerCase();
  }
}
