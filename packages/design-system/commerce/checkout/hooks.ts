'use client';

import { useCartStore } from '../cart';
import { useCallback, useEffect } from 'react';
import type { ShippingAddress } from '../types';
import { useCheckoutStore } from './store';

export function useCheckout() {
  const checkout = useCheckoutStore();
  const cart = useCartStore();

  // Initialize checkout when cart changes
  useEffect(() => {
    if (cart.items.length > 0 && !checkout.session) {
      checkout.initializeCheckout(cart.items);
    }
  }, [cart.items, checkout.session]);

  // Validate current step
  const canProceed = useCallback(() => {
    if (!checkout.session) return false;

    switch (checkout.currentStep) {
      case 'shipping':
        return !!checkout.session.shippingAddress;
      case 'payment':
        return !!checkout.session.paymentMethod;
      case 'review':
        return true;
      default:
        return false;
    }
  }, [checkout.session, checkout.currentStep]);

  // Use billing same as shipping
  const useSameAsShipping = useCallback(
    (same: boolean) => {
      if (same && checkout.session?.shippingAddress) {
        checkout.setBillingAddress(checkout.session.shippingAddress);
      } else {
        checkout.setBillingAddress(undefined as any);
      }
    },
    [checkout.session?.shippingAddress]
  );

  // Complete checkout
  const completeCheckout = useCallback(async () => {
    if (!(checkout.session && canProceed())) {
      checkout.setError('Please complete all required fields');
      return null;
    }

    checkout.setProcessing(true);
    checkout.setError(null);

    try {
      // This would be replaced with actual API call
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkout.session.items,
          shippingAddress: checkout.session.shippingAddress,
          billingAddress:
            checkout.session.billingAddress || checkout.session.shippingAddress,
          paymentMethod: checkout.session.paymentMethod,
          subtotal: checkout.session.subtotal,
          tax: checkout.session.tax,
          shipping: checkout.session.shipping,
          total: checkout.session.total,
          notes: checkout.session.notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();

      // Clear cart and checkout
      cart.clearCart();
      checkout.reset();

      return order;
    } catch (error) {
      checkout.setError(
        error instanceof Error ? error.message : 'Something went wrong'
      );
      return null;
    } finally {
      checkout.setProcessing(false);
    }
  }, [checkout, cart, canProceed]);

  return {
    ...checkout,
    canProceed,
    useSameAsShipping,
    completeCheckout,
    isInitialized: !!checkout.session,
    hasItems: (checkout.session?.items.length ?? 0) > 0,
  };
}
