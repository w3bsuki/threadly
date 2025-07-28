'use client';

import { AlertTriangle, Bug, Home, RefreshCcw } from 'lucide-react';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for monitoring
    if (typeof window !== 'undefined') {
      // Report to error tracking service (Sentry, LogRocket, etc.)
      this.reportError(error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Prepare comprehensive error data structure
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      props: this.props,
    };

    // Console error for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Report:', errorReport);
      console.groupEnd();
    }

    // Store locally for debugging
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(
          `error_${this.state.errorId}`,
          JSON.stringify(errorReport)
        );
      } catch (storageError) {
        console.warn('Failed to store error in localStorage:', storageError);
      }
    }

    // Call global error handler if available
    if (typeof window !== 'undefined' && 'reportError' in window) {
      try {
        window.reportError(error);
      } catch (reportError) {
        console.warn('Failed to report error globally:', reportError);
      }
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorDetails = {
      errorId,
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      component: errorInfo?.componentStack || 'Unknown component',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    };

    // Open bug report (could be email, issue tracker, etc.)
    const bugReportUrl = `mailto:support@threadly.com?subject=Error Report - ${errorId}&body=${encodeURIComponent(
      `Error ID: ${errorId}\n\nError Details:\n${JSON.stringify(errorDetails, null, 2)}\n\nSteps to reproduce:\n1. \n2. \n3. `
    )}`;

    if (typeof window !== 'undefined') {
      window.open(bugReportUrl);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <p className="text-muted-foreground">
                We encountered an unexpected error. Our team has been notified.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {this.props.showDetails && this.state.error && (
                <Alert variant="destructive">
                  <Bug className="h-4 w-4" />
                  <AlertDescription className="font-mono text-xs">
                    Error ID: {this.state.errorId}
                    <br />
                    {this.state.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-3">
                <Button className="w-full" onClick={this.handleRetry}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Try again
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="w-full"
                    onClick={() => (window.location.href = '/')}
                    variant="outline"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>

                  <Button
                    className="w-full"
                    onClick={this.handleReportBug}
                    variant="outline"
                  >
                    <Bug className="mr-2 h-4 w-4" />
                    Report
                  </Button>
                </div>
              </div>

              <div className="text-center text-muted-foreground text-xs">
                Error ID: {this.state.errorId}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper component
export function AppErrorProvider({
  children,
  onError,
  showDetails = process.env.NODE_ENV === 'development',
}: {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}) {
  return (
    <AppErrorBoundary onError={onError} showDetails={showDetails}>
      {children}
    </AppErrorBoundary>
  );
}
