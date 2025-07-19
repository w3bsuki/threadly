import type { Metadata } from 'next';
import { DynamicCheckout } from './components/dynamic-checkout';

export const metadata: Metadata = {
  title: 'Checkout - Threadly',
  description: 'Complete your purchase on Threadly marketplace',
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-muted">
      <DynamicCheckout />
    </div>
  );
}
