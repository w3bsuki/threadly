import type { Product } from '@repo/database';
import { logError } from '@repo/observability';
import type { SearchClient } from 'algoliasearch';
import { algoliasearch } from 'algoliasearch';

interface AlgoliaProduct extends Record<string, unknown> {
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
  private client: SearchClient | null = null;
  private indexName: string;
  private isConfigured = false;

  constructor() {
    const appId = process.env.ALGOLIA_APP_ID;
    const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;
    const indexName = process.env.ALGOLIA_INDEX_NAME || 'products';

    this.indexName = indexName;

    if (!(appId && apiKey)) {
      console.log('Algolia sync service not configured - missing credentials');
      this.isConfigured = false;
      return;
    }

    try {
      this.client = algoliasearch(appId, apiKey);
      this.isConfigured = true;

      // TODO: Configure index settings - v5 API has changed
      // this.configureIndex();
    } catch (error) {
      console.error('Failed to initialize Algolia client', error);
      this.isConfigured = false;
    }
  }

  private async configureIndex() {
    if (!(this.isConfigured && this.client)) return;

    // TODO: Fix setSettings API for Algolia v5
    // The v5 API has changed and needs investigation
    // For now, index configuration should be done manually in the Algolia dashboard
    // Original settings preserved for reference:
    /*
    try {
      await this.client.setSettings({
        indexName: this.indexName,
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

      console.log('Algolia index configured successfully');
    } catch (error) {
      logError('Failed to configure Algolia index', error);
    }
    */
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
      sellerName: product.seller
        ? `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim()
        : undefined,
      sellerImageUrl: product.seller?.imageUrl,
      status: product.status,
      views: product.views,
      favoritesCount: product._count?.favorites || 0,
      images:
        product.images?.map((img: any) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          displayOrder: img.displayOrder,
        })) || [],
      createdAt: new Date(product.createdAt).getTime(),
      updatedAt: new Date(product.updatedAt).getTime(),
    };
  }

  async indexProduct(product: any): Promise<void> {
    if (!(this.isConfigured && this.client)) {
      console.log('Skipping Algolia indexing - service not configured');
      return;
    }

    try {
      const algoliaProduct = this.transformProduct(product);
      await this.client.saveObject({
        indexName: this.indexName,
        body: algoliaProduct,
      });
      console.log('Product indexed to Algolia', { productId: product.id });
    } catch (error) {
      logError('Failed to index product to Algolia', error);
      console.error('Product ID:', product.id);
      throw error;
    }
  }

  async updateProduct(product: any): Promise<void> {
    if (!(this.isConfigured && this.client)) {
      console.log('Skipping Algolia update - service not configured');
      return;
    }

    try {
      const algoliaProduct = this.transformProduct(product);
      await this.client.partialUpdateObject({
        indexName: this.indexName,
        objectID: algoliaProduct.objectID,
        attributesToUpdate: algoliaProduct,
      });
      console.log('Product updated in Algolia', { productId: product.id });
    } catch (error) {
      logError('Failed to update product in Algolia', error);
      console.error('Product ID:', product.id);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    if (!(this.isConfigured && this.client)) {
      console.log('Skipping Algolia deletion - service not configured');
      return;
    }

    try {
      await this.client.deleteObject({
        indexName: this.indexName,
        objectID: productId,
      });
      console.log('Product deleted from Algolia', { productId });
    } catch (error) {
      logError('Failed to delete product from Algolia', error);
      console.error('Product ID:', productId);
      throw error;
    }
  }

  async bulkIndex(products: any[]): Promise<void> {
    if (!(this.isConfigured && this.client)) {
      console.log('Skipping Algolia bulk indexing - service not configured');
      return;
    }

    try {
      const algoliaProducts = products.map((p) => this.transformProduct(p));
      await this.client.saveObjects({
        indexName: this.indexName,
        objects: algoliaProducts,
      });
      console.log('Bulk indexed products to Algolia', {
        count: products.length,
      });
    } catch (error) {
      logError('Failed to bulk index products to Algolia', error);
      throw error;
    }
  }

  async clearIndex(): Promise<void> {
    if (!(this.isConfigured && this.client)) {
      console.log('Skipping Algolia clear - service not configured');
      return;
    }

    try {
      await this.client.clearObjects({
        indexName: this.indexName,
      });
      console.log('Algolia index cleared');
    } catch (error) {
      logError('Failed to clear Algolia index', error);
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
