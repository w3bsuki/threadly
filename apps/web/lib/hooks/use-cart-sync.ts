'use client';

import { useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useCartStore } from '@repo/commerce';
import { 
  getCartItems,
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateCartQuantity as updateCartQuantityAction,
  clearCart as clearCartAction,
  syncCartWithDatabase
} from '../../app/[locale]/cart/actions/cart-actions';
import { toast } from '@repo/design-system';

export function useCartSync() {
  const { user, isLoaded } = useUser();
  const {
    items,
    addItem: originalAddItem,
    removeItem: originalRemoveItem,
    updateQuantity: originalUpdateQuantity,
    clearCart: originalClearCart,
    getTotalPrice,
    getTotalItems,
    ...rest
  } = useCartStore();

  const handleError = useCallback((error: string) => {
    console.error('Cart sync error:', error);
    toast.error(error);
  }, []);

  const syncFromDatabase = useCallback(async () => {
    if (!user) return;

    try {
      const result = await getCartItems();
      if (result.error) {
        handleError(result.error);
        return;
      }

      if (result.items) {
        useCartStore.setState({
          items: result.items,
          lastSyncTimestamp: Date.now(),
        });
      }
    } catch (error) {
      handleError('Failed to sync cart from database');
    }
  }, [user, handleError]);

  const syncToDatabase = useCallback(async () => {
    if (!user) return;

    try {
      const result = await syncCartWithDatabase(items);
      if (result.error) {
        handleError(result.error);
        return;
      }

      if (result.items) {
        useCartStore.setState({
          items: result.items,
          lastSyncTimestamp: Date.now(),
        });
      }
    } catch (error) {
      handleError('Failed to sync cart to database');
    }
  }, [user, items, handleError]);

  const enhancedAddItem = useCallback(async (item: Parameters<typeof originalAddItem>[0]) => {
    originalAddItem(item);

    if (user) {
      try {
        const result = await addToCartAction({
          productId: item.productId,
          quantity: 1,
        });

        if (result.error) {
          originalRemoveItem(item.productId);
          handleError(result.error);
          return;
        }

        if (result.cartItem) {
          useCartStore.setState((state) => ({
            items: state.items.map((cartItem) =>
              cartItem.productId === item.productId ? result.cartItem! : cartItem
            ),
            lastSyncTimestamp: Date.now(),
          }));
        }
      } catch (error) {
        originalRemoveItem(item.productId);
        handleError('Failed to add item to cart');
      }
    }
  }, [user, originalAddItem, originalRemoveItem, handleError]);

  const enhancedRemoveItem = useCallback(async (productId: string) => {
    const originalItems = items;
    originalRemoveItem(productId);

    if (user) {
      try {
        const result = await removeFromCartAction(productId);
        if (result.error) {
          useCartStore.setState({ items: originalItems });
          handleError(result.error);
        }
      } catch (error) {
        useCartStore.setState({ items: originalItems });
        handleError('Failed to remove item from cart');
      }
    }
  }, [user, items, originalRemoveItem, handleError]);

  const enhancedUpdateQuantity = useCallback(async (productId: string, quantity: number) => {
    const originalItems = items;
    originalUpdateQuantity(productId, quantity);

    if (user) {
      try {
        const result = await updateCartQuantityAction({ productId, quantity });
        if (result.error) {
          useCartStore.setState({ items: originalItems });
          handleError(result.error);
        }
      } catch (error) {
        useCartStore.setState({ items: originalItems });
        handleError('Failed to update quantity');
      }
    }
  }, [user, items, originalUpdateQuantity, handleError]);

  const enhancedClearCart = useCallback(async () => {
    const originalItems = items;
    originalClearCart();

    if (user) {
      try {
        const result = await clearCartAction();
        if (result.error) {
          useCartStore.setState({ items: originalItems });
          handleError(result.error);
        }
      } catch (error) {
        useCartStore.setState({ items: originalItems });
        handleError('Failed to clear cart');
      }
    }
  }, [user, items, originalClearCart, handleError]);

  // Sync cart when user logs in
  useEffect(() => {
    if (isLoaded && user) {
      const hasLocalCart = items.length > 0;
      
      if (hasLocalCart) {
        syncToDatabase();
      } else {
        syncFromDatabase();
      }
    }
  }, [isLoaded, user, syncFromDatabase, syncToDatabase]);

  // Set up cross-tab synchronization
  useEffect(() => {
    if (user) {
      const cleanup = rest.listenForChanges?.();
      return cleanup;
    }
  }, [user, rest.listenForChanges]);

  return {
    items,
    addItem: enhancedAddItem,
    removeItem: enhancedRemoveItem,
    updateQuantity: enhancedUpdateQuantity,
    clearCart: enhancedClearCart,
    syncFromDatabase,
    syncToDatabase,
    getTotalPrice,
    getTotalItems,
    ...rest,
  };
}