'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@repo/design-system/components';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

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
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page or go back to the homepage.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
              
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Button>
              </Link>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
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
    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center p-4">
        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 mb-3">Failed to load product</p>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

export function ImageErrorFallback({ 
  alt, 
  className 
}: { 
  alt: string; 
  className?: string; 
}) {
  return (
    <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
      <div className="text-center p-4">
        <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-1" />
        <p className="text-xs text-gray-500">Image unavailable</p>
      </div>
    </div>
  );
}

export function SearchErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Search failed
      </h3>
      <p className="text-gray-600 mb-6">
        We couldn't complete your search. Please try again.
      </p>
      {onRetry && (
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}