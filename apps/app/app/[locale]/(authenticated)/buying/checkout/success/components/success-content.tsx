'use client';

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
} from '@repo/design-system/components';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Package,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/stores/cart-store';

interface OrderItem {
  id: string;
  productId: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  condition: string;
  product: {
    id: string;
    images: Array<{
      url: string;
    }>;
  };
}

interface Order {
  id: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingMethod: string;
  shippingFirstName: string;
  shippingLastName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  createdAt: string;
  orderItems: OrderItem[];
}

interface SuccessContentProps {
  paymentIntentId: string;
  userId: string;
}

export function SuccessContent({
  paymentIntentId,
  userId,
}: SuccessContentProps) {
  const router = useRouter();
  const { clearCart } = useCartStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderAndUpdateStatus = async () => {
      try {
        // Verify payment status with Stripe
        const verifyResponse = await fetch('/api/stripe/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId,
          }),
        });

        if (!verifyResponse.ok) {
          throw new Error('Failed to verify payment');
        }

        const { status, order: orderData } = await verifyResponse.json();

        if (status === 'succeeded' && orderData) {
          setOrder(orderData);
          // Clear the cart after successful order
          clearCart();
        } else {
          throw new Error('Payment not successful');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load order details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndUpdateStatus();
  }, [paymentIntentId, clearCart]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h3 className="mb-2 font-semibold text-lg">Unable to Load Order</h3>
            <p className="mb-6 text-muted-foreground">
              {error ||
                "We couldn't find your order details. Please check your orders page."}
            </p>
            <Button asChild>
              <Link href="/buying/orders">View Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const estimatedDelivery = new Date();
  switch (order.shippingMethod) {
    case 'express':
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
      break;
    case 'overnight':
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 1);
      break;
    default:
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
        <h1 className="mb-2 font-bold text-3xl">Order Confirmed!</h1>
        <p className="text-lg text-muted-foreground">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order #{order.id.slice(-8).toUpperCase()}</CardTitle>
            <Badge className="bg-green-100 text-green-800" variant="secondary">
              Paid
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Placed{' '}
            {formatDistanceToNow(new Date(order.createdAt), {
              addSuffix: true,
            })}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="font-semibold">Items Purchased</h3>
            {order.orderItems.map((item) => (
              <div className="flex gap-4" key={item.id}>
                <div className="relative h-20 w-20 overflow-hidden rounded-[var(--radius-lg)] bg-secondary">
                  {item.product.images[0] ? (
                    <Image
                      alt={item.title}
                      className="object-cover"
                      fill
                      src={item.product.images[0].url}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">
                    Condition: {item.condition} • Qty: {item.quantity}
                  </p>
                  <p className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Shipping Details */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <Truck className="h-4 w-4" />
              Shipping Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  Shipping To
                </p>
                <p>
                  {order.shippingFirstName} {order.shippingLastName}
                </p>
                <p>{order.shippingAddress}</p>
                <p>
                  {order.shippingCity}, {order.shippingState}{' '}
                  {order.shippingZipCode}
                </p>
                <p>{order.shippingCountry}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  Delivery Method
                </p>
                <p className="capitalize">{order.shippingMethod} Shipping</p>
                <p className="mt-2 text-muted-foreground text-sm">
                  Estimated delivery by{' '}
                  <span className="font-medium">
                    {estimatedDelivery.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-2">
            <h3 className="font-semibold">Payment Summary</h3>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>
                {order.shippingCost === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `$${order.shippingCost.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Alert>
        <AlertDescription>
          <div className="space-y-4">
            <p className="font-semibold">What happens next?</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">1.</span>
                <span>
                  The seller will be notified of your order and will prepare
                  your items for shipping.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">2.</span>
                <span>
                  You'll receive a tracking number once the seller ships your
                  items.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">3.</span>
                <span>
                  You can track your order status from your orders page.
                </span>
              </li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild className="flex-1">
          <Link href="/buying/orders">View Order Details</Link>
        </Button>
        <Button asChild className="flex-1" variant="outline">
          <Link href="/browse">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
        <Button asChild className="flex-1" variant="outline">
          <Link href={`/messages?orderId=${order.id}`}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Message Seller
          </Link>
        </Button>
      </div>
    </div>
  );
}
