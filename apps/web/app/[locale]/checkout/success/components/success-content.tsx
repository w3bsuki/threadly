'use client';

import { Button } from '@repo/design-system/components';
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

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
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        {/* Order Number */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <p className="text-sm text-gray-600 mb-1">Order number</p>
          <p className="text-2xl font-mono font-semibold text-gray-900">
            {order.orderNumber}
          </p>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-lg border p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            What happens next?
          </h2>
          <div className="space-y-6 text-left max-w-md mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Order confirmation</h3>
                <p className="text-sm text-gray-600 mt-1">
                  We've sent a confirmation email with your order details and tracking information.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Shipping updates</h3>
                <p className="text-sm text-gray-600 mt-1">
                  You'll receive updates when your order is packed and shipped. Expected delivery in 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/">
              Continue Shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href={`/orders/${order.id}`}>
              View Order Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};