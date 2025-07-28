'use client';

import type React from 'react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import type { ActionError } from '../types';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ActionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error reporting service
    if (process.env.NODE_ENV === 'production') {
      console.error('ActionErrorBoundary caught error:', error, errorInfo);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <DefaultErrorFallback error={this.state.error} reset={this.reset} />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const isActionError = error.name === 'ActionError';
  const actionError = isActionError ? (error as unknown as ActionError) : null;

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 text-6xl">⚠️</div>
        <h2 className="mb-2 font-bold text-2xl text-gray-900">
          {actionError?.code === 'VALIDATION_ERROR'
            ? 'Validation Error'
            : actionError?.code === 'UNAUTHORIZED'
              ? 'Unauthorized'
              : actionError?.code === 'FORBIDDEN'
                ? 'Access Denied'
                : actionError?.code === 'NOT_FOUND'
                  ? 'Not Found'
                  : 'Something went wrong'}
        </h2>
        <p className="mb-4 text-gray-600">
          {error.message ||
            'An unexpected error occurred while processing your request.'}
        </p>
        {actionError?.details && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-left text-sm">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(actionError.details, null, 2)}
            </pre>
          </div>
        )}
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={reset}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export function withActionErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, reset: () => void) => ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ActionErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ActionErrorBoundary>
    );
  };
}
