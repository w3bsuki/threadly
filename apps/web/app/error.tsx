'use client';

import { Button } from '@repo/design-system/components';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="max-w-md w-full text-center px-6">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground mt-2">
            We encountered an unexpected error. Please try again or contact support if the problem persists.
          </p>
          
          {error.digest && (
            <p className="text-sm text-muted-foreground mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} variant="default" className="inline-flex items-center gap-2">
              <RefreshCw size={16} />
              Try Again
            </Button>
            <Button asChild variant="outline" className="inline-flex items-center gap-2">
              <Link href="/">
                <Home size={16} />
                Go Home
              </Link>
            </Button>
          </div>
          
          <Button onClick={() => window.location.reload()} variant="ghost">
            Reload Page
          </Button>
        </div>
        
        <div className="mt-12 text-sm text-muted-foreground">
          <p>
            If this error persists, please{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              contact our support team
            </Link>
            {' '}with the error ID above.
          </p>
        </div>
      </div>
    </div>
  );
}