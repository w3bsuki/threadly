'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@repo/design-system/components';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { AlertCircle, RefreshCw, Home, BarChart3, CreditCard, Package } from 'lucide-react';
import Link from 'next/link';
import { logError, parseError } from '@repo/observability/error';

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
export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-[var(--radius-full)] bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                We're sorry, but something unexpected happened. Our team has been notified and is working on a fix.
              </p>
              
              <div className="space-y-2">
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
                    Go to Dashboard
                  </Button>
                </Link>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
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
export class AnalyticsErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
            <div className="text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-[var(--radius-full)] bg-orange-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Analytics Unavailable</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Unable to load analytics data. This won't affect your core functionality.
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
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
export class PaymentErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
            <div className="text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-[var(--radius-full)] bg-red-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-900">Payment System Error</h3>
                <p className="text-xs text-red-700 mt-1">
                  There's an issue with the payment system. Please contact support if this persists.
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry Payment
                </Button>
                <Link href="/support">
                  <Button size="sm" variant="secondary" className="w-full">
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
export class ProductErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
            <div className="text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-[var(--radius-full)] bg-secondary flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Product Load Error</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Unable to load product information.
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
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
export class FormErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
        <div className="p-4 border border-red-200 rounded-[var(--radius-lg)] bg-red-50">
          <div className="text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Form Error</h3>
              <p className="text-xs text-red-700 mt-1">
                There was an issue with the form. Please refresh and try again.
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
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
export function ChartErrorFallback({ onRetry }: { onRetry?: () => void }): React.JSX.Element {
  return (
    <div className="h-[120px] flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-[var(--radius-lg)]">
      <div className="text-center space-y-2">
        <BarChart3 className="h-6 w-6 text-muted-foreground mx-auto" />
        <p className="text-xs text-muted-foreground">Chart unavailable</p>
        {onRetry && (
          <Button size="sm" variant="ghost" onClick={onRetry}>
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
}): React.JSX.Element {
  return (
    <div className={`bg-muted flex items-center justify-center ${className}`}>
      <div className="text-center p-2">
        <Package className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
        <p className="text-xs text-muted-foreground">Image unavailable</p>
      </div>
    </div>
  );
}

export function LoadingErrorFallback({ onRetry }: { onRetry?: () => void }): React.JSX.Element {
  return (
    <div className="text-center py-8">
      <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
      <h3 className="text-sm font-medium mb-1">Loading failed</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Unable to load content. Please try again.
      </p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
}