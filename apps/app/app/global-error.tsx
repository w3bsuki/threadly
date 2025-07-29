'use client';

import { Button } from '@repo/ui/components';
import { fonts } from '@repo/ui/lib/fonts';
import { captureException } from '@sentry/nextjs';
import { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Global error boundary for Seller Dashboard (Next.js 15 App Router)
 * Captures React rendering errors and reports them to Sentry
 *
 * This component follows Next.js 15 best practices for error handling
 * and provides seller-focused error recovery options.
 */
export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps): React.JSX.Element {
  useEffect(() => {
    // Report the error to Sentry with seller-specific context
    captureException(error, {
      tags: {
        component: 'GlobalError',
        app: 'seller-dashboard',
        errorBoundary: true,
      },
      extra: {
        digest: error.digest,
        timestamp: new Date().toISOString(),
        userAgent:
          typeof window !== 'undefined'
            ? window.navigator.userAgent
            : undefined,
      },
    });
  }, [error]);

  return (
    <html className={fonts} lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
          <div className="w-full max-w-md space-y-6 text-center">
            {/* Error Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--radius-full)] bg-red-100">
              <svg
                aria-hidden="true"
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="font-bold text-2xl text-foreground">
                Dashboard Error
              </h1>
              <p className="text-muted-foreground">
                We've encountered an issue with your seller dashboard. Our
                technical team has been notified and is working to resolve this
                immediately.
              </p>
            </div>

            {/* Error Details */}
            {error.digest && (
              <div className="rounded-[var(--radius-lg)] bg-secondary p-3">
                <p className="text-muted-foreground text-sm">
                  <strong>Error ID:</strong> {error.digest}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  Please include this ID if contacting support.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full" onClick={reset} size="lg">
                Retry dashboard
              </Button>

              <Button
                className="w-full"
                onClick={() => (window.location.href = '/selling/dashboard')}
                size="lg"
                variant="outline"
              >
                Return to dashboard
              </Button>

              <Button
                className="w-full"
                onClick={() => (window.location.href = '/profile')}
                size="sm"
                variant="ghost"
              >
                Go to profile settings
              </Button>
            </div>

            {/* Support Information */}
            <div className="rounded-[var(--radius-lg)] bg-blue-50 p-4 text-sm">
              <p className="text-blue-800">
                <strong>Need immediate help?</strong>
              </p>
              <p className="text-blue-700">
                Contact our seller support team if this issue persists or
                affects your business operations.
              </p>
            </div>

            {/* Error Details for Development */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-muted-foreground text-sm">
                  Error details (development only)
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-secondary p-3 text-secondary-foreground text-xs">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
