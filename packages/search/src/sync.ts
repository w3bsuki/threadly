import { algoliasearch } from 'algoliasearch';
import type { SearchClient, SearchIndex } from 'algoliasearch';
import { log, logError } from '@repo/observability/server';
import type { Product } from '@repo/database';

interface AlgoliaProduct {
  objectID: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  brand?: string | null;
  size?: string | null;
  color?: string | null;
  sellerId: string;
  sellerName?: string;
  sellerImageUrl?: string | null;
  status: string;
  views: number;
  favoritesCount?: number;
  images: Array<{
    id: string;
    imageUrl: string;
    displayOrder: number;
  }>;
  createdAt: number;
  updatedAt: number;
}

export class AlgoliaSyncService {
  private client: SearchClient;
  private index: SearchIndex;
  private isConfigured: boolean = false;

  constructor() {
    const appId = process.env.ALGOLIA_APP_ID;
    const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;
    const indexName = process.env.ALGOLIA_INDEX_NAME || 'products';

    if (!appId || !apiKey) {
      log('Algolia sync service not configured - missing credentials');
      this.isConfigured = false;
      return;
    }

    try {
      this.client = algoliasearch(appId, apiKey);
      this.index = this.client.initIndex(indexName);
      this.isConfigured = true;
      
      // Configure index settings
      this.configureIndex();
    } catch (error) {
      logError('Failed to initialize Algolia client', { error });
      this.isConfigured = false;
    }
  }

  private async configureIndex() {
    if (!this.isConfigured) return;

    try {
      await this.index.setSettings({
        searchableAttributes: [
          'title',
          'description',
          'brand',
          'categoryName',
          'sellerName',
        ],
        attributesForFaceting: [
          'searchable(categoryName)',
          'searchable(brand)',
          'condition',
          'size',
          'color',
          'status',
          'sellerId',
          'price',
        ],
        customRanking: [
          'desc(createdAt)',
          'desc(views)',
          'desc(favoritesCount)',
        ],
        attributesToRetrieve: [
          'objectID',
          'title',
          'description',
          'price',
          'condition',
          'categoryId',
          'categoryName',
          'categorySlug',
          'brand',
          'size',
          'color',
          'sellerId',
          'sellerName',
          'sellerImageUrl',
          'status',
          'views',
          'favoritesCount',
          'images',
          'createdAt',
          'updatedAt',
        ],
        numericAttributesForFiltering: [
          'price',
          'views',
          'favoritesCount',
          'createdAt',
        ],
      });

      log('Algolia index configured successfully');
    } catch (error) {
      logError('Failed to configure Algolia index', { error });
    }
  }

  private transformProduct(product: any): AlgoliaProduct {
    return {
      objectID: product.id,
      title: product.title,
      description: product.description,
      price: Number(product.price),
      condition: product.condition,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      categorySlug: product.category?.slug,
      brand: product.brand,
      size: product.size,
      color: product.color,
      sellerId: product.sellerId,
      sellerName: product.seller ? 
        `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() : 
        undefined,
      sellerImageUrl: product.seller?.imageUrl,
      status: product.status,
      views: product.views,
      favoritesCount: product._count?.favorites || 0,
      images: product.images?.map((img: any) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        displayOrder: img.displayOrder,
      })) || [],
      createdAt: new Date(product.createdAt).getTime(),
      updatedAt: new Date(product.updatedAt).getTime(),
    };
  }

  async indexProduct(product: any): Promise<void> {
    if (!this.isConfigured) {
      log('Skipping Algolia indexing - service not configured');
      return;
    }

    try {
      const algoliaProduct = this.transformProduct(product);
      await this.index.saveObject(algoliaProduct);
      log('Product indexed to Algolia', { productId: product.id });
    } catch (error) {
      logError('Failed to index product to Algolia', { 
        error, 
        productId: product.id 
      });
      throw error;
    }
  }

  async updateProduct(product: any): Promise<void> {
    if (!this.isConfigured) {
      log('Skipping Algolia update - service not configured');
      return;
    }

    try {
      const algoliaProduct = this.transformProduct(product);
      await this.index.partialUpdateObject(algoliaProduct);
      log('Product updated in Algolia', { productId: product.id });
    } catch (error) {
      logError('Failed to update product in Algolia', { 
        error, 
        productId: product.id 
      });
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    if (!this.isConfigured) {
      log('Skipping Algolia deletion - service not configured');
      return;
    }

    try {
      await this.index.deleteObject(productId);
      log('Product deleted from Algolia', { productId });
    } catch (error) {
      logError('Failed to delete product from Algolia', { 
        error, 
        productId 
      });
      throw error;
    }
  }

  async bulkIndex(products: any[]): Promise<void> {
    if (!this.isConfigured) {
      log('Skipping Algolia bulk indexing - service not configured');
      return;
    }

    try {
      const algoliaProducts = products.map(p => this.transformProduct(p));
      await this.index.saveObjects(algoliaProducts);
      log('Bulk indexed products to Algolia', { count: products.length });
    } catch (error) {
      logError('Failed to bulk index products to Algolia', { error });
      throw error;
    }
  }

  async clearIndex(): Promise<void> {
    if (!this.isConfigured) {
      log('Skipping Algolia clear - service not configured');
      return;
    }

    try {
      await this.index.clearObjects();
      log('Algolia index cleared');
    } catch (error) {
      logError('Failed to clear Algolia index', { error });
      throw error;
    }
  }
}

// Singleton instance
let syncService: AlgoliaSyncService | null = null;

export function getAlgoliaSyncService(): AlgoliaSyncService {
  if (!syncService) {
    syncService = new AlgoliaSyncService();
  }
  return syncService;
}