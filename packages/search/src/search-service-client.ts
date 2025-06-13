import { getCacheService } from '@repo/cache';
import { getAlgoliaSearch } from './algolia-search';
import type { SearchConfig, SearchProduct, SearchFilters, SearchResult } from './types';
import type { ProductRepository, Product } from './repositories';
import { CACHE_KEYS, CACHE_TTL, CACHE_TAGS } from '@repo/cache';

export function createSearchService(
  config: SearchConfig,
  productRepository: ProductRepository
) {
  const searchEngine = getAlgoliaSearch(config);
  const cacheService = getCacheService();

  // Transform database product to search product
  function transformProductForSearch(product: Product): SearchProduct {
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
      sellerName: product.seller ? `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() : '',
      sellerRating: product.seller?.averageRating || 0,
      sellerLocation: product.seller?.location || '',
      images: product.images?.map((img) => img.imageUrl).filter(Boolean) || [],
      views: product.views || 0,
      favorites: product._count?.favorites || 0,
      status: product.status,
      createdAt: Math.floor(product.createdAt.getTime() / 1000), // Unix timestamp
      tags: generateTags(product),
      colors: extractColors(product),
      materials: extractMaterials(product),
      availableForTrade: product.availableForTrade || false,
    };
  }

  function generateTags(product: Product): string[] {
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

  function extractColors(product: Product): string[] {
    const colorKeywords = [
      'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple',
      'pink', 'brown', 'gray', 'grey', 'navy', 'beige', 'cream', 'gold',
      'silver', 'bronze', 'maroon', 'teal', 'olive', 'coral', 'mint'
    ];
    
    const text = `${product.title} ${product.description || ''}`.toLowerCase();
    return colorKeywords.filter(color => text.includes(color));
  }

  function extractMaterials(product: Product): string[] {
    const materialKeywords = [
      'cotton', 'polyester', 'wool', 'silk', 'linen', 'denim', 'leather',
      'suede', 'cashmere', 'viscose', 'nylon', 'spandex', 'elastane',
      'acrylic', 'modal', 'bamboo', 'hemp', 'tencel'
    ];
    
    const text = `${product.title} ${product.description || ''}`.toLowerCase();
    return materialKeywords.filter(material => text.includes(material));
  }

  return {
    // Index all products
    async indexAllProducts(): Promise<void> {
      try {
        const products = await productRepository.findMany({
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

        const searchProducts = products.map(p => transformProductForSearch(p));
        await searchEngine.index(searchProducts);

      } catch (error) {
        throw error;
      }
    },

    // Index a single product
    async indexProduct(productId: string): Promise<void> {
      try {
        const product = await productRepository.findById(productId);

        if (!product) {
          throw new Error(`Product ${productId} not found`);
        }

        const searchProduct = transformProductForSearch(product);
        await searchEngine.updateProduct(searchProduct);

        // Invalidate related cache
        await cacheService.invalidateProduct(productId);
      } catch (error) {
        throw error;
      }
    },

    // Remove product from search index
    async removeProduct(productId: string): Promise<void> {
      try {
        await searchEngine.deleteProduct(productId);
        await cacheService.invalidateProduct(productId);
      } catch (error) {
        throw error;
      }
    },

    // Search with caching
    async search(
      filters: SearchFilters,
      page = 0,
      hitsPerPage = 20
    ): Promise<SearchResult> {
      try {
        // Create cache key based on search parameters
        const cacheKey = createSearchCacheKey(filters, page, hitsPerPage);
        
        // Try to get from cache first
        const cachedResult = await cacheService.getSearchResults(cacheKey);
        if (cachedResult) {
          return cachedResult;
        }

        // Perform search
        const result = await searchEngine.search(filters, page as any, hitsPerPage as any);

        // Cache the result
        await cacheService.cacheSearchResults(cacheKey, result);

        return result;
      } catch (error) {
        throw error;
      }
    },

    // Get search suggestions with caching
    async getSearchSuggestions(query: string, limit = 5) {
      try {
        const cacheKey = `search_suggestions:${query}:${limit}`;
        
        return cacheService.remember(
          cacheKey,
          () => searchEngine.searchSuggestions(query, limit as any),
          CACHE_TTL.SHORT,
          [CACHE_TAGS.SEARCH]
        );
      } catch (error) {
        return [];
      }
    },

    // Get popular products with caching
    async getPopularProducts(limit = 10) {
      try {
        const cacheKey = `popular_products:${limit}`;
        
        return cacheService.remember(
          cacheKey,
          () => searchEngine.getPopularProducts(limit as any),
          CACHE_TTL.LONG,
          [CACHE_TAGS.PRODUCTS]
        );
      } catch (error) {
        return [];
      }
    },

    // Get similar products with caching
    async getSimilarProducts(productId: string, limit = 6) {
      try {
        const cacheKey = `similar_products:${productId}:${limit}`;
        
        return cacheService.remember(
          cacheKey,
          () => searchEngine.getSimilarProducts(productId, limit as any),
          CACHE_TTL.LONG,
          [CACHE_TAGS.PRODUCTS]
        );
      } catch (error) {
        return [];
      }
    },

    // Get products by category with caching
    async getProductsByCategory(category: string, limit = 20) {
      try {
        const cacheKey = `category_products:${category}:${limit}`;
        
        return cacheService.remember(
          cacheKey,
          () => searchEngine.getProductsByCategory(category, limit),
          CACHE_TTL.MEDIUM,
          [CACHE_TAGS.PRODUCTS, CACHE_TAGS.CATEGORIES]
        );
      } catch (error) {
        return [];
      }
    },

    // Analytics and tracking
    async trackProductClick(productId: string, query: string, position: number) {
      try {
        await searchEngine.trackClick(productId, query, position);
      } catch (error) {
      }
    },

    async trackProductConversion(productId: string, query: string) {
      try {
        await searchEngine.trackConversion(productId, query);
      } catch (error) {
      }
    },

    // Auto-complete functionality
    async getAutoComplete(query: string, limit = 8) {
      try {
        if (!query || query.length < 2) return [];

        const cacheKey = `autocomplete:${query}:${limit}`;
        
        return cacheService.remember(
          cacheKey,
          async () => {
            const result = await searchEngine.search(
              { query },
              0,
              limit as any
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
        return [];
      }
    },

    // Facet data for filters
    async getFacetData(query = '') {
      try {
        const cacheKey = `facets:${query}`;
        
        return cacheService.remember(
          cacheKey,
          async () => {
            const result = await searchEngine.search(
              { query },
              0,
              0 as any // We only want facets, not hits
            );
            
            return result.facets || {};
          },
          CACHE_TTL.MEDIUM,
          [CACHE_TAGS.SEARCH]
        );
      } catch (error) {
        return {};
      }
    },

    // Clear search cache
    async clearSearchCache(): Promise<void> {
      await cacheService.invalidateSearchResults();
    },

    // Reindex products in batches
    async reindexProducts(batchSize = 1000): Promise<void> {
      try {
        let skip = 0;
        let hasMore = true;

        while (hasMore) {
          const products = await productRepository.findMany({
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

          const searchProducts = products.map(p => transformProductForSearch(p));
          await searchEngine.index(searchProducts);

          
          skip += batchSize;
          hasMore = products.length === batchSize;
        }

      } catch (error) {
        throw error;
      }
    }
  };
}

// Utility function
function createSearchCacheKey(filters: SearchFilters, page: number, hitsPerPage: number): string {
  const filterKey = JSON.stringify({
    ...filters,
    page,
    hitsPerPage,
  });
  
  return Buffer.from(filterKey).toString('base64');
}

export type SearchServiceClient = ReturnType<typeof createSearchService>;