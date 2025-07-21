// Error Boundaries for Production-Grade Error Handling
// Comprehensive error boundary system for Threadly marketplace

export { AppErrorBoundary, AppErrorProvider } from './app-error-boundary';
export { PaymentErrorBoundary, PaymentErrorProvider } from './payment-error-boundary';
export { ProductErrorBoundary, ProductErrorProvider } from './product-error-boundary';
export { APIErrorBoundary, APIErrorProvider } from './api-error-boundary';

// Re-export types for convenience
export type { ErrorInfo } from 'react';

// Error boundary utilities
// Note: These are available as named exports above
// Usage: import { AppErrorBoundary, PaymentErrorBoundary } from '@repo/design-system';

// Usage examples:
// 
// 1. App-level error boundary:
// <AppErrorProvider>
//   <YourApp />
// </AppErrorProvider>
//
// 2. Payment flow error boundary:
// <PaymentErrorProvider 
//   productTitle="Vintage Jacket"
//   onRetry={handleRetry}
//   onCancel={handleCancel}
// >
//   <CheckoutForm />
// </PaymentErrorProvider>
//
// 3. Product creation error boundary:
// <ProductErrorProvider 
//   mode="create"
//   onSaveDraft={handleSaveDraft}
//   onCancel={handleCancel}
// >
//   <ProductForm />
// </ProductErrorProvider>
//
// 4. API error boundary:
// <APIErrorProvider 
//   onRetry={refetchData}
//   fallbackTitle="Unable to load products"
// >
//   <ProductList />
// </APIErrorProvider>