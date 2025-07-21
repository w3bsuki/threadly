'use client';

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the heavy checkout component with loading state
const CheckoutContent = dynamic(
  () =>
    import('./checkout-content').then((mod) => ({
      default: mod.CheckoutContent,
    })),
  {
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for this component to reduce initial bundle
  }
);

export function DynamicCheckout() {
  return <CheckoutContent />;
}
