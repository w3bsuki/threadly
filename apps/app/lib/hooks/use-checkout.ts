'use client';

import { useCallback } from 'react';
import { useUser } from '@repo/auth/client';
import { 
  useCheckoutStore,
  calculateShipping,
  calculateTax,
  calculateTotal,
  type CheckoutFormData
} from '@repo/commerce';
import { toast } from '@repo/design-system';

export function useCheckout() {
  const { user } = useUser();
  const checkoutStore = useCheckoutStore();

  const calculateCosts = useCallback(() => {
    const subtotal = checkoutStore.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = calculateShipping(
      checkoutStore.shippingAddress,
      checkoutStore.shippingMethod,
      subtotal
    );
    const tax = calculateTax(subtotal, checkoutStore.shippingAddress);
    const total = calculateTotal(subtotal, shipping, tax);

    return { subtotal, shipping, tax, total };
  }, [checkoutStore.cartItems, checkoutStore.shippingAddress, checkoutStore.shippingMethod]);

  const updateCheckoutData = useCallback((data: Partial<CheckoutFormData>) => {
    if (data.shippingAddress) {
      checkoutStore.setShippingAddress(data.shippingAddress);
    }
    if (data.billingAddress) {
      checkoutStore.setBillingAddress(data.billingAddress);
    }
    if (data.paymentMethod) {
      checkoutStore.setPaymentMethod(data.paymentMethod);
    }
    if (data.shippingMethod) {
      checkoutStore.setShippingMethod(data.shippingMethod);
    }
  }, [checkoutStore]);

  const processCheckout = useCallback(async () => {
    try {
      checkoutStore.setLoading(true);
      
      // Validate checkout data
      if (!checkoutStore.shippingAddress || !checkoutStore.paymentMethod) {
        throw new Error('Please complete all required fields');
      }

      // Here you would integrate with your payment processor
      const costs = calculateCosts();
      
      // Create order through API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutStore.cartItems,
          shippingAddress: checkoutStore.shippingAddress,
          billingAddress: checkoutStore.billingAddress || checkoutStore.shippingAddress,
          paymentMethod: checkoutStore.paymentMethod,
          shippingMethod: checkoutStore.shippingMethod,
          costs,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      
      // Clear checkout state
      checkoutStore.clearCheckout();
      
      return { success: true, orderId: order.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      checkoutStore.setLoading(false);
    }
  }, [checkoutStore, calculateCosts, user]);

  return {
    ...checkoutStore,
    calculateCosts,
    updateCheckoutData,
    processCheckout,
    isAuthenticated: !!user,
  };
}