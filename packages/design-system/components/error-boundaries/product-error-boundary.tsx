'use client';

import { AlertTriangle, Package, RefreshCcw, Save, X } from 'lucide-react';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  onSaveDraft?: () => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
  productTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorType: 'upload' | 'validation' | 'save' | 'network' | 'unknown';
}

export class ProductErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorType: 'unknown',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Classify error type for product operations
    let errorType: State['errorType'] = 'unknown';

    if (
      error.message.includes('upload') ||
      error.message.includes('image') ||
      error.message.includes('file')
    ) {
      errorType = 'upload';
    } else if (
      error.message.includes('validation') ||
      error.message.includes('required') ||
      error.message.includes('invalid')
    ) {
      errorType = 'validation';
    } else if (
      error.message.includes('save') ||
      error.message.includes('create') ||
      error.message.includes('update')
    ) {
      errorType = 'save';
    } else if (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout')
    ) {
      errorType = 'network';
    }

    return {
      hasError: true,
      error,
      errorType,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report product-specific error
    this.reportProductError(error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  private reportProductError = (error: Error, errorInfo: ErrorInfo) => {
    if (process.env.NODE_ENV === 'production') {
      const productErrorReport = {
        type: 'product_error',
        mode: this.props.mode || 'unknown',
        errorType: this.state.errorType,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        productTitle: this.props.productTitle,
        userAgent:
          typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server',
      };

      localStorage.setItem(
        `product_error_${Date.now()}`,
        JSON.stringify(productErrorReport)
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
    const { errorType } = this.state;
    const { mode } = this.props;
    const actionWord = mode === 'edit' ? 'updating' : 'creating';

    switch (errorType) {
      case 'upload':
        return {
          title: 'Image Upload Failed',
          description: 'There was an issue uploading your product images.',
          action: 'Please check your images are under 10MB and try again.',
          canSaveDraft: true,
        };
      case 'validation':
        return {
          title: 'Invalid Product Information',
          description:
            'Some required product information is missing or invalid.',
          action:
            'Please review all fields and ensure they are completed correctly.',
          canSaveDraft: true,
        };
      case 'save':
        return {
          title: `Error ${actionWord} Product`,
          description: `There was an issue ${actionWord} your product listing.`,
          action: 'Your changes may not have been saved. Please try again.',
          canSaveDraft: true,
        };
      case 'network':
        return {
          title: 'Connection Error',
          description: 'Unable to connect to our servers.',
          action: 'Please check your internet connection and try again.',
          canSaveDraft: true,
        };
      default:
        return {
          title: 'Product Listing Error',
          description: `An unexpected error occurred while ${actionWord} your product.`,
          action: 'Please try again or save as draft.',
          canSaveDraft: true,
        };
    }
  };

  private handleSaveDraft = () => {
    // Try to save whatever data we can as draft
    this.props.onSaveDraft?.();
    this.handleRetry();
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage();
      const { mode, productTitle } = this.props;

      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-destructive/10">
                <Package className="h-6 w-6 text-destructive" />
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

              {productTitle && (
                <div className="rounded-[var(--radius-lg)] bg-muted p-3 text-center">
                  <p className="text-muted-foreground text-sm">
                    {mode === 'edit' ? 'Editing:' : 'Creating:'}
                  </p>
                  <p className="font-medium">{productTitle}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <Button className="w-full" onClick={this.handleRetry}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>

                {errorMessage.canSaveDraft && this.props.onSaveDraft && (
                  <Button
                    className="w-full"
                    onClick={this.handleSaveDraft}
                    variant="outline"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save as Draft
                  </Button>
                )}

                <Button
                  className="w-full"
                  onClick={this.props.onCancel}
                  variant="ghost"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground text-xs">
                  Lost work? Check your{' '}
                  <button
                    className="text-primary hover:underline"
                    onClick={() =>
                      (window.location.href = '/selling/listings?tab=drafts')
                    }
                  >
                    drafts
                  </button>
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

// Convenience wrapper for product flows
export function ProductErrorProvider({
  children,
  onError,
  onRetry,
  onSaveDraft,
  onCancel,
  mode = 'create',
  productTitle,
}: {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  onSaveDraft?: () => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
  productTitle?: string;
}) {
  return (
    <ProductErrorBoundary
      mode={mode}
      onCancel={onCancel}
      onError={onError}
      onRetry={onRetry}
      onSaveDraft={onSaveDraft}
      productTitle={productTitle}
    >
      {children}
    </ProductErrorBoundary>
  );
}
