/**
 * Cart Functionality Tests - 90% Coverage Required
 * 
 * This test suite covers all critical cart functionality
 * including add, remove, persistence, state management, and sync.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@repo/testing';
import { createCartStore } from '@repo/cart/store';
import type { CartItem, CartState, CartConfig } from '@repo/cart/types';
import { cleanup } from '@repo/testing';

// Mock browser APIs
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

const mockBroadcastChannel = {
  postMessage: vi.fn(),
  close: vi.fn(),
  onmessage: null as any,
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(window, 'BroadcastChannel', {
  value: vi.fn(() => mockBroadcastChannel),
  writable: true,
});

// Mock fetch for server sync
global.fetch = vi.fn();

describe('Cart Functionality Tests', () => {
  let useCart: ReturnType<typeof createCartStore>;
  let mockCartItem: CartItem;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create fresh cart store for each test
    useCart = createCartStore();
    
    mockCartItem = {
      productId: 'prod_1',
      title: 'iPhone 13 Pro',
      price: 799.99,
      imageUrl: 'https://utfs.io/image1.jpg',
      sellerId: 'user_1',
      sellerName: 'John Doe',
      condition: 'VERY_GOOD',
      size: '128GB',
      color: 'Blue',
      quantity: 1,
      availableQuantity: 5,
    };
  });

  afterEach(() => {
    cleanup();
  });

  describe('Add Item to Cart', () => {
    it('should add new item to empty cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].productId).toBe('prod_1');
      expect(result.current.items[0].quantity).toBe(1);
      expect(result.current.items[0].id).toBeDefined();
      expect(result.current.getTotalItems()).toBe(1);
      expect(result.current.getTotalPrice()).toBe(799.99);
    });

    it('should increase quantity for existing item', () => {
      const { result } = renderHook(() => useCart());

      // Add item first time
      act(() => {
        result.current.addItem(mockCartItem);
      });

      // Add same item again
      act(() => {
        result.current.addItem(mockCartItem);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.getTotalItems()).toBe(2);
      expect(result.current.getTotalPrice()).toBe(1599.98);
    });

    it('should respect available quantity limits', () => {
      const { result } = renderHook(() => useCart());

      const limitedItem = {
        ...mockCartItem,
        availableQuantity: 2,
      };

      // Add item multiple times
      act(() => {
        result.current.addItem(limitedItem);
      });
      act(() => {
        result.current.addItem(limitedItem);
      });
      act(() => {
        result.current.addItem(limitedItem); // Should not exceed limit
      });

      expect(result.current.items[0].quantity).toBe(2); // Capped at available quantity
      expect(result.current.getTotalItems()).toBe(2);
    });

    it('should add multiple different items', () => {
      const { result } = renderHook(() => useCart());

      const secondItem = {
        ...mockCartItem,
        productId: 'prod_2',
        title: 'Nike Shoes',
        price: 129.99,
      };

      act(() => {
        result.current.addItem(mockCartItem);
        result.current.addItem(secondItem);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.getTotalItems()).toBe(2);
      expect(result.current.getTotalPrice()).toBe(929.98); // 799.99 + 129.99
    });

    it('should generate unique cart IDs', () => {
      const { result } = renderHook(() => useCart());

      const secondItem = {
        ...mockCartItem,
        productId: 'prod_2',
        title: 'Different Product',
      };

      act(() => {
        result.current.addItem(mockCartItem);
        result.current.addItem(secondItem);
      });

      const ids = result.current.items.map(item => item.id);
      expect(new Set(ids).size).toBe(2); // All IDs should be unique
      expect(ids.every(id => id && id.startsWith('cart-'))).toBe(true);
    });
  });

  describe('Remove Item from Cart', () => {
    it('should remove item by product ID', () => {
      const { result } = renderHook(() => useCart());

      // Add item first
      act(() => {
        result.current.addItem(mockCartItem);
      });

      expect(result.current.items).toHaveLength(1);

      // Remove item
      act(() => {
        result.current.removeItem('prod_1');
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.getTotalItems()).toBe(0);
      expect(result.current.getTotalPrice()).toBe(0);
    });

    it('should remove only specified item from multi-item cart', () => {
      const { result } = renderHook(() => useCart());

      const secondItem = {
        ...mockCartItem,
        productId: 'prod_2',
        title: 'Nike Shoes',
        price: 129.99,
      };

      // Add multiple items
      act(() => {
        result.current.addItem(mockCartItem);
        result.current.addItem(secondItem);
      });

      expect(result.current.items).toHaveLength(2);

      // Remove one item
      act(() => {
        result.current.removeItem('prod_1');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].productId).toBe('prod_2');
      expect(result.current.getTotalPrice()).toBe(129.99);
    });

    it('should handle removing non-existent item gracefully', () => {
      const { result } = renderHook(() => useCart());

      // Add item
      act(() => {
        result.current.addItem(mockCartItem);
      });

      const originalLength = result.current.items.length;

      // Try to remove non-existent item
      act(() => {
        result.current.removeItem('prod_nonexistent');
      });

      expect(result.current.items.length).toBe(originalLength);
    });
  });

  describe('Update Item Quantity', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useCart());
      
      // Add item first
      act(() => {
        result.current.addItem(mockCartItem);
      });
    });

    it('should update item quantity', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      act(() => {
        result.current.updateQuantity('prod_1', 3);
      });

      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.getTotalItems()).toBe(3);
      expect(result.current.getTotalPrice()).toBe(2399.97); // 799.99 * 3
    });

    it('should respect available quantity limits when updating', () => {
      const { result } = renderHook(() => useCart());

      const limitedItem = {
        ...mockCartItem,
        availableQuantity: 2,
      };

      act(() => {
        result.current.addItem(limitedItem);
      });

      act(() => {
        result.current.updateQuantity('prod_1', 5); // Try to set higher than available
      });

      expect(result.current.items[0].quantity).toBe(2); // Capped at available quantity
    });

    it('should remove item when quantity is set to 0', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.updateQuantity('prod_1', 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should remove item when quantity is negative', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.updateQuantity('prod_1', -1);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should handle updating non-existent item gracefully', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      const originalLength = result.current.items.length;

      act(() => {
        result.current.updateQuantity('prod_nonexistent', 5);
      });

      expect(result.current.items.length).toBe(originalLength);
    });
  });

  describe('Clear Cart', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCart());

      const secondItem = {
        ...mockCartItem,
        productId: 'prod_2',
        title: 'Nike Shoes',
      };

      // Add multiple items
      act(() => {
        result.current.addItem(mockCartItem);
        result.current.addItem(secondItem);
      });

      expect(result.current.items).toHaveLength(2);

      // Clear cart
      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.getTotalItems()).toBe(0);
      expect(result.current.getTotalPrice()).toBe(0);
    });

    it('should update last sync timestamp when clearing', () => {
      const { result } = renderHook(() => useCart());

      const originalTimestamp = result.current.lastSyncTimestamp;

      act(() => {
        result.current.addItem(mockCartItem);
      });

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.lastSyncTimestamp).toBeGreaterThan(originalTimestamp);
    });
  });

  describe('Cart UI State', () => {
    it('should toggle cart open/closed state', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.toggleCart();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggleCart();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('should open cart explicitly', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.openCart();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should close cart explicitly', () => {
      const { result } = renderHook(() => useCart());

      // Open cart first
      act(() => {
        result.current.openCart();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeCart();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('Cart Getters and Utilities', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useCart());
      
      const secondItem = {
        ...mockCartItem,
        productId: 'prod_2',
        title: 'Nike Shoes',
        price: 129.99,
        quantity: 2,
      };

      // Add multiple items
      act(() => {
        result.current.addItem(mockCartItem);
        result.current.addItem(secondItem);
        result.current.updateQuantity('prod_1', 3);
      });
    });

    it('should calculate total items correctly', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
        result.current.addItem({ ...mockCartItem, productId: 'prod_2' });
        result.current.updateQuantity('prod_1', 3);
      });

      expect(result.current.getTotalItems()).toBe(4); // 3 + 1
    });

    it('should calculate total price correctly', () => {
      const { result } = renderHook(() => useCart());

      const secondItem = {
        ...mockCartItem,
        productId: 'prod_2',
        price: 100,
      };

      act(() => {
        result.current.addItem(mockCartItem); // 799.99
        result.current.addItem(secondItem); // 100
        result.current.updateQuantity('prod_1', 2); // 799.99 * 2 = 1599.98
      });

      expect(result.current.getTotalPrice()).toBe(1699.98); // 1599.98 + 100
    });

    it('should get specific item by product ID', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      const item = result.current.getItem('prod_1');
      expect(item).toBeDefined();
      expect(item?.productId).toBe('prod_1');
      expect(item?.title).toBe('iPhone 13 Pro');

      const nonExistentItem = result.current.getItem('prod_nonexistent');
      expect(nonExistentItem).toBeUndefined();
    });

    it('should check if item is in cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      expect(result.current.isInCart('prod_1')).toBe(true);
      expect(result.current.isInCart('prod_nonexistent')).toBe(false);
    });

    it('should get item count by product ID', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
        result.current.updateQuantity('prod_1', 3);
      });

      expect(result.current.getItemCount('prod_1')).toBe(3);
      expect(result.current.getItemCount('prod_nonexistent')).toBe(0);
    });
  });

  describe('Local Storage Persistence', () => {
    it('should save cart state to localStorage', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      // localStorage.setItem should have been called
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      
      const calls = vi.mocked(mockLocalStorage.setItem).mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe('threadly-cart-unified');
      
      const savedData = JSON.parse(lastCall[1]);
      expect(savedData.state.items).toHaveLength(1);
      expect(savedData.state.items[0].productId).toBe('prod_1');
    });

    it('should load cart state from localStorage', () => {
      const savedState = {
        state: {
          items: [mockCartItem],
          lastSyncTimestamp: Date.now(),
        },
        version: 0,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedState));

      const { result } = renderHook(() => useCart());

      // Should load persisted state
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].productId).toBe('prod_1');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const { result } = renderHook(() => useCart());

      // Should start with empty cart
      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('Cross-Tab Synchronization', () => {
    it('should broadcast changes to other tabs', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
        type: 'CART_UPDATED',
        items: expect.arrayContaining([
          expect.objectContaining({ productId: 'prod_1' })
        ]),
        timestamp: expect.any(Number),
      });
    });

    it('should listen for changes from other tabs', () => {
      const { result } = renderHook(() => useCart());

      const externalUpdate = {
        type: 'CART_UPDATED',
        items: [{ ...mockCartItem, quantity: 3 }],
        timestamp: Date.now() + 1000, // Newer timestamp
      };

      // Simulate external update
      act(() => {
        if (mockBroadcastChannel.onmessage) {
          mockBroadcastChannel.onmessage({ data: externalUpdate });
        }
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
    });

    it('should ignore older external updates', () => {
      const { result } = renderHook(() => useCart());

      // Add item to establish current timestamp
      act(() => {
        result.current.addItem(mockCartItem);
      });

      const currentTimestamp = result.current.lastSyncTimestamp;

      const externalUpdate = {
        type: 'CART_UPDATED',
        items: [],
        timestamp: currentTimestamp - 1000, // Older timestamp
      };

      // Simulate external update with older timestamp
      act(() => {
        if (mockBroadcastChannel.onmessage) {
          mockBroadcastChannel.onmessage({ data: externalUpdate });
        }
      });

      // Should keep current state
      expect(result.current.items).toHaveLength(1);
    });
  });

  describe('Server Synchronization', () => {
    it('should sync with server when enabled', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          items: [{ ...mockCartItem, quantity: 2 }],
          timestamp: Date.now() + 1000,
        }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      await act(async () => {
        await result.current.syncWithServer?.();
      });

      expect(fetch).toHaveBeenCalledWith('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: result.current.items,
          timestamp: result.current.lastSyncTimestamp,
        }),
      });
    });

    it('should update local state with newer server data', async () => {
      const newerServerData = {
        items: [{ ...mockCartItem, quantity: 5 }],
        timestamp: Date.now() + 1000,
      };

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(newerServerData),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      await act(async () => {
        await result.current.syncWithServer?.();
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.lastSyncTimestamp).toBe(newerServerData.timestamp);
    });

    it('should handle server sync errors gracefully', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      const originalItems = [...result.current.items];

      await act(async () => {
        await result.current.syncWithServer?.();
      });

      // Should keep local state on error
      expect(result.current.items).toEqual(originalItems);
    });
  });

  describe('Auto-Sync Functionality', () => {
    it('should enable auto-sync with interval', () => {
      const { result } = renderHook(() => useCart());

      let cleanup: (() => void) | undefined;

      act(() => {
        cleanup = result.current.enableAutoSync?.();
      });

      expect(cleanup).toBeInstanceOf(Function);

      // Cleanup
      if (cleanup) {
        cleanup();
      }
    });
  });

  describe('Cart Configuration', () => {
    it('should use custom storage key', () => {
      const customConfig: CartConfig = {
        storageKey: 'custom-cart-key',
      };

      const customCartStore = createCartStore(customConfig);
      const { result } = renderHook(() => customCartStore());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      const calls = vi.mocked(mockLocalStorage.setItem).mock.calls;
      const relevantCall = calls.find(call => call[0] === 'custom-cart-key');
      expect(relevantCall).toBeDefined();
    });

    it('should use custom API endpoint for sync', async () => {
      const customConfig: CartConfig = {
        apiEndpoint: '/api/custom-cart',
      };

      const customCartStore = createCartStore(customConfig);
      const { result } = renderHook(() => customCartStore());

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ items: [], timestamp: Date.now() }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      act(() => {
        result.current.addItem(mockCartItem);
      });

      await act(async () => {
        await result.current.syncWithServer?.();
      });

      expect(fetch).toHaveBeenCalledWith('/api/custom-cart', expect.any(Object));
    });

    it('should disable broadcast when configured', () => {
      const customConfig: CartConfig = {
        enableBroadcast: false,
      };

      const customCartStore = createCartStore(customConfig);
      const { result } = renderHook(() => customCartStore());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      // Should not have called broadcast
      expect(mockBroadcastChannel.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle adding item with missing required fields', () => {
      const { result } = renderHook(() => useCart());

      const incompleteItem = {
        productId: 'prod_incomplete',
        title: 'Incomplete Item',
        // Missing price, imageUrl, etc.
      } as any;

      act(() => {
        result.current.addItem(incompleteItem);
      });

      // Should still add item, but with defaults
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].productId).toBe('prod_incomplete');
    });

    it('should handle very large quantities', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
        result.current.updateQuantity('prod_1', 999999);
      });

      expect(result.current.items[0].quantity).toBe(999999);
      expect(result.current.getTotalItems()).toBe(999999);
    });

    it('should handle cart operations when localStorage is unavailable', () => {
      // Simulate localStorage being unavailable
      const originalLocalStorage = window.localStorage;
      delete (window as any).localStorage;

      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      // Should still work in memory
      expect(result.current.items).toHaveLength(1);

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });

    it('should handle BroadcastChannel being unavailable', () => {
      // Simulate BroadcastChannel being unavailable
      const originalBroadcastChannel = window.BroadcastChannel;
      delete (window as any).BroadcastChannel;

      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockCartItem);
      });

      // Should still work without broadcasting
      expect(result.current.items).toHaveLength(1);

      // Restore BroadcastChannel
      Object.defineProperty(window, 'BroadcastChannel', {
        value: originalBroadcastChannel,
        writable: true,
      });
    });
  });
});