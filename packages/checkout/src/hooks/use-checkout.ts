'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, type CheckoutFormData, type CartItem } from '../types';
import { calculateOrderCosts } from '../utils/calculate-costs';

interface UseCheckoutOptions {
  defaultValues?: Partial<CheckoutFormData>;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export function useCheckout(items: CartItem[], options?: UseCheckoutOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      shippingMethod: 'standard',
      notes: '',
      saveAddress: false,
      ...options?.defaultValues,
    },
  });

  const selectedShipping = form.watch('shippingMethod');
  const costs = calculateOrderCosts(items, selectedShipping);

  const createPaymentIntent = useCallback(async () => {
    if (items.length === 0) {
      return null;
    }

    try {
      const response = await fetch('/api/checkout/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId || item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          costs: {
            subtotal: costs.subtotal,
            shipping: costs.shippingCost,
            tax: costs.tax,
            total: costs.total,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize checkout';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      return null;
    }
  }, [items, costs, options]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    form,
    costs,
    isProcessing,
    setIsProcessing,
    error,
    setError,
    createPaymentIntent,
    resetError,
  };
}