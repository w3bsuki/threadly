'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartState, CartItem, CartConfig } from './types';

const STORAGE_KEY = 'threadly-cart-unified';
const BROADCAST_CHANNEL = 'threadly-cart-sync';

export const createCartStore = (config?: CartConfig) => {
  const { 
    storageKey = STORAGE_KEY,
    apiEndpoint = '/api/cart',
    autoSync = false,
    enableBroadcast = true 
  } = config || {};

  return create<CartState>()(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false,
        lastSyncTimestamp: 0,

        addItem: (newItem) => {
          const existingItem = get().items.find(item => item.productId === newItem.productId);
          
          if (existingItem) {
            // If item already exists, increase quantity
            const newQuantity = newItem.availableQuantity 
              ? Math.min(existingItem.quantity + 1, newItem.availableQuantity)
              : existingItem.quantity + 1;
              
            set(state => ({
              items: state.items.map(item =>
                item.productId === newItem.productId
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
              lastSyncTimestamp: Date.now()
            }));
          } else {
            // Add new item
            const cartItem: CartItem = {
              ...newItem,
              id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              quantity: 1,
            };
            
            set(state => ({
              items: [...state.items, cartItem],
              lastSyncTimestamp: Date.now()
            }));
          }
          
          // Broadcast change to other tabs/apps
          if (enableBroadcast) {
            get().broadcastChange?.();
          }
          
          // Auto-sync if enabled
          if (autoSync && get().syncWithServer) {
            get().syncWithServer!();
          }
        },

        removeItem: (productId) => {
          set(state => ({
            items: state.items.filter(item => item.productId !== productId),
            lastSyncTimestamp: Date.now()
          }));
          
          if (enableBroadcast) {
            get().broadcastChange?.();
          }
          
          if (autoSync && get().syncWithServer) {
            get().syncWithServer!();
          }
        },

        updateQuantity: (productId, quantity) => {
          if (quantity <= 0) {
            get().removeItem(productId);
            return;
          }

          set(state => ({
            items: state.items.map(item => {
              if (item.productId === productId) {
                const newQuantity = item.availableQuantity 
                  ? Math.min(quantity, item.availableQuantity)
                  : quantity;
                return { ...item, quantity: newQuantity };
              }
              return item;
            }),
            lastSyncTimestamp: Date.now()
          }));
          
          if (enableBroadcast) {
            get().broadcastChange?.();
          }
          
          if (autoSync && get().syncWithServer) {
            get().syncWithServer!();
          }
        },

        clearCart: () => {
          set({ items: [], lastSyncTimestamp: Date.now() });
          
          if (enableBroadcast) {
            get().broadcastChange?.();
          }
          
          if (autoSync && get().syncWithServer) {
            get().syncWithServer!();
          }
        },

        toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
        closeCart: () => set({ isOpen: false }),
        openCart: () => set({ isOpen: true }),

        // Sync methods (optional, can be added later)
        syncWithServer: async () => {
          try {
            const response = await fetch(apiEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: get().items,
                timestamp: get().lastSyncTimestamp
              })
            });
            
            if (response.ok) {
              const serverState = await response.json();
              if (serverState.timestamp > get().lastSyncTimestamp) {
                set({
                  items: serverState.items,
                  lastSyncTimestamp: serverState.timestamp
                });
              }
            }
          } catch (error) {
          }
        },

        enableAutoSync: () => {
          // Set up periodic sync
          const interval = setInterval(() => {
            get().syncWithServer?.();
          }, 30000); // Sync every 30 seconds
          
          // Return cleanup function
          return () => clearInterval(interval);
        },

        // Broadcast changes to other tabs/apps
        broadcastChange: () => {
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            try {
              const channel = new BroadcastChannel(BROADCAST_CHANNEL);
              channel.postMessage({ 
                type: 'CART_UPDATED', 
                items: get().items,
                timestamp: get().lastSyncTimestamp
              });
              channel.close();
            } catch (error) {
            }
          }
        },

        // Listen for changes from other tabs/apps
        listenForChanges: () => {
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            try {
              const channel = new BroadcastChannel(BROADCAST_CHANNEL);
              channel.onmessage = (event) => {
                if (event.data.type === 'CART_UPDATED') {
                  // Only update if the external change is newer
                  if (event.data.timestamp > get().lastSyncTimestamp) {
                    set({ 
                      items: event.data.items,
                      lastSyncTimestamp: event.data.timestamp 
                    });
                  }
                }
              };
              return () => channel.close();
            } catch (error) {
              return () => {};
            }
          }
          return () => {};
        },

        // Getters
        getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
        getTotalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
        getItem: (productId) => get().items.find(item => item.productId === productId),
        isInCart: (productId) => get().items.some(item => item.productId === productId),
        getItemCount: (productId) => {
          const item = get().items.find(item => item.productId === productId);
          return item ? item.quantity : 0;
        },
      }),
      {
        name: storageKey,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ 
          items: state.items,
          lastSyncTimestamp: state.lastSyncTimestamp
        }),
        onRehydrateStorage: () => (state) => {
          // Set up cross-tab synchronization after rehydration
          if (state && enableBroadcast) {
            state.listenForChanges?.();
          }
        },
      }
    )
  );
};