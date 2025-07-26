'use client';

import { useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { AlertCircle, RefreshCw, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@repo/design-system/components/ui/alert';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    if (error) {
      console.error('Checkout error:', error);
    }
  }, [error]);

  const isPaymentError = error.message?.toLowerCase().includes('payment') || 
                        error.message?.toLowerCase().includes('stripe');

  return (
    <div className="container mx-auto min-h-[600px] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Checkout Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm mb-2">
              {isPaymentError 
                ? 'We encountered an issue processing your payment. Please check your payment details and try again.'
                : 'There was an error during checkout. Your order has not been placed.'}
            </p>
            <p className="text-xs text-muted-foreground">
              If you continue to experience issues, please contact our support team.
            </p>
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button 
            onClick={reset} 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Link href="/cart" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="default" size="sm" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}