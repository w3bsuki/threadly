'use client';

import React, { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { ErrorPage } from './error-pages';
import { logError } from './error-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  isolate?: boolean;
  level?: 'page' | 'component' | 'app';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;
  private errorCounter = 0;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorId: null };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    
    // Increment error counter
    this.errorCounter++;
    
    // Log to our error service
    logError(error, {
      componentStack: errorInfo.componentStack || undefined,
      level: 'error',
      extra: {
        errorBoundaryProps: this.props,
        errorCount: this.errorCounter,
      },
    });
    
    // Send to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('error-boundary', true);
      scope.setTag('error-level', level);
      scope.setContext('errorInfo', {
        componentStack: errorInfo.componentStack || undefined,
        errorId: this.state.errorId || 'unknown',
        errorCount: this.errorCounter,
      });
      Sentry.captureException(error);
    });
    
    // Call custom error handler if provided
    onError?.(error, errorInfo);
    
    // Auto-recover after 5 errors to prevent infinite loops
    if (this.errorCounter >= 5) {
      this.scheduleReset(10000); // Reset after 10 seconds
    }
  }

  scheduleReset = (delay: number) => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, delay);
  };

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    this.errorCounter = 0;
    this.setState({ hasError: false, error: null, errorId: null });
  };

  componentDidUpdate(prevProps: Props) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetKeys !== resetKeys && resetKeys?.length) {
      // Check if any reset key changed
      const hasResetKeyChanged = resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index]);
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  render() {
    const { hasError, error, errorId } = this.state;
    const { fallback, children, level = 'component', isolate } = this.props;

    if (hasError && error) {
      // If isolate is true, render the error in place without affecting the whole page
      if (isolate) {
        return (
          <div className="rounded-[var(--radius-lg)] border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">
              Something went wrong in this section
            </p>
            <button
              onClick={this.resetErrorBoundary}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        );
      }

      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error pages based on level
      return (
        <ErrorPage
          error={error}
          errorId={errorId}
          level={level}
          onReset={this.resetErrorBoundary}
        />
      );
    }

    return children;
  }
}

// Convenient wrapper for async error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}