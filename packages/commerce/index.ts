// Commerce package main exports

// Export all types
export * from './types';

// Export all modules (avoiding conflicts)
export * from './cart';
// Export from checkout but exclude conflicting PaymentMethod type
export * from './checkout/utils';
export * from './checkout/store';
export { useCheckout } from './checkout/hooks';
export { 
  checkoutFormSchema,
  addressSchema,
  paymentMethodSchema,
  createOrderSchema,
  type Address,
  type CheckoutFormData,
  type CreateOrderData
} from './checkout/schemas';
export * from './orders';
export * from './products';

// Utils exports (excluding formatPrice to avoid conflicts)
export { validateProductPrice, validateProductListing, validateOrder, validateSellerData } from './utils/validation';
export { formatCurrency, getCurrencyInfo, isSupportedCurrency, SUPPORTED_CURRENCIES } from './utils/currency';
export { formatPrice as formatPriceUtility } from './utils/price';

// Export all hooks from central location
export * from './hooks';

// Version info
export const COMMERCE_VERSION = '1.0.0';