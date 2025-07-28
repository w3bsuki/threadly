'use client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@repo/design-system/components/ui/alert';
import { Button } from '@repo/design-system/components/ui/button';
import { AlertCircle, RefreshCw, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();


  const isPaymentError =
    error.message?.toLowerCase().includes('payment') ||
    error.message?.toLowerCase().includes('stripe');

  return (
    <div className="container mx-auto flex min-h-[600px] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert className="border-destructive/20" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Checkout Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2 text-sm">
              {isPaymentError
                ? 'We encountered an issue processing your payment. Please check your payment details and try again.'
                : 'There was an error during checkout. Your order has not been placed.'}
            </p>
            <p className="text-muted-foreground text-xs">
              If you continue to experience issues, please contact our support
              team.
            </p>
          </AlertDescription>
        </Alert>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button
            className="w-full sm:w-auto"
            onClick={reset}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Link className="w-full sm:w-auto" href="/cart">
            <Button className="w-full" size="sm" variant="outline">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Back to Cart
            </Button>
          </Link>

          <Link className="w-full sm:w-auto" href="/">
            <Button className="w-full" size="sm" variant="default">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
