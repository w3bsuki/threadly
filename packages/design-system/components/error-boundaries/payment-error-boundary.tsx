'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CreditCard, AlertTriangle, RefreshCcw, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

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
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorType = 'network';
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
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
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        checkoutUrl: typeof window !== 'undefined' ? window.location.href : 'server',
      };

      // Store for analysis (in production, send to Stripe monitoring, Sentry, etc.)
      localStorage.setItem(`payment_error_${Date.now()}`, JSON.stringify(paymentErrorReport));
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
          description: 'There was an issue processing your payment. Your card was not charged.',
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
          description: 'Some of your payment information appears to be incorrect.',
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
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-[var(--radius-full)] flex items-center justify-center mb-4">
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
                <AlertDescription>
                  {errorMessage.action}
                </AlertDescription>
              </Alert>

              {this.props.productTitle && (
                <div className="text-center p-3 bg-muted rounded-[var(--radius-lg)]">
                  <p className="text-sm text-muted-foreground">Item:</p>
                  <p className="font-medium">{this.props.productTitle}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Try Payment Again
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={this.props.onCancel}
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/cart'}
                    className="w-full"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Need help? Contact{' '}
                  <a href="mailto:support@threadly.com" className="text-primary hover:underline">
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
  productTitle 
}: {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  onCancel?: () => void;
  productTitle?: string;
}) {
  return (
    <PaymentErrorBoundary 
      onError={onError} 
      onRetry={onRetry}
      onCancel={onCancel}
      productTitle={productTitle}
    >
      {children}
    </PaymentErrorBoundary>
  );
}