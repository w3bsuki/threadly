'use client';

import React, { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'layout' | 'component';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;
  private errorCounter = 0;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    if (hasError) {
      // Reset on prop changes if enabled
      if (resetOnPropsChange && prevProps.children !== this.props.children) {
        this.resetErrorBoundary();
      }
      
      // Reset if resetKeys changed
      if (resetKeys && prevProps.resetKeys) {
        const hasResetKeyChanged = resetKeys.some((key, idx) => key !== prevProps.resetKeys![idx]);
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    
    // Increment error counter
    this.errorCounter++;
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
    }
    
    // Report to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', true);
      scope.setTag('errorBoundaryLevel', level);
      scope.setContext('errorInfo', {
        componentStack: errorInfo.componentStack,
        digest: errorInfo.digest,
      });
      scope.setContext('errorBoundary', {
        level,
        errorCount: this.errorCounter,
      });
      Sentry.captureException(error);
    });
    
    // Call custom error handler
    onError?.(error, errorInfo);
    
    // Update state with error info
    this.setState({ errorInfo });
    
    // Auto-reset after delay for transient errors
    if (this.errorCounter === 1) {
      this.resetTimeoutId = window.setTimeout(() => {
        this.resetErrorBoundary();
      }, 5000);
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    
    this.errorCounter = 0;
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, isolate, level = 'component' } = this.props;

    if (hasError && error) {
      // Default fallback UI
      if (!fallback) {
        return (
          <div className={`error-boundary error-boundary--${level}`}>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <h2 className="mb-2 text-lg font-semibold text-red-800">
                {level === 'page' ? 'Page Error' : 'Something went wrong'}
              </h2>
              <p className="mb-4 text-sm text-red-600">
                {process.env.NODE_ENV === 'development' 
                  ? error.message 
                  : 'An unexpected error occurred. Please try refreshing the page.'}
              </p>
              <button
                onClick={this.resetErrorBoundary}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-red-700">Error Details</summary>
                  <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        );
      }

      // Custom fallback
      return <>{fallback}</>;
    }

    // Isolate children to prevent cascading errors
    if (isolate) {
      return <div className="error-boundary-isolate">{children}</div>;
    }

    return <>{children}</>;
  }
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', false);
      scope.setTag('errorSource', 'useErrorHandler');
      if (errorInfo?.componentStack) {
        scope.setContext('componentStack', { stack: errorInfo.componentStack });
      }
      Sentry.captureException(error);
    });
  };
}

// Async error boundary for Suspense
export function AsyncErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary 
      fallback={fallback || <AsyncErrorFallback />}
      level="component"
      resetOnPropsChange
    >
      {children}
    </ErrorBoundary>
  );
}

function AsyncErrorFallback() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-sm text-gray-600">Failed to load content</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}