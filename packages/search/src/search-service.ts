import { database } from '@repo/database';
import { getCacheService } from '@repo/cache';
import { getAlgoliaSearch } from './algolia-search';
import type { SearchConfig, SearchProduct, SearchFilters, SearchResult } from './types';
import { CACHE_KEYS, CACHE_TTL, CACHE_TAGS } from '@repo/cache';

export class MarketplaceSearchService {
  private searchEngine = getAlgoliaSearch();
  private cacheService = getCacheService();

  constructor(config: SearchConfig) {
    getAlgoliaSearch(config);
  }

  // Transform database product to search product
  private transformProductForSearch(product: any): SearchProduct {
    return {
      id: product.id,
      title: product.title,
      description: product.description || '',
      brand: product.brand || '',
      price: product.price,
      condition: product.condition,
      size: product.size || '',
      categoryId: product.categoryId,
      categoryName: product.category?.name || '',
      sellerId: product.sellerId,
      sellerName: product.seller ? `${product.seller.firstName} ${product.seller.lastName}`.trim() : '',
      sellerRating: product.seller?.averageRating || 0,
      sellerLocation: product.seller?.location || '',
      images: product.images?.map((img: any) => img.imageUrl).filter(Boolean) || [],
      views: product.views || 0,
      favorites: product._count?.favorites || 0,
      status: product.status,
      createdAt: Math.floor(product.createdAt.getTime() / 1000), // Unix timestamp
      tags: this.generateTags(product),
      colors: this.extractColors(product),
      materials: this.extractMaterials(product),
      availableForTrade: product.availableForTrade || false,
    };
  }

  private generateTags(product: any): string[] {
    const tags: string[] = [];
    
    if (product.brand) tags.push(product.brand.toLowerCase());
    if (product.condition) tags.push(product.condition.toLowerCase());
    if (product.size) tags.push(product.size.toLowerCase());
    if (product.category?.name) tags.push(product.category.name.toLowerCase());
    
    // Extract keywords from title and description
    const text = `${product.title} ${product.description || ''}`.toLowerCase();
    const keywords = text.match(/\b\w{3,}\b/g) || [];
    tags.push(...keywords.slice(0, 10)); // Limit to 10 keywords
    
    return [...new Set(tags)]; // Remove duplicates
  }

  private extractColors(product: any): string[] {
    // This could be enhanced with ML/AI for automatic color detection
    const colorKeywords = [
      'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple',
      'pink', 'brown', 'gray', 'grey', 'navy', 'beige', 'cream', 'gold',
      'silver', 'bronze', 'maroon', 'teal', 'olive', 'coral', 'mint'
    ];
    
    const text = `${product.title} ${product.description || ''}`.toLowerCase();
    return colorKeywords.filter(color => text.includes(color));
  }

  private extractMaterials(product: any): string[] {
    const materialKeywords = [
      'cotton', 'polyester', 'wool', 'silk', 'linen', 'denim', 'leather',
      'suede', 'cashmere', 'viscose', 'nylon', 'spandex', 'elastane',
      'acrylic', 'modal', 'bamboo', 'hemp', 'tencel'
    ];
    
    const text = `${product.title} ${product.description || ''}`.toLowerCase();
    return materialKeywords.filter(material => text.includes(material));
  }

