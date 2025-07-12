'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import the heavy checkout component with loading state
const CheckoutContent = dynamic(
  () => import('./checkout-content.tsx').then(mod => ({ default: mod.CheckoutContent })),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for this component to reduce initial bundle
  }
);

export function DynamicCheckout() {
  return <CheckoutContent />;
}