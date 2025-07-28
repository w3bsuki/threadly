'use client';

import type { CartItem } from '@repo/cart';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CheckoutSession, PaymentMethod, ShippingAddress } from '../types';
import { createCheckoutSession, type SHIPPING_RATES } from './utils';

interface CheckoutStore {
  // State
  session: CheckoutSession | null;
  currentStep: 'shipping' | 'payment' | 'review';
  shippingMethod: keyof typeof SHIPPING_RATES;
  savedAddresses: ShippingAddress[];
  isProcessing: boolean;
  error: string | null;

  // Actions
  initializeCheckout: (items: CartItem[]) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  setBillingAddress: (address: ShippingAddress) => void;
  setShippingMethod: (method: keyof typeof SHIPPING_RATES) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNotes: (notes: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
  saveAddress: (address: ShippingAddress) => void;
  setError: (error: string | null) => void;
  setProcessing: (processing: boolean) => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      // Initial state
      session: null,
      currentStep: 'shipping',
      shippingMethod: 'standard',
      savedAddresses: [],
      isProcessing: false,
      error: null,

      // Initialize checkout with cart items
      initializeCheckout: (items: CartItem[]) => {
        if (items.length === 0) {
          set({ error: 'No items in cart' });
          return;
        }

        const session = createCheckoutSession(items, {
          shippingMethod: get().shippingMethod,
        });

        set({
          session,
          currentStep: 'shipping',
          error: null,
        });
      },

      // Set shipping address
      setShippingAddress: (address: ShippingAddress) => {
        set((state) => ({
          session: state.session
            ? { ...state.session, shippingAddress: address }
            : null,
        }));
      },

      // Set billing address
      setBillingAddress: (address: ShippingAddress) => {
        set((state) => ({
          session: state.session
            ? { ...state.session, billingAddress: address }
            : null,
        }));
      },

      // Set shipping method and recalculate totals
      setShippingMethod: (method: keyof typeof SHIPPING_RATES) => {
        set((state) => {
          if (!state.session) return state;

          const updatedSession = createCheckoutSession(
            state.session.items.map(
              (item) =>
                ({
                  productId: item.productId,
                  title: item.title,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  sellerId: item.sellerId,
                  sellerName: item.sellerName,
                  quantity: item.quantity,
                  condition: 'Used', // Default for checkout items
                }) as CartItem
            ),
            { shippingMethod: method }
          );

          return {
            shippingMethod: method,
            session: {
              ...state.session,
              ...updatedSession,
            },
          };
        });
      },

      // Set payment method
      setPaymentMethod: (method: PaymentMethod) => {
        set((state) => ({
          session: state.session
            ? { ...state.session, paymentMethod: method }
            : null,
        }));
      },

      // Set order notes
      setNotes: (notes: string) => {
        set((state) => ({
          session: state.session ? { ...state.session, notes } : null,
        }));
      },

      // Navigate to next step
      nextStep: () => {
        set((state) => {
          const steps: CheckoutStore['currentStep'][] = [
            'shipping',
            'payment',
            'review',
          ];
          const currentIndex = steps.indexOf(state.currentStep);

          if (currentIndex < steps.length - 1) {
            return { currentStep: steps[currentIndex + 1] };
          }

          return state;
        });
      },

      // Navigate to previous step
      previousStep: () => {
        set((state) => {
          const steps: CheckoutStore['currentStep'][] = [
            'shipping',
            'payment',
            'review',
          ];
          const currentIndex = steps.indexOf(state.currentStep);

          if (currentIndex > 0) {
            return { currentStep: steps[currentIndex - 1] };
          }

          return state;
        });
      },

      // Reset checkout state
      reset: () => {
        set({
          session: null,
          currentStep: 'shipping',
          shippingMethod: 'standard',
          isProcessing: false,
          error: null,
        });
      },

      // Save address for future use
      saveAddress: (address: ShippingAddress) => {
        set((state) => ({
          savedAddresses: [...state.savedAddresses, address],
        }));
      },

      // Set error message
      setError: (error: string | null) => {
        set({ error });
      },

      // Set processing state
      setProcessing: (processing: boolean) => {
        set({ isProcessing: processing });
      },
    }),
    {
      name: 'threadly-checkout',
      partialize: (state) => ({
        savedAddresses: state.savedAddresses,
        shippingMethod: state.shippingMethod,
      }),
    }
  )
);
