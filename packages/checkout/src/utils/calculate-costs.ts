import type { CartItem, OrderCosts, ShippingOption } from '../types';

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    price: 5.99,
    estimatedDays: '5-7 business days',
    freeThreshold: 50,
  },
  {
    id: 'express',
    name: 'Express Shipping',
    price: 12.99,
    estimatedDays: '2-3 business days',
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    price: 39.99,
    estimatedDays: 'Next business day',
  },
];

export function calculateOrderCosts(
  items: CartItem[],
  shippingMethod: 'standard' | 'express' | 'overnight',
  taxRate: number = 0.08
): OrderCosts {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const selectedShipping = SHIPPING_OPTIONS.find(
    (option) => option.id === shippingMethod
  );

  let shippingCost = selectedShipping?.price || 0;

  // Apply free shipping threshold if applicable
  if (selectedShipping?.freeThreshold && subtotal >= selectedShipping.freeThreshold) {
    shippingCost = 0;
  }

  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + shippingCost + tax;

  return {
    subtotal,
    shippingCost,
    tax,
    total,
  };
}