'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CreditCard,
  RefreshCcw,
  ShoppingCart,
} from 'lucide-react';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  onCancel?: () => void;
  productTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorType: 'payment' | 'network' | 'validation' | 'unknown';
}

export class PaymentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorType: 'unknown',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Classify error type based on error message/type
    let errorType: State['errorType'] = 'unknown';

    if (error.message.includes('payment') || error.message.includes('stripe')) {
      errorType = 'payment';
    } else if (
      error.message.includes('network') ||
      error.message.includes('fetch')
    ) {
      errorType = 'network';
    } else if (
      error.message.includes('validation') ||
      error.message.includes('invalid')
    ) {
      errorType = 'validation';
    }

    return {
      hasError: true,
      error,
      errorType,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log payment-specific error

    // Report to payment monitoring
    this.reportPaymentError(error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  private reportPaymentError = (error: Error, errorInfo: ErrorInfo) => {
    // In production, send to payment monitoring service
    if (process.env.NODE_ENV === 'production') {
      const paymentErrorReport = {
        type: 'payment_error',
        errorType: this.state.errorType,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        productTitle: this.props.productTitle,
        userAgent:
          typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        checkoutUrl:
          typeof window !== 'undefined' ? window.location.href : 'server',
      };

      // Store for analysis (in production, send to Stripe monitoring, Sentry, etc.)
      localStorage.setItem(
        `payment_error_${Date.now()}`,
        JSON.stringify(paymentErrorReport)
      );
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorType: 'unknown',
    });
    this.props.onRetry?.();
  };

  private getErrorMessage = () => {
    const { errorType, error } = this.state;

    switch (errorType) {
      case 'payment':
        return {
          title: 'Payment Processing Error',
          description:
            'There was an issue processing your payment. Your card was not charged.',
          action: 'Please check your payment details and try again.',
        };
      case 'network':
        return {
          title: 'Connection Error',
          description: 'Unable to connect to our payment processor.',
          action: 'Please check your internet connection and try again.',
        };
      case 'validation':
        return {
          title: 'Payment Information Invalid',
          description:
            'Some of your payment information appears to be incorrect.',
          action: 'Please verify your card details and billing address.',
        };
      default:
        return {
          title: 'Checkout Error',
          description: 'An unexpected error occurred during checkout.',
          action: 'Please try again or contact support if the issue persists.',
        };
    }
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage();

      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-destructive/10">
                <CreditCard className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-lg">{errorMessage.title}</CardTitle>
              <p className="text-muted-foreground text-sm">
                {errorMessage.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errorMessage.action}</AlertDescription>
              </Alert>

              {this.props.productTitle && (
                <div className="rounded-[var(--radius-lg)] bg-muted p-3 text-center">
                  <p className="text-muted-foreground text-sm">Item:</p>
                  <p className="font-medium">{this.props.productTitle}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <Button className="w-full" onClick={this.handleRetry}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Try Payment Again
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="w-full"
                    onClick={this.props.onCancel}
                    variant="outline"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  <Button
                    className="w-full"
                    onClick={() => (window.location.href = '/cart')}
                    variant="outline"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground text-xs">
                  Need help? Contact{' '}
                  <a
                    className="text-primary hover:underline"
                    href="mailto:support@threadly.com"
                  >
                    support@threadly.com
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

// Convenience wrapper for checkout flows
export function PaymentErrorProvider({
  children,
  onError,
  onRetry,
  onCancel,
  productTitle,
}: {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  onCancel?: () => void;
  productTitle?: string;
}) {
  return (
    <PaymentErrorBoundary
      onCancel={onCancel}
      onError={onError}
      onRetry={onRetry}
      productTitle={productTitle}
    >
      {children}
    </PaymentErrorBoundary>
  );
}
