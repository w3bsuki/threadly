'use client';

import { captureException } from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@repo/design-system/components';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Global error boundary for Next.js 15 App Router
 * Captures React rendering errors and reports them to Sentry
 * 
 * This component follows Next.js 15 best practices for error handling
 * and integrates with our observability infrastructure.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps): JSX.Element {
  useEffect(() => {
    // Report the error to Sentry
    captureException(error, {
      tags: {
        component: 'GlobalError',
        errorBoundary: true,
      },
      extra: {
        digest: error.digest,
        timestamp: new Date().toISOString(),
      },
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md space-y-6 text-center">
            {/* Error Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Something went wrong
              </h1>
              <p className="text-gray-600">
                We've encountered an unexpected error. Our team has been notified and is working to fix this issue.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={reset}
                className="w-full"
                size="lg"
              >
                Try again
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
                size="lg"
              >
                Return to homepage
              </Button>
            </div>

            {/* Error Details for Development */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error details (development only)
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs text-gray-700">
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