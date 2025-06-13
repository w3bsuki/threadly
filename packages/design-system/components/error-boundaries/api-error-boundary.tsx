'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Wifi, AlertTriangle, RefreshCcw, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  onGoBack?: () => void;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorType: 'network' | 'server' | 'timeout' | 'rate_limit' | 'auth' | 'unknown';
  retryCount: number;
}

export class APIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorType: 'unknown',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Classify API error type
    let errorType: State['errorType'] = 'unknown';
    
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      errorType = 'network';
    } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      errorType = 'server';
    } else if (error.message.includes('timeout') || error.message.includes('408')) {
      errorType = 'timeout';
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      errorType = 'rate_limit';
    } else if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Unauthorized')) {
      errorType = 'auth';
    } else if (error.message.includes('404')) {
      errorType = 'network'; // Treat 404s as network issues for user-facing errors
    }

    return {
      hasError: true,
      error,
      errorType,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    
    // Report API-specific error
    this.reportAPIError(error, errorInfo);
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  private reportAPIError = (error: Error, errorInfo: ErrorInfo) => {
    if (process.env.NODE_ENV === 'production') {
      const apiErrorReport = {
        type: 'api_error',
        errorType: this.state.errorType,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        retryCount: this.state.retryCount,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server',
        online: typeof window !== 'undefined' ? navigator.onLine : true,
      };

      localStorage.setItem(`api_error_${Date.now()}`, JSON.stringify(apiErrorReport));
    }
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorType: 'unknown',
      retryCount: prevState.retryCount + 1,
    }));
    this.props.onRetry?.();
  };

  private getErrorMessage = () => {
    const { errorType } = this.state;
    
    switch (errorType) {
      case 'network':
        return {
          title: 'Connection Problem',
          description: 'Unable to connect to our servers. Please check your internet connection.',
          action: 'Try again when your connection is restored.',
          icon: Wifi,
          canRetry: true,
        };
      case 'server':
        return {
          title: 'Server Error',
          description: 'Our servers are experiencing issues. We\'re working to fix this.',
          action: 'Please try again in a few minutes.',
          icon: AlertTriangle,
          canRetry: true,
        };
      case 'timeout':
        return {
          title: 'Request Timeout',
          description: 'The request took too long to complete.',
          action: 'This might be due to slow internet. Please try again.',
          icon: Wifi,
          canRetry: true,
        };
      case 'rate_limit':
        return {
          title: 'Too Many Requests',
          description: 'You\'re making requests too quickly.',
          action: 'Please wait a moment before trying again.',
          icon: AlertTriangle,
          canRetry: true,
        };
      case 'auth':
        return {
          title: 'Authentication Required',
          description: 'You need to sign in to access this feature.',
          action: 'Please sign in and try again.',
          icon: AlertTriangle,
          canRetry: false,
        };
      default:
        return {
          title: 'Something went wrong',
          description: 'An unexpected error occurred while loading data.',
          action: 'Please try again or contact support if the issue persists.',
          icon: AlertTriangle,
          canRetry: true,
        };
    }
  };

  private handleSignIn = () => {
    window.location.href = '/sign-in';
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage();
      const { fallbackTitle, fallbackDescription } = this.props;
      const IconComponent = errorMessage.icon;

      // Show offline indicator if network error and user is offline
      const isOffline = this.state.errorType === 'network' && typeof window !== 'undefined' && !navigator.onLine;

      return (
        <div className="min-h-[300px] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <IconComponent className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-lg">
                {fallbackTitle || errorMessage.title}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {fallbackDescription || errorMessage.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {isOffline && (
                <Alert>
                  <Wifi className="h-4 w-4" />
                  <AlertDescription>
                    You appear to be offline. Please check your internet connection.
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage.action}
                </AlertDescription>
              </Alert>

              {this.state.retryCount > 0 && (
                <div className="text-center text-xs text-muted-foreground">
                  Retry attempt: {this.state.retryCount}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {errorMessage.canRetry && (
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                {this.state.errorType === 'auth' && (
                  <Button onClick={this.handleSignIn} className="w-full">
                    Sign In
                  </Button>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={this.props.onGoBack || (() => window.history.back())}
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/'}
                    className="w-full"
                  >
                    Home
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Still having issues?{' '}
                  <a href="mailto:support@threadly.com" className="text-primary hover:underline">
                    Contact support
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper for API operations
export function APIErrorProvider({ 
  children, 
  onError,
  onRetry,
  onGoBack,
  fallbackTitle,
  fallbackDescription 
}: {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  onGoBack?: () => void;
  fallbackTitle?: string;
  fallbackDescription?: string;
}) {
  return (
    <APIErrorBoundary 
      onError={onError} 
      onRetry={onRetry}
      onGoBack={onGoBack}
      fallbackTitle={fallbackTitle}
      fallbackDescription={fallbackDescription}
    >
      {children}
    </APIErrorBoundary>
  );
}