import algoliasearch from 'algoliasearch';
import { withRetry } from '@repo/error-handling';
import type { 
  SearchConfig, 
  SearchProduct, 
  SearchFilters, 
  SearchResult, 
  SearchSuggestion,
  SearchAnalytics,
  SearchIndexable,
  SearchEngine
} from './types';
import { SEARCH_FACETS, SEARCH_SETTINGS } from './types';

export class AlgoliaSearchService implements SearchEngine, SearchIndexable {
  private client: ReturnType<typeof algoliasearch>;
  private searchIndex: any; // Using any for Algolia index type
  private indexName: string;

  constructor(config: SearchConfig) {
    this.client = algoliasearch(config.appId, config.apiKey);
    this.searchIndex = this.client.initIndex(config.indexName);
    this.indexName = config.indexName;
    
    this.configureIndex();
  }

  private async configureIndex() {
    try {
      await this.searchIndex.setSettings({
        // Searchable attributes with priorities
        searchableAttributes: [
          'title',
          'brand',
          'description',
          'categoryName',
          'sellerName',
          'tags',
        ],
        
        // Attributes for faceting and filtering
        attributesForFaceting: [
          'searchable(categoryName)',
          'searchable(brand)',
          'condition',
          'size',
          'colors',
          'materials',
          'sellerRating',
          'sellerLocation',
          'availableForTrade',
          'status',
        ],
        
        // Custom ranking attributes
        customRanking: [
          'desc(views)',
          'desc(favorites)',
          'desc(sellerRating)',
          'desc(createdAt)',
        ],
        
        // Ranking formula
        ranking: [
          'typo',
          'geo',
          'words',
          'filters',
          'proximity',
          'attribute',
          'exact',
          'custom',
        ],
        
        // Highlighting
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        
        // Pagination
        hitsPerPage: SEARCH_SETTINGS.DEFAULT_HITS_PER_PAGE,
        maxValuesPerFacet: 100,
        
        // Advanced features
        removeWordsIfNoResults: 'allOptional',
        advancedSyntax: true,
        allowCompressionOfIntegerArray: true,
      });
    } catch (error) {
    }
  }

