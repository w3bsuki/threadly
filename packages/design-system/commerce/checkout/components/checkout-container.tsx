'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  AlertDescription,
} from '../../../components/ui/alert';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '../../../components/ui/form';
import { Textarea } from '../../../components/ui/textarea';
import { Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { AlertCircle, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { type CartItem, type CheckoutFormData, checkoutSchema } from '../types';
import { calculateOrderCosts } from '../utils/calculate-costs';
import { ContactInfoForm } from './contact-info-form';
import { EmptyCart } from './empty-cart';
import { OrderSummary } from './order-summary';
import { PaymentForm } from './payment-form';
import { ShippingAddressForm } from './shipping-address-form';
import { ShippingOptions } from './shipping-options';

interface CheckoutContainerProps {
  stripe: Stripe | null;
  clientSecret: string;
  paymentIntentId: string;
  items: CartItem[];
  onCartClear: () => void;
}

function CheckoutFormContent({
  clientSecret,
  paymentIntentId,
  items,
  onCartClear,
}: Omit<CheckoutContainerProps, 'stripe'>) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      shippingMethod: 'standard',
      notes: '',
      saveAddress: false,
    },
  });

  const selectedShipping = form.watch('shippingMethod');
  const costs = calculateOrderCosts(items, selectedShipping);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!(stripe && elements)) {
      setError('Payment system not loaded. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}`,
          payment_method_data: {
            billing_details: {
              name: `${data.firstName} ${data.lastName}`,
              email: data.email,
              phone: data.phone,
              address: {
                line1: data.address,
                city: data.city,
                state: data.state,
                postal_code: data.postalCode,
                country: 'US',
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else if (result.paymentIntent?.status === 'succeeded') {
        const finalizeResponse = await fetch('/api/checkout/finalize-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: result.paymentIntent.id,
            shippingAddress: {
              street: data.address,
              city: data.city,
              state: data.state,
              postalCode: data.postalCode,
              country: data.country,
            },
            shippingMethod: data.shippingMethod,
            contactInfo: {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone,
            },
          }),
        });

        const finalizeData = await finalizeResponse.json();

        if (!finalizeResponse.ok) {
          throw new Error(finalizeData.error || 'Failed to finalize order');
        }

        onCartClear();
        router.push(
          `/checkout/success?payment_intent=${result.paymentIntent.id}`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <Form {...form}>
      <form
        className="relative min-h-screen pb-32 lg:pb-0"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 px-4 lg:col-span-2 lg:space-y-6 lg:px-0">
            {/* Contact Information */}
            <Card className="border-0 shadow-sm lg:border lg:shadow-none">
              <CardHeader className="pb-4 lg:pb-6">
                <CardTitle className="text-lg lg:text-xl">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContactInfoForm form={form} />
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border-0 shadow-sm lg:border lg:shadow-none">
              <CardHeader className="pb-4 lg:pb-6">
                <CardTitle className="text-lg lg:text-xl">
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShippingAddressForm form={form} />
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card className="border-0 shadow-sm lg:border lg:shadow-none">
              <CardHeader className="pb-4 lg:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                  <Truck className="h-5 w-5" />
                  Shipping Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShippingOptions form={form} subtotal={costs.subtotal} />
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card className="border-0 shadow-sm lg:border lg:shadow-none">
              <CardHeader className="pb-4 lg:pb-6">
                <CardTitle className="text-lg lg:text-xl">
                  Order Notes (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          className="min-h-20 text-base lg:text-sm"
                          placeholder="Special delivery instructions or notes..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="saveAddress"
                  render={({ field }) => (
                    <FormItem className="mt-4 flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          className="h-6 w-6 lg:h-4 lg:w-4"
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer text-base lg:text-sm">
                          Save this address for future orders
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Payment */}
            <div className="mb-4 lg:hidden">
              <PaymentForm error={error} />
            </div>
            <div className="hidden lg:block">
              <PaymentForm error={error} />
            </div>

            {error && (
              <Alert className="mx-4 lg:mx-0" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Desktop Order Summary */}
          <div className="hidden lg:block">
            <OrderSummary
              costs={costs}
              isMobile={false}
              isProcessing={isProcessing}
              items={items}
              onSubmit={form.handleSubmit(onSubmit)}
            />
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="fixed right-0 bottom-0 left-0 z-50 lg:hidden">
          <OrderSummary
            costs={costs}
            isMobile={true}
            isProcessing={isProcessing}
            items={items}
            onSubmit={form.handleSubmit(onSubmit)}
          />
        </div>
      </form>
    </Form>
  );
}

export function CheckoutContainer({
  stripe,
  clientSecret,
  paymentIntentId,
  items,
  onCartClear,
}: CheckoutContainerProps) {
  if (!stripe) {
    return <EmptyCart />;
  }

  return (
    <Elements options={{ clientSecret }} stripe={stripe}>
      <CheckoutFormContent
        clientSecret={clientSecret}
        items={items}
        onCartClear={onCartClear}
        paymentIntentId={paymentIntentId}
      />
    </Elements>
  );
}
