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
    if (!checkoutStore.session) {
      return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
    }
    
    const subtotal = checkoutStore.session.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = calculateShipping(
      checkoutStore.session.shippingAddress || undefined,
      checkoutStore.shippingMethod,
      subtotal
    );
    const tax = calculateTax(subtotal, checkoutStore.session.shippingAddress || undefined);
    const total = calculateTotal(subtotal, shipping, tax);

    return { subtotal, shipping, tax, total };
  }, [checkoutStore.session, checkoutStore.shippingMethod]);

  const updateCheckoutData = useCallback((data: Partial<CheckoutFormData>) => {
    // Convert flat form data to address object for shipping
    if (data.address || data.city || data.state || data.zipCode || data.country) {
      const shippingAddress = {
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        street: data.address || '',
        apartment: '',
        city: data.city || '',
        state: data.state || '',
        postalCode: data.zipCode || '',
        country: data.country || 'US',
        phone: data.phone,
      };
      checkoutStore.setShippingAddress(shippingAddress);
    }
    
    if (data.shippingMethod) {
      checkoutStore.setShippingMethod(data.shippingMethod);
    }
  }, [checkoutStore]);

  const processCheckout = useCallback(async () => {
    try {
      checkoutStore.setProcessing(true);
      
      // Validate checkout data
      if (!checkoutStore.session || !checkoutStore.session.shippingAddress || !checkoutStore.session.paymentMethod) {
        throw new Error('Please complete all required fields');
      }

      // Here you would integrate with your payment processor
      const costs = calculateCosts();
      
      // Create order through API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutStore.session.items,
          shippingAddress: checkoutStore.session.shippingAddress,
          billingAddress: checkoutStore.session.billingAddress || checkoutStore.session.shippingAddress,
          paymentMethod: checkoutStore.session.paymentMethod,
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
      checkoutStore.reset();
      
      return { success: true, orderId: order.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      checkoutStore.setProcessing(false);
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