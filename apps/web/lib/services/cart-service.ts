import { env } from '@/env';

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  imageUrl: string;
  size: string;
  condition: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  status: string;
}

export interface CartResponse {
  items: CartItem[];
}

class CartService {
  private baseUrl = env.NEXT_PUBLIC_API_URL || '';

  async getCart(): Promise<CartItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          return []; // Return empty cart for unauthenticated users
        }
        throw new Error('Failed to fetch cart');
      }

      const data: CartResponse = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return [];
    }
  }

  async addToCart(productId: string): Promise<CartItem | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add to cart');
      }

      const data = await response.json();
      return data.item;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async removeFromCart(productId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from cart');
      }

      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  async clearCart(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }

  async syncLocalCart(localItems: Array<{ productId: string }>): Promise<void> {
    // Sync local cart items to server when user logs in
    for (const item of localItems) {
      try {
        await this.addToCart(item.productId);
      } catch (error) {
        // Continue with other items if one fails
        console.error(`Failed to sync item ${item.productId}:`, error);
      }
    }
  }
}

export const cartService = new CartService();