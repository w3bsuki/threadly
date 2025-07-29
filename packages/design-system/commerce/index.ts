// Commerce package main exports

// Export all modules (avoiding conflicts)
export * from './cart';
export { useCheckout } from './checkout/hooks';
export {
  type Address,
  addressSchema,
  type CheckoutFormData,
  type CompleteCheckoutFormData,
  type CreateOrderData,
  checkoutFormSchema,
  completeCheckoutFormSchema,
  createOrderSchema,
  paymentMethodSchema,
} from './checkout/schemas';
export * from './checkout/store';
// Export from checkout but exclude conflicting PaymentMethod type
export * from './checkout/utils';
// Export product components
export * from './components/products';
// Export all hooks from central location
export * from './hooks';
export * from './orders';
export * from './products';
// Export all types
export * from './types';
export {
  formatCurrency,
  getCurrencyInfo,
  isSupportedCurrency,
  SUPPORTED_CURRENCIES,
} from './utils/currency';
export { formatPrice as formatPriceUtility } from './utils/price';
// Utils exports (excluding formatPrice to avoid conflicts)
export {
  validateOrder,
  validateProductListing,
  validateProductPrice,
  validateSellerData,
} from './utils/validation';

// Version info
export const COMMERCE_VERSION = '1.0.0';
