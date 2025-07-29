'use client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@repo/ui/components/ui/alert';
import { Button } from '@repo/ui/components/ui/button';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();


  return (
    <div className="container mx-auto flex min-h-[600px] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert className="border-destructive/20" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Product Not Available</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2 text-sm">
              {error.message === 'Product not found'
                ? 'This product could not be found. It may have been removed or is temporarily unavailable.'
                : 'We encountered an error loading this product. Please try again.'}
            </p>
            <p className="text-muted-foreground text-xs">
              If the problem persists, please contact support.
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

          <Button
            className="w-full sm:w-auto"
            onClick={() => router.back()}
            size="sm"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Link className="w-full sm:w-auto" href="/products">
            <Button className="w-full" size="sm" variant="default">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
