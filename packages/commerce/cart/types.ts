// Re-export cart types from @repo/cart
export type { CartConfig, CartItem, CartState } from '@repo/cart';

// Additional commerce-specific cart types
export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export interface CartValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
