'use client';

import { useCartStore } from '@/lib/stores/cart-store';
import { Button } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Label } from '@repo/design-system/components';
import { RadioGroup, RadioGroupItem } from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import { ArrowLeft, CreditCard, Truck, Shield, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import { formatCurrency } from '@/lib/utils/currency';

export const CheckoutContent = () => {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const subtotal = getTotalPrice();
  const shipping = 999; // $9.99
  const tax = Math.round(subtotal * 0.08); // 8% tax
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Clear cart and redirect to success page
      clearCart();
      const successUrl = `/checkout/success`;
      router.push(successUrl);
    }, 2000);
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to shopping
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Checkout Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Method
              </h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Credit or Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center cursor-pointer flex-1">
                      PayPal
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {paymentMethod === 'card' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    You'll be redirected to complete payment securely
                  </p>
                </div>
              )}
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center space-x-4 py-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-1" />
                Secure Checkout
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Buyer Protection
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay ${formatCurrency(total)}`}
            </Button>
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
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
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.size && `Size: ${item.size} • `}
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Totals */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">{formatCurrency(tax)}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-base font-medium">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center text-sm text-blue-800">
                <Truck className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Estimated delivery</p>
                  <p>3-5 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};