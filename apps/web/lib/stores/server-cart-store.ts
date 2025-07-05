'use client';

import { create } from 'zustand';
import { cartService, type CartItem } from '../services/cart-service';
import { toast } from 'sonner';

interface ServerCartState {
  items: CartItem[];
  isLoading: boolean;
  isInitialized: boolean;
  isOpen: boolean;
  
  // Actions
  initCart: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useServerCartStore = create<ServerCartState>((set, get) => ({
  items: [],
  isLoading: false,
  isInitialized: false,
  isOpen: false,

  initCart: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    try {
      const items = await cartService.getCart();
      set({ items, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId: string) => {
    // Check if already in cart
    const exists = get().items.some(item => item.productId === productId);
    if (exists) {
      toast.error('Item already in cart');
      return;
    }

    set({ isLoading: true });
    try {
      const item = await cartService.addToCart(productId);
      if (item) {
        set(state => ({ items: [...state.items, item] }));
        toast.success('Added to cart');
        get().openCart();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (productId: string) => {
    // Optimistically remove from UI
    const previousItems = get().items;
    set(state => ({
      items: state.items.filter(item => item.productId !== productId)
    }));

    try {
      const success = await cartService.removeFromCart(productId);
      if (!success) {
        // Revert on failure
        set({ items: previousItems });
        toast.error('Failed to remove item');
      }
    } catch (error) {
      // Revert on error
      set({ items: previousItems });
      toast.error('Failed to remove item');
    }
  },

  clearCart: async () => {
    const previousItems = get().items;
    set({ items: [], isLoading: true });

    try {
      const success = await cartService.clearCart();
      if (!success) {
        set({ items: previousItems });
        toast.error('Failed to clear cart');
      }
    } catch (error) {
      set({ items: previousItems });
      toast.error('Failed to clear cart');
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: (productId: string, quantity: number) => {
    // For now, we don't support quantity changes
    // This is here for compatibility with the UI
    if (quantity <= 0) {
      get().removeItem(productId);
    }
  },

  toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  getTotalItems: () => get().items.length,
  
  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.price, 0);
  },
}));

// Initialize cart on first load
// Removed auto-init to avoid Clerk provider issues