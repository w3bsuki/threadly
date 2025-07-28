import type { CartItem, CartValidationResult } from './types';

export const validateCart = (items: CartItem[]): CartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const item of items) {
    if (!item.productId) {
      errors.push(`Item missing productId: ${item.title}`);
    }

    if (!item.title) {
      errors.push(`Item missing title: ${item.productId}`);
    }

    if (item.price <= 0) {
      errors.push(`Invalid price for item: ${item.title}`);
    }

    if (item.quantity <= 0) {
      errors.push(`Invalid quantity for item: ${item.title}`);
    }

    if (item.availableQuantity && item.quantity > item.availableQuantity) {
      warnings.push(`Quantity exceeds available stock for: ${item.title}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const calculateItemTotal = (item: CartItem): number => {
  return item.price * item.quantity;
};

export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + calculateItemTotal(item), 0);
};
