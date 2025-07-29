'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  type CheckoutFormData,
  checkoutFormSchema,
  useCartStore,
} from '@repo/commerce';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Textarea,
} from '@repo/ui/components';
import { formatCurrency } from '@repo/utils';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Shield, ShoppingBag, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PaymentErrorBoundary } from '@/components/error-boundaries';
import { env } from '@/env';
import { useCheckout } from '@/lib/hooks/use-checkout';
import { createOrder } from '../actions/create-order';

const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutContentProps {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    emailAddresses: Array<{
      emailAddress: string;
    }>;
  };
}

export function CheckoutContent({
  user,
}: CheckoutContentProps): React.JSX.Element {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.emailAddresses[0]?.emailAddress || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      shippingMethod: 'standard',
      notes: '',
      saveAddress: false,
    },
  });

  const subtotal = getTotalPrice();
  const shippingCosts = {
    standard: 9.99,
    express: 19.99,
    overnight: 39.99,
  };

  const selectedShipping = form.watch('shippingMethod');
  const shippingCost = subtotal > 100 ? 0 : shippingCosts[selectedShipping];
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + tax;

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);

    try {
      // First, create the orders
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          phone: data.phone,
        },
        shippingMethod: data.shippingMethod,
        subtotal,
        shippingCost,
        tax,
        total,
        notes: data.notes,
        saveAddress: data.saveAddress,
      };

      const orderResult = await createOrder(orderData);

      if (!(orderResult.success && orderResult.order)) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      // Create payment intent for the orders
      const paymentResponse = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'usd',
          orderId: orderResult.order.id, // Pass the created order ID
          orderItems: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await paymentResponse.json();

      // Get Stripe instance
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Confirm payment
      const { error: paymentError, paymentIntent } =
        await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/buying/checkout/success`,
            payment_method_data: {
              billing_details: {
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                phone: data.phone,
                address: {
                  line1: data.address,
                  city: data.city,
                  state: data.state,
                  postal_code: data.zipCode,
                  country: 'US',
                },
              },
            },
          },
          redirect: 'if_required',
        });

      if (paymentError) {
        // TODO: Add proper error tracking service
        setError('Payment failed. Please try again.');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Payment succeeded, redirect to success page
        router.push('/buying/checkout/success');
      }
    } catch (error) {
      // TODO: Add proper error tracking
      setError('An unexpected error occurred during checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Your cart is empty</h3>
        <p className="mb-6 text-muted-foreground">
          Add some items to your cart before checking out
        </p>
        <Button asChild>
          <Link href="/buying/cart">Go to Cart</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Checkout Form */}
      <div className="lg:col-span-2">
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="saveAddress"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Save this address for future orders
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
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
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          className="grid gap-4"
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <div className="flex items-center space-x-3 rounded-[var(--radius-lg)] border p-3">
                            <RadioGroupItem id="standard" value="standard" />
                            <Label
                              className="flex-1 cursor-pointer"
                              htmlFor="standard"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">
                                    Standard Shipping
                                  </div>
                                  <div className="text-muted-foreground text-sm">
                                    5-7 business days
                                  </div>
                                </div>
                                <div className="font-medium">
                                  {subtotal > 100 ? 'Free' : '$9.99'}
                                </div>
                              </div>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-3 rounded-[var(--radius-lg)] border p-3">
                            <RadioGroupItem id="express" value="express" />
                            <Label
                              className="flex-1 cursor-pointer"
                              htmlFor="express"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">
                                    Express Shipping
                                  </div>
                                  <div className="text-muted-foreground text-sm">
                                    2-3 business days
                                  </div>
                                </div>
                                <div className="font-medium">$19.99</div>
                              </div>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-3 rounded-[var(--radius-lg)] border p-3">
                            <RadioGroupItem id="overnight" value="overnight" />
                            <Label
                              className="flex-1 cursor-pointer"
                              htmlFor="overnight"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">
                                    Overnight Shipping
                                  </div>
                                  <div className="text-muted-foreground text-sm">
                                    Next business day
                                  </div>
                                </div>
                                <div className="font-medium">$39.99</div>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          className="min-h-20"
                          placeholder="Special delivery instructions or notes..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div className="flex gap-3" key={item.id}>
                  <div className="relative h-12 w-12 flex-shrink-0">
                    <Image
                      alt={item.title}
                      className="rounded-[var(--radius-md)] object-cover"
                      fill
                      src={item.imageUrl}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-1 font-medium text-sm">
                      {item.title}
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      Qty: {item.quantity}
                    </p>
                    <p className="font-medium text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
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
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full"
              disabled={isProcessing}
              onClick={form.handleSubmit(onSubmit)}
              size="lg"
            >
              <Shield className="mr-2 h-4 w-4" />
              {isProcessing
                ? 'Processing...'
                : `Complete Order - $${total.toFixed(2)}`}
            </Button>

            <div className="text-center text-muted-foreground text-xs">
              Your payment information is secure and encrypted
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
