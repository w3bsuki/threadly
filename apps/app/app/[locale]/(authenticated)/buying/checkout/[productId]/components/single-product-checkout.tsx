'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  AlertDescription,
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
} from '@repo/ui/components';
import { formatCurrency } from '@repo/integrations/payments/client';
import { decimalToNumber } from '@repo/api/utils';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AlertCircle, CreditCard, Shield, Truck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const checkoutSchema = z.object({
  // Shipping Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),

  // Address
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Valid zip code is required'),
  country: z.string().min(1, 'Country is required'),

  // Shipping Options
  shippingMethod: z.enum(['standard', 'express']),

  // Preferences
  saveAddress: z.boolean(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface EmailAddress {
  emailAddress: string;
}

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: EmailAddress[];
}

interface ProductImage {
  id: string;
  imageUrl: string;
  alt?: string | null;
  productId?: string;
  displayOrder?: number;
}

interface Product {
  id: string;
  title: string;
  brand: string | null;
  size: string | null;
  price: number | { toNumber(): number }; // Prisma Decimal or number
  sellerId: string;
  images: ProductImage[];
}

interface SavedAddress {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  streetLine1: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface SingleProductCheckoutProps {
  user: User;
  product: Product;
  savedAddress: SavedAddress | null;
}

function CheckoutForm({
  user,
  product,
  savedAddress,
}: SingleProductCheckoutProps) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert product price from Prisma Decimal to number (cents to dollars)
  const productPrice = decimalToNumber(product.price) / 100;

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: savedAddress?.firstName || user.firstName || '',
      lastName: savedAddress?.lastName || user.lastName || '',
      email: user.emailAddresses[0]?.emailAddress || '',
      phone: savedAddress?.phone || '',
      address: savedAddress?.streetLine1 || '',
      city: savedAddress?.city || '',
      state: savedAddress?.state || '',
      zipCode: savedAddress?.zipCode || '',
      country: savedAddress?.country || 'United States',
      shippingMethod: 'standard',
      saveAddress: !savedAddress, // Only check if no saved address exists
    },
  });

  // Calculate costs
  const shippingCosts = {
    standard: 5.99,
    express: 12.99,
  };

  const selectedShipping = form.watch('shippingMethod');
  const shippingCost = productPrice > 50 ? 0 : shippingCosts[selectedShipping];
  const platformFee = productPrice * 0.05;
  const total = productPrice + shippingCost;

  const onSubmit = async (data: CheckoutFormData) => {
    if (!(stripe && elements)) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Save address if requested
      if (data.saveAddress) {
        try {
          await fetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: data.firstName,
              lastName: data.lastName,
              streetLine1: data.address,
              city: data.city,
              state: data.state,
              zipCode: data.zipCode,
              country: data.country === 'United States' ? 'US' : data.country,
              phone: data.phone,
              type: 'SHIPPING',
              isDefault: !savedAddress, // Set as default if no existing saved address
            }),
          });
        } catch (addressError) {
          // Continue with payment even if address saving fails
          // Address saving failure is not critical for payment flow
        }
      }

      // Confirm the payment
      const result = await stripe.confirmPayment({
        elements,
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

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else if (result.paymentIntent?.status === 'succeeded') {
        // Payment succeeded, order will be created by webhook
        router.push(
          `/buying/checkout/success?payment_intent=${result.paymentIntent.id}`
        );
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form
      className="grid gap-6 lg:grid-cols-3"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="space-y-6 lg:col-span-2">
        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Information
            </CardTitle>
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
            </div>

            <FormField
              control={form.control}
              name="saveAddress"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal text-sm">
                    Save this address for future purchases
                  </FormLabel>
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
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <div className="flex items-center justify-between rounded-[var(--radius-lg)] border p-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem id="standard" value="standard" />
                          <Label className="cursor-pointer" htmlFor="standard">
                            <div>
                              <p className="font-medium">Standard Shipping</p>
                              <p className="text-muted-foreground text-sm">
                                5-7 business days
                              </p>
                            </div>
                          </Label>
                        </div>
                        <p className="font-medium">
                          {productPrice > 50
                            ? 'FREE'
                            : formatCurrency(shippingCosts.standard)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between rounded-[var(--radius-lg)] border p-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem id="express" value="express" />
                          <Label className="cursor-pointer" htmlFor="express">
                            <div>
                              <p className="font-medium">Express Shipping</p>
                              <p className="text-muted-foreground text-sm">
                                2-3 business days
                              </p>
                            </div>
                          </Label>
                        </div>
                        <p className="font-medium">
                          {formatCurrency(shippingCosts.express)}
                        </p>
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
            <PaymentElement />
            {error && (
              <Alert className="mt-4" variant="destructive">
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
            {/* Product */}
            <div className="flex gap-3">
              {product.images[0] ? (
                <Image
                  alt={product.title}
                  className="rounded-[var(--radius-md)] object-cover"
                  height={80}
                  src={product.images[0].imageUrl}
                  width={80}
                />
              ) : (
                <div className="h-20 w-20 rounded-[var(--radius-md)] bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
              <div className="flex-1">
                <h4 className="line-clamp-2 font-medium">{product.title}</h4>
                <p className="text-muted-foreground text-sm">{product.brand}</p>
                <p className="text-muted-foreground text-sm">
                  Size: {product.size}
                </p>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Item Price</span>
                <span>{formatCurrency(productPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium text-base">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Shield className="h-4 w-4" />
                <span>Secure payment by Stripe</span>
              </div>
              <div className="text-muted-foreground text-xs">
                Platform fee of {formatCurrency(platformFee)} supports Threadly
                operations
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!stripe || isProcessing}
              size="lg"
              type="submit"
            >
              {isProcessing ? 'Processing...' : `Pay ${formatCurrency(total)}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

export function SingleProductCheckout(
  props: SingleProductCheckoutProps
): React.JSX.Element {
  const { product } = props;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create order and payment intent when component mounts
  useState(() => {
    fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        sellerId: product.sellerId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch(() => {
        setError('Failed to initialize checkout');
      });
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!clientSecret) {
    return <div>Loading checkout...</div>;
  }

  return (
    <Elements
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }}
      stripe={stripePromise}
    >
      <CheckoutForm {...props} />
    </Elements>
  );
}
