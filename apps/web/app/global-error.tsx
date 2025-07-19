'use client';

import { Button } from '@repo/design-system/components';
import { captureException } from '@sentry/nextjs';
import { useEffect } from 'react';

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
export default function GlobalError({ error, reset }: GlobalErrorProps) {
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
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We've encountered an unexpected error. Our team has been
                notified and is working to fix this issue.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full" onClick={reset} size="lg">
                Try again
              </Button>

              <Button
                className="w-full"
                onClick={() => (window.location.href = '/')}
                size="lg"
                variant="outline"
              >
                Return to homepage
              </Button>
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