  // Indexing methods
  async index(products: SearchProduct[]): Promise<void> {
    try {
      const chunks = this.chunkArray(products, 1000); // Algolia limit
      
      for (const chunk of chunks) {
        await withRetry(
          () => this.searchIndex.saveObjects(chunk.map(p => ({ ...p, objectID: p.id }))),
          { retries: 3, minTimeout: 1000 }
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(product: SearchProduct): Promise<void> {
    try {
      await withRetry(
        () => this.searchIndex.saveObject({ ...product, objectID: product.id }),
        { retries: 3, minTimeout: 500 }
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await withRetry(
        () => this.searchIndex.deleteObject(productId),
        { retries: 3, minTimeout: 500 }
      );
    } catch (error) {
      throw error;
    }
  }

  async clearIndex(): Promise<void> {
    try {
      await this.searchIndex.clearObjects();
    } catch (error) {
      throw error;
    }
  }

  async getIndexStats() {
    try {
      const stats = await this.searchIndex.getTask(0); // This is a simplified approach
      return {
        objectCount: 0, // Would need to implement proper stats fetching
        fileSize: 0,
      };
    } catch (error) {
      return { objectCount: 0, fileSize: 0 };
    }
  }

  // Search methods
  async search(
    filters: SearchFilters,
    page: number = 0,
    hitsPerPage: number = SEARCH_SETTINGS.DEFAULT_HITS_PER_PAGE
  ): Promise<SearchResult> {
    try {
      const searchParams: any = {
        page,
        hitsPerPage: Math.min(hitsPerPage, SEARCH_SETTINGS.MAX_HITS_PER_PAGE),
        facets: Object.values(SEARCH_FACETS),
        maxValuesPerFacet: 100,
      };

      // Apply filters
      const algoliaFilters: string[] = [];

      if (filters.categories?.length) {
        algoliaFilters.push(`(${filters.categories.map(c => `categoryName:"${c}"`).join(' OR ')})`);
      }

      if (filters.brands?.length) {
        algoliaFilters.push(`(${filters.brands.map(b => `brand:"${b}"`).join(' OR ')})`);
      }

      if (filters.conditions?.length) {
        algoliaFilters.push(`(${filters.conditions.map(c => `condition:"${c}"`).join(' OR ')})`);
      }

      if (filters.sizes?.length) {
        algoliaFilters.push(`(${filters.sizes.map(s => `size:"${s}"`).join(' OR ')})`);
      }

      if (filters.priceRange) {
        algoliaFilters.push(`price:${filters.priceRange.min} TO ${filters.priceRange.max}`);
      }

      if (filters.sellerRating) {
        algoliaFilters.push(`sellerRating >= ${filters.sellerRating}`);
      }

      if (filters.availableForTrade !== undefined) {
        algoliaFilters.push(`availableForTrade:${filters.availableForTrade}`);
      }

      // Only show available products
      algoliaFilters.push('status:"AVAILABLE"');

      if (algoliaFilters.length > 0) {
        searchParams.filters = algoliaFilters.join(' AND ');
      }

      // Apply sorting
      if (filters.sortBy && filters.sortBy !== 'relevance') {
        const sortMappings = {
          price_asc: 'price_asc',
          price_desc: 'price_desc',
          newest: 'createdAt_desc',
          most_viewed: 'views_desc',
          most_favorited: 'favorites_desc',
        };
        
        const sortIndex = sortMappings[filters.sortBy];
        if (sortIndex) {
          searchParams.indexName = `${this.indexName}_${sortIndex}`;
        }
      }

      const result = await withRetry(
        () => this.searchIndex.search(filters.query || '', searchParams),
        { retries: 3, minTimeout: 500 }
      ) as any;

      return {
        hits: result.hits as SearchProduct[],
        totalHits: result.nbHits,
        page: result.page,
        totalPages: result.nbPages,
        processingTimeMS: result.processingTimeMS,
        facets: result.facets,
        filters,
      };
    } catch (error) {
      throw error;
    }
  }

  async searchSuggestions(query: string, limit: number = SEARCH_SETTINGS.DEFAULT_SUGGESTION_LIMIT): Promise<SearchSuggestion[]> {
    try {
      if (!query || query.length < 2) return [];

      const result = await this.searchIndex.search(query, {
        hitsPerPage: 0,
        facets: [SEARCH_FACETS.CATEGORIES],
        maxValuesPerFacet: limit,
      });

      const suggestions: SearchSuggestion[] = [];

      // Add query-based suggestions
      if (result.nbHits > 0) {
        suggestions.push({
          query,
          count: result.nbHits,
        });
      }

      // Add category suggestions
      if (result.facets?.[SEARCH_FACETS.CATEGORIES]) {
        Object.entries(result.facets[SEARCH_FACETS.CATEGORIES])
          .slice(0, limit - 1)
          .forEach(([category, count]) => {
            suggestions.push({
              query,
              category,
              count: count as number,
            });
          });
      }

      return suggestions;
    } catch (error) {
      return [];
    }
  }

  async getPopularProducts(limit: number = SEARCH_SETTINGS.POPULAR_PRODUCTS_LIMIT): Promise<SearchProduct[]> {
    try {
      const result = await this.searchIndex.search('', {
        hitsPerPage: limit,
        filters: 'status:"AVAILABLE"',
        // This will use the custom ranking which prioritizes views and favorites
      });

      return result.hits as SearchProduct[];
    } catch (error) {
      return [];
    }
  }

  async getSimilarProducts(productId: string, limit: number = SEARCH_SETTINGS.SIMILAR_PRODUCTS_LIMIT): Promise<SearchProduct[]> {
    try {
      // First get the product to find similar ones
      const product = await this.searchIndex.getObject(productId) as SearchProduct;
      
      if (!product) return [];

      // Search for similar products based on category, brand, and price range
      const priceMin = product.price * 0.5;
      const priceMax = product.price * 2;

      const result = await this.searchIndex.search('', {
        hitsPerPage: limit + 1, // +1 to exclude the original product
        filters: `status:"AVAILABLE" AND categoryName:"${product.categoryName}" AND price:${priceMin} TO ${priceMax} AND NOT objectID:"${productId}"`,
      });

      return result.hits.slice(0, limit) as SearchProduct[];
    } catch (error) {
      return [];
    }
  }

  async getProductsByCategory(category: string, limit: number = 20): Promise<SearchProduct[]> {
    try {
      const result = await this.searchIndex.search('', {
        hitsPerPage: limit,
        filters: `status:"AVAILABLE" AND categoryName:"${category}"`,
      });

      return result.hits as SearchProduct[];
    } catch (error) {
      return [];
    }
  }

  // Analytics methods
  async trackClick(productId: string, query: string, position: number): Promise<void> {
    try {
      // Note: This requires Algolia Insights API
      // Implementation would depend on your analytics setup
    } catch (error) {
    }
  }

  async trackConversion(productId: string, query: string): Promise<void> {
    try {
      // Note: This requires Algolia Insights API
    } catch (error) {
    }
  }

  async getAnalytics(startDate: Date, endDate: Date): Promise<SearchAnalytics> {
    try {
      // Note: This would require Algolia Analytics API
      // Return mock data for now
      return {
        totalSearches: 0,
        topQueries: [],
        topCategories: [],
        averageClickPosition: 0,
        conversionRate: 0,
      };
    } catch (error) {
      return {
        totalSearches: 0,
        topQueries: [],
        topCategories: [],
        averageClickPosition: 0,
        conversionRate: 0,
      };
    }
  }

  // Utility methods
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Singleton instance
let algoliaSearch: AlgoliaSearchService | null = null;

export function getAlgoliaSearch(config?: SearchConfig): AlgoliaSearchService {
  if (!algoliaSearch && config) {
    algoliaSearch = new AlgoliaSearchService(config);
  }
  
  if (!algoliaSearch) {
    throw new Error('AlgoliaSearch not initialized. Call with config first.');
  }
  
  return algoliaSearch;
}