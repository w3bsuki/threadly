'use client';

import { useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@repo/design-system/components/ui/alert';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    if (error) {
      console.error('Product page error:', error);
    }
  }, [error]);

  return (
    <div className="container mx-auto min-h-[600px] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Product Not Available</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm mb-2">
              {error.message === 'Product not found' 
                ? 'This product could not be found. It may have been removed or is temporarily unavailable.'
                : 'We encountered an error loading this product. Please try again.'}
            </p>
            <p className="text-xs text-muted-foreground">
              If the problem persists, please contact support.
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
          
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          
          <Link href="/products" className="w-full sm:w-auto">
            <Button variant="default" size="sm" className="w-full">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}