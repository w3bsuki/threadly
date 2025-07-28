'use client';

import { useUser } from '@repo/auth/client';
import type { CartItem } from '@repo/validation/schemas';
import { useCallback } from 'react';

// Simplified checkout hook since the new checkout component handles its own state
export function useCheckout() {
  const { user } = useUser();

  const calculateCosts = useCallback(
    (items: CartItem[], shippingMethod = 'standard') => {
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shippingCosts = { standard: 5.99, express: 12.99 };
      const shipping =
        subtotal > 50
          ? 0
          : shippingCosts[shippingMethod as keyof typeof shippingCosts] || 5.99;
      const tax = Math.round(subtotal * 0.08); // 8% tax
      const total = subtotal + shipping + tax;

      return { subtotal, shipping, tax, total };
    },
    []
  );

  return {
    calculateCosts,
    isAuthenticated: !!user,
    isLoading: false,
    shippingMethod: 'standard',
    setCartItems: () => {},
    updateCheckoutData: () => {},
    processCheckout: async () => ({
      success: false,
      error: 'Use the new checkout component',
    }),
  };
}
