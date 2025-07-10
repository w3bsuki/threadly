'use client';

import { useCartStore } from '@/lib/stores/cart-store';
import { Button } from '@repo/design-system/components';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Label } from '@repo/design-system/components';
import { RadioGroup, RadioGroupItem } from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import { Alert, AlertDescription } from '@repo/design-system/components';
import { ArrowLeft, CreditCard, Truck, Shield, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@repo/utils/currency';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { z } from 'zod';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(5, 'Valid postal code is required'),
  country: z.string().min(1, 'Country is required'),
  shippingMethod: z.enum(['standard', 'express']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  clientSecret: string;
  paymentIntentId: string;
  orderData: any;
}

function CheckoutForm({ clientSecret, paymentIntentId, orderData }: CheckoutFormProps) {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
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
    },
  });

  // Calculate costs
  const shippingCosts = {
    standard: 5.99,
    express: 12.99,
  };

  const selectedShipping = form.watch('shippingMethod');
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 50 ? 0 : shippingCosts[selectedShipping];
  const tax = Math.round(subtotal * 0.08); // 8% tax
  const total = subtotal + shippingCost + tax;

  const onSubmit = async (data: CheckoutFormData) => {
    if (!stripe || !elements) {
      setError('Payment system not loaded. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm payment with Stripe using the existing payment intent
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
        // Finalize the order
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

        // Clear cart and redirect to success page
        clearCart();
        router.push(`/checkout/success?payment_intent=${result.paymentIntent.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8">
            Add some items to your cart to continue checkout
          </p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123 Main St" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Method */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Method</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="shippingMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup value={field.value} onValueChange={field.onChange}>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="standard" id="standard" />
                            <Label htmlFor="standard" className="cursor-pointer">
                              <div>
                                <p className="font-medium">Standard Shipping</p>
                                <p className="text-sm text-muted-foreground">5-7 business days</p>
                              </div>
                            </Label>
                          </div>
                          <p className="font-medium">
                            {subtotal > 50 ? 'FREE' : formatCurrency(shippingCosts.standard)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="express" id="express" />
                            <Label htmlFor="express" className="cursor-pointer">
                              <div>
                                <p className="font-medium">Express Shipping</p>
                                <p className="text-sm text-muted-foreground">2-3 business days</p>
                              </div>
                            </Label>
                          </div>
                          <p className="font-medium">{formatCurrency(shippingCosts.express)}</p>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clientSecret ? (
                <PaymentElement />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading payment form...</span>
                </div>
              )}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      {item.imageUrl && !item.imageUrl.includes('placehold.co') && !item.imageUrl.includes('picsum.photos') ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-2 text-sm">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.size && `Size: ${item.size} • `}
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium text-base">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure payment by Stripe</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={!stripe || !clientSecret || isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ${formatCurrency(total)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}

export function CheckoutContent() {
  const [mounted, setMounted] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { items } = useCartStore();

  // Calculate costs
  const shippingCosts = {
    standard: 5.99,
    express: 12.99,
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 50 ? 0 : shippingCosts.standard; // Default to standard shipping
  const tax = Math.round(subtotal * 0.08); // 8% tax
  const total = subtotal + shippingCost + tax;

  // Create payment intent when component mounts
  const createPaymentIntent = useCallback(async () => {
    if (items.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          costs: {
            subtotal: subtotal,
            shipping: shippingCost,
            tax: tax,
            total: total,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.paymentIntent.clientSecret);
      setPaymentIntentId(data.paymentIntent.id);
      setOrderData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize checkout');
    } finally {
      setIsLoading(false);
    }
  }, [items, subtotal, shippingCost, tax, total]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length > 0) {
      createPaymentIntent();
    }
  }, [mounted, items.length, createPaymentIntent]);

  if (!mounted) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8">
            Add some items to your cart to continue checkout
          </p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <span className="ml-2 text-gray-600">Initializing checkout...</span>
        </div>
      </div>
    );
  }

  if (error && !clientSecret) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <Alert variant="destructive" className="mb-4 max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => createPaymentIntent()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/cart"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to cart
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      {clientSecret && paymentIntentId && (
        <Elements 
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
            },
          }}
        >
          <CheckoutForm 
            clientSecret={clientSecret} 
            paymentIntentId={paymentIntentId}
            orderData={orderData}
          />
        </Elements>
      )}
    </div>
  );
};