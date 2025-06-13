/**
 * Client for triggering search index updates via webhook
 * This allows us to decouple search indexing from direct database operations
 */

export interface SearchWebhookPayload {
  action: 'created' | 'updated' | 'deleted' | 'bulk_index';
  productId?: string;
  force?: boolean;
  timestamp: string;
}

export class SearchWebhookClient {
  private webhookUrl: string;
  private enabled: boolean;

  constructor(baseUrl: string, enabled = true) {
    this.webhookUrl = `${baseUrl}/api/search/index`;
    this.enabled = enabled;
  }

  private async sendWebhook(payload: SearchWebhookPayload): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ThreadlySearchClient/1.0',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        return false;
      }

      const result = await response.json();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Trigger indexing for a newly created product
   */
  async onProductCreated(productId: string): Promise<boolean> {
    return this.sendWebhook({
      action: 'created',
      productId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Trigger re-indexing for an updated product
   */
  async onProductUpdated(productId: string): Promise<boolean> {
    return this.sendWebhook({
      action: 'updated',
      productId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Remove product from search index
   */
  async onProductDeleted(productId: string): Promise<boolean> {
    return this.sendWebhook({
      action: 'deleted',
      productId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Trigger bulk re-indexing of all products
   */
  async triggerBulkIndex(force = false): Promise<boolean> {
    return this.sendWebhook({
      action: 'bulk_index',
      force,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Check if the search indexing service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'ThreadlySearchClient/1.0',
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
let searchWebhookClient: SearchWebhookClient | null = null;

export function getSearchWebhookClient(baseUrl?: string): SearchWebhookClient {
  if (!searchWebhookClient && baseUrl) {
    const isEnabled = !!(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID && 
      process.env.ALGOLIA_ADMIN_KEY
    );
    
    searchWebhookClient = new SearchWebhookClient(baseUrl, isEnabled);
  }
  
  if (!searchWebhookClient) {
    throw new Error('SearchWebhookClient not initialized. Call with baseUrl first.');
  }
  
  return searchWebhookClient;
}

/**
 * Helper functions for common use cases
 */
export const searchIndexing = {
  /**
   * Initialize the search webhook client
   */
  init(baseUrl: string) {
    return getSearchWebhookClient(baseUrl);
  },

  /**
   * Product lifecycle hooks
   */
  async productCreated(productId: string) {
    try {
      const client = getSearchWebhookClient();
      return await client.onProductCreated(productId);
    } catch (error) {
      return false;
    }
  },

  async productUpdated(productId: string) {
    try {
      const client = getSearchWebhookClient();
      return await client.onProductUpdated(productId);
    } catch (error) {
      return false;
    }
  },

  async productDeleted(productId: string) {
    try {
      const client = getSearchWebhookClient();
      return await client.onProductDeleted(productId);
    } catch (error) {
      return false;
    }
  },

  /**
   * Admin operations
   */
  async reindexAll(force = false) {
    try {
      const client = getSearchWebhookClient();
      return await client.triggerBulkIndex(force);
    } catch (error) {
      return false;
    }
  },

  /**
   * Health monitoring
   */
  async isHealthy() {
    try {
      const client = getSearchWebhookClient();
      return await client.healthCheck();
    } catch (error) {
      return false;
    }
  },
};