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
  useEffect(() => {}, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="w-full max-w-md px-6 text-center">
        <div className="mb-8">
          <div className="mb-4 flex justify-center">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="font-semibold text-3xl text-foreground">
            Something went wrong
          </h1>
          <p className="mt-2 text-muted-foreground">
            We encountered an unexpected error. Please try again or contact
            support if the problem persists.
          </p>

          {error.digest && (
            <p className="mt-2 text-muted-foreground text-sm">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              className="inline-flex items-center gap-2"
              onClick={reset}
              variant="default"
            >
              <RefreshCw size={16} />
              Try Again
            </Button>
            <Button
              asChild
              className="inline-flex items-center gap-2"
              variant="outline"
            >
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

        <div className="mt-12 text-muted-foreground text-sm">
          <p>
            If this error persists, please{' '}
            <Link className="text-blue-600 hover:underline" href="/contact">
              contact our support team
            </Link>{' '}
            with the error ID above.
          </p>
        </div>
      </div>
    </div>
  );
}
