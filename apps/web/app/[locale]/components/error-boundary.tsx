'use client';

import { Button } from '@repo/design-system/components';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to error tracking service
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      (window as any).Sentry?.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          errorBoundary: 'WebAppErrorBoundary',
          environment: process.env.NODE_ENV,
        },
        level: 'error',
      });
    }

    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[50vh] items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="mb-4">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            </div>
            <h2 className="mb-2 font-semibold text-gray-900 text-xl">
              Something went wrong
            </h2>
            <p className="mb-6 text-gray-600">
              We're sorry, but something unexpected happened. Please try
              refreshing the page or go back to the homepage.
            </p>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => window.location.reload()}
                variant="default"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>

              <Link className="block" href="/">
                <Button className="w-full" variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Button>
              </Link>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-gray-500 text-sm hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simplified error fallback components
export function ProductErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
      <div className="p-4 text-center">
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
        <p className="mb-3 text-gray-500 text-sm">Failed to load product</p>
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="outline">
            <RefreshCw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

export function ImageErrorFallback({
  alt,
  className,
}: {
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-gray-100 ${className}`}
    >
      <div className="p-4 text-center">
        <AlertCircle className="mx-auto mb-1 h-6 w-6 text-gray-400" />
        <p className="text-gray-500 text-xs">Image unavailable</p>
      </div>
    </div>
  );
}

export function SearchErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="py-12 text-center">
      <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
      <h3 className="mb-2 font-medium text-gray-900 text-lg">Search failed</h3>
      <p className="mb-6 text-gray-600">
        We couldn't complete your search. Please try again.
      </p>
      {onRetry && (
        <Button onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
