'use client';

import { Button } from '@repo/design-system/components';
import { ArrowRight, CheckCircle, Mail, Package } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: any;
  createdAt: Date;
  status: string;
  product: {
    id: string;
    title: string;
    price: any;
    images: Array<{
      imageUrl: string;
      alt?: string | null;
    }>;
  };
  buyer: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  seller: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

interface SuccessContentProps {
  order: Order;
}

export const SuccessContent = ({ order }: SuccessContentProps) => {
  useEffect(() => {
    // Dynamically import confetti for better performance
    const triggerConfetti = async () => {
      const confetti = (await import('canvas-confetti')).default;

      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    };

    triggerConfetti();
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[var(--radius-full)] bg-green-100">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        {/* Title */}
        <h1 className="mb-2 font-bold text-3xl text-foreground">
          Order Confirmed!
        </h1>
        <p className="mb-8 text-muted-foreground text-lg">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        {/* Order Number */}
        <div className="mb-8 rounded-[var(--radius-lg)] bg-muted p-6">
          <p className="mb-1 text-muted-foreground text-sm">Order number</p>
          <p className="font-mono font-semibold text-2xl text-foreground">
            {order.orderNumber}
          </p>
        </div>

        {/* What's Next */}
        <div className="mb-8 rounded-[var(--radius-lg)] border bg-background p-8">
          <h2 className="mb-6 font-semibold text-foreground text-xl">
            What happens next?
          </h2>
          <div className="mx-auto max-w-md space-y-6 text-left">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Order confirmation
                </h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  We've sent a confirmation email with your order details and
                  tracking information.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] bg-purple-100">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Shipping updates
                </h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  You'll receive updates when your order is packed and shipped.
                  Expected delivery in 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={`/orders/${order.id}`}>View Order Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
