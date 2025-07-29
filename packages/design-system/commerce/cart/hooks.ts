// Re-export cart store hook
export { useCartStore } from '@repo/cart';

// Additional commerce-specific cart hooks
import { useCartStore } from '@repo/cart';
import { useMemo } from 'react';
import type { CartSummary } from './types';

export const useCartSummary = (): CartSummary => {
  const { items, getTotalPrice, getTotalItems } = useCartStore();

  return useMemo(() => {
    const subtotal = getTotalPrice();
    const tax = subtotal * 0.08; // 8% tax rate
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      shipping,
      total,
      itemCount: getTotalItems(),
    };
  }, [items, getTotalPrice, getTotalItems]);
};
