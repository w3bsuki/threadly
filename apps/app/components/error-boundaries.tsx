'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import { logError, parseError } from '@repo/observability/error';
import {
  AlertCircle,
  BarChart3,
  CreditCard,
  Home,
  Package,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Main Application Error Boundary
export class AppErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error using observability service
    logError('App Error Boundary caught an error', {
      error,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'AppErrorBoundary',
    });

    // Custom error reporting
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground text-sm">
                We're sorry, but something unexpected happened. Our team has
                been notified and is working on a fix.
              </p>

              <div className="space-y-2">
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
                    Go to Dashboard
                  </Button>
                </Link>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-muted-foreground text-sm hover:text-foreground">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted p-3 text-xs">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Analytics Error Boundary
export class AnalyticsErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError('Analytics Error Boundary caught an error', {
      error,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'AnalyticsErrorBoundary',
    });

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-orange-100">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Analytics Unavailable</h3>
                <p className="mt-1 text-muted-foreground text-xs">
                  Unable to load analytics data. This won't affect your core
                  functionality.
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                variant="outline"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Payment Error Boundary
export class PaymentErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Critical error - always report
    logError('Payment Error Boundary caught an error', {
      error,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'PaymentErrorBoundary',
      critical: true,
    });

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-red-100">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-red-900 text-sm">
                  Payment System Error
                </h3>
                <p className="mt-1 text-red-700 text-xs">
                  There's an issue with the payment system. Please contact
                  support if this persists.
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => window.location.reload()}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Retry Payment
                </Button>
                <Link href="/support">
                  <Button className="w-full" size="sm" variant="secondary">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Product Error Boundary
export class ProductErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError('Product Error Boundary caught an error', {
      error,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ProductErrorBoundary',
    });

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-secondary">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Product Load Error</h3>
                <p className="mt-1 text-muted-foreground text-xs">
                  Unable to load product information.
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                variant="outline"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Reload
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Form Error Boundary
export class FormErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError('Form Error Boundary caught an error', {
      error,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'FormErrorBoundary',
    });

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-4">
          <div className="space-y-3 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
            <div>
              <h3 className="font-medium text-red-900 text-sm">Form Error</h3>
              <p className="mt-1 text-red-700 text-xs">
                There was an issue with the form. Please refresh and try again.
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Refresh
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Generic Error Fallback Components for specific scenarios
export function ChartErrorFallback({
  onRetry,
}: {
  onRetry?: () => void;
}): React.JSX.Element {
  return (
    <div className="flex h-[120px] items-center justify-center rounded-[var(--radius-lg)] border border-muted-foreground/25 border-dashed">
      <div className="space-y-2 text-center">
        <BarChart3 className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="text-muted-foreground text-xs">Chart unavailable</p>
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="ghost">
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
}): React.JSX.Element {
  return (
    <div className={`flex items-center justify-center bg-muted ${className}`}>
      <div className="p-2 text-center">
        <Package className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
        <p className="text-muted-foreground text-xs">Image unavailable</p>
      </div>
    </div>
  );
}

export function LoadingErrorFallback({
  onRetry,
}: {
  onRetry?: () => void;
}): React.JSX.Element {
  return (
    <div className="py-8 text-center">
      <AlertCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
      <h3 className="mb-1 font-medium text-sm">Loading failed</h3>
      <p className="mb-3 text-muted-foreground text-xs">
        Unable to load content. Please try again.
      </p>
      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="outline">
          <RefreshCw className="mr-1 h-3 w-3" />
          Retry
        </Button>
      )}
    </div>
  );
}