  // Index all products
  async indexAllProducts(): Promise<void> {
    try {
      const products = await database.product.findMany({
        include: {
          category: true,
          seller: {
            select: {
              firstName: true,
              lastName: true,
              averageRating: true,
              location: true,
            },
          },
          images: true,
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      });

      const searchProducts = products.map(p => this.transformProductForSearch(p));
      await this.searchEngine.index(searchProducts);

      console.log(`Successfully indexed ${searchProducts.length} products`);
    } catch (error) {
      console.error('Failed to index all products:', error);
      throw error;
    }
  }

  // Index a single product
  async indexProduct(productId: string): Promise<void> {
    try {
      const product = await database.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          seller: {
            select: {
              firstName: true,
              lastName: true,
              averageRating: true,
              location: true,
            },
          },
          images: true,
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      });

      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      const searchProduct = this.transformProductForSearch(product);
      await this.searchEngine.updateProduct(searchProduct);

      // Invalidate related cache
      await this.cacheService.invalidateProduct(productId);
    } catch (error) {
      console.error(`Failed to index product ${productId}:`, error);
      throw error;
    }
  }

  // Remove product from search index
  async removeProduct(productId: string): Promise<void> {
    try {
      await this.searchEngine.deleteProduct(productId);
      await this.cacheService.invalidateProduct(productId);
    } catch (error) {
      console.error(`Failed to remove product ${productId}:`, error);
      throw error;
    }
  }

  // Search with caching
  async search(
    filters: SearchFilters,
    page = 0,
    hitsPerPage = 20
  ): Promise<SearchResult> {
    try {
      // Create cache key based on search parameters
      const cacheKey = this.createSearchCacheKey(filters, page, hitsPerPage);
      
      // Try to get from cache first
      const cachedResult = await this.cacheService.getSearchResults(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Perform search
      const result = await this.searchEngine.search(filters, page as number, hitsPerPage as number);

      // Cache the result
      await this.cacheService.cacheSearchResults(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  // Get search suggestions with caching
  async getSearchSuggestions(query: string, limit = 5) {
    try {
      const cacheKey = `search_suggestions:${query}:${limit}`;
      
      return this.cacheService.remember(
        cacheKey,
        () => this.searchEngine.searchSuggestions(query, limit as number),
        CACHE_TTL.SHORT,
        [CACHE_TAGS.SEARCH]
      );
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  // Get popular products with caching
  async getPopularProducts(limit = 10) {
    try {
      const cacheKey = `popular_products:${limit}`;
      
      return this.cacheService.remember(
        cacheKey,
        () => this.searchEngine.getPopularProducts(limit as number),
        CACHE_TTL.LONG,
        [CACHE_TAGS.PRODUCTS]
      );
    } catch (error) {
      console.error('Failed to get popular products:', error);
      return [];
    }
  }

  // Get similar products with caching
  async getSimilarProducts(productId: string, limit = 6) {
    try {
      const cacheKey = `similar_products:${productId}:${limit}`;
      
      return this.cacheService.remember(
        cacheKey,
        () => this.searchEngine.getSimilarProducts(productId, limit as number),
        CACHE_TTL.LONG,
        [CACHE_TAGS.PRODUCTS]
      );
    } catch (error) {
      console.error(`Failed to get similar products for ${productId}:`, error);
      return [];
    }
  }

  // Get products by category with caching
  async getProductsByCategory(category: string, limit = 20) {
    try {
      const cacheKey = `category_products:${category}:${limit}`;
      
      return this.cacheService.remember(
        cacheKey,
        () => this.searchEngine.getProductsByCategory(category, limit),
        CACHE_TTL.MEDIUM,
        [CACHE_TAGS.PRODUCTS, CACHE_TAGS.CATEGORIES]
      );
    } catch (error) {
      console.error(`Failed to get products for category ${category}:`, error);
      return [];
    }
  }

  // Analytics and tracking
  async trackProductClick(productId: string, query: string, position: number) {
    try {
      await this.searchEngine.trackClick(productId, query, position);
    } catch (error) {
      console.error('Failed to track product click:', error);
    }
  }

  async trackProductConversion(productId: string, query: string) {
    try {
      await this.searchEngine.trackConversion(productId, query);
    } catch (error) {
      console.error('Failed to track product conversion:', error);
    }
  }

  // Auto-complete functionality
  async getAutoComplete(query: string, limit = 8) {
    try {
      if (!query || query.length < 2) return [];

      const cacheKey = `autocomplete:${query}:${limit}`;
      
      return this.cacheService.remember(
        cacheKey,
        async () => {
          const result = await this.searchEngine.search(
            { query },
            0,
            limit as number
          );
          
          return result.hits.map(hit => ({
            id: hit.id,
            title: hit.title,
            brand: hit.brand,
            price: hit.price,
            image: hit.images[0],
            category: hit.categoryName,
          }));
        },
        CACHE_TTL.SHORT,
        [CACHE_TAGS.SEARCH]
      );
    } catch (error) {
      console.error('Failed to get autocomplete results:', error);
      return [];
    }
  }

  // Facet data for filters
  async getFacetData(query = '') {
    try {
      const cacheKey = `facets:${query}`;
      
      return this.cacheService.remember(
        cacheKey,
        async () => {
          const result = await this.searchEngine.search(
            { query },
            0,
            0 as number // We only want facets, not hits
          );
          
          return result.facets || {};
        },
        CACHE_TTL.MEDIUM,
        [CACHE_TAGS.SEARCH]
      );
    } catch (error) {
      console.error('Failed to get facet data:', error);
      return {};
    }
  }

  // Utility methods
  private createSearchCacheKey(filters: SearchFilters, page: number, hitsPerPage: number): string {
    const filterKey = JSON.stringify({
      ...filters,
      page,
      hitsPerPage,
    });
    
    return Buffer.from(filterKey).toString('base64');
  }

  // Clear search cache
  async clearSearchCache(): Promise<void> {
    await this.cacheService.invalidateSearchResults();
  }

  // Reindex products in batches
  async reindexProducts(batchSize = 1000): Promise<void> {
    try {
      let skip = 0;
      let hasMore = true;

      while (hasMore) {
        const products = await database.product.findMany({
          skip,
          take: batchSize,
          include: {
            category: true,
            seller: {
              select: {
                firstName: true,
                lastName: true,
                averageRating: true,
                location: true,
              },
            },
            images: true,
            _count: {
              select: {
                favorites: true,
              },
            },
          },
        });

        if (products.length === 0) {
          hasMore = false;
          break;
        }

        const searchProducts = products.map(p => this.transformProductForSearch(p));
        await this.searchEngine.index(searchProducts);

        console.log(`Indexed batch: ${skip + 1} to ${skip + products.length}`);
        
        skip += batchSize;
        hasMore = products.length === batchSize;
      }

      console.log('Product reindexing completed');
    } catch (error) {
      console.error('Failed to reindex products:', error);
      throw error;
    }
  }
}

// Singleton instance
let marketplaceSearchService: MarketplaceSearchService | null = null;

export function getSearchService(config?: SearchConfig): MarketplaceSearchService {
  if (!marketplaceSearchService && config) {
    marketplaceSearchService = new MarketplaceSearchService(config);
  }
  
  if (!marketplaceSearchService) {
    throw new Error('MarketplaceSearchService not initialized. Call with config first.');
  }
  
  return marketplaceSearchService;
}