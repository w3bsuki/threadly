'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components';
import { PaymentElement, ExpressCheckoutElement } from '@stripe/react-stripe-js';
import { CreditCard, Loader2, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PaymentFormProps {
  error?: string | null;
}

export function PaymentForm({ error }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showExpressCheckout, setShowExpressCheckout] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Express Checkout Options - Mobile First */}
      {showExpressCheckout && !isLoading && (
        <Card className="mb-4 border-0 shadow-sm lg:border lg:shadow-none">
          <CardHeader className="pb-4 lg:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
              <Smartphone className="h-5 w-5" />
              Express Checkout
            </CardTitle>
            <CardDescription>
              Fast and secure checkout with your saved payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ExpressCheckoutElement
                options={{
                  buttonTheme: {
                    applePay: 'black',
                    googlePay: 'black',
                  },
                  buttonHeight: 48,
                }}
                onConfirm={async (event) => {
                  if ('vibrate' in navigator) {
                    navigator.vibrate(10);
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Standard Payment Form */}
      <Card className="border-0 shadow-sm lg:border lg:shadow-none">
        <CardHeader className="pb-4 lg:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>
            All transactions are secure and encrypted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading payment form...</span>
            </div>
          ) : (
            <>
              {showExpressCheckout && (
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex-1 border-t" />
                  <span className="text-sm text-muted-foreground">Or pay with card</span>
                  <div className="flex-1 border-t" />
                </div>
              )}
              <PaymentElement
                options={{
                  layout: 'tabs',
                  paymentMethodOrder: ['card'],
                  fields: {
                    billingDetails: {
                      address: 'never',
                    },
                  },
                }}
              />
            </>
          )}
          {error && (
            <div className="mt-4 rounded-md bg-red-50 dark:bg-red-950 p-4 text-base lg:text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}