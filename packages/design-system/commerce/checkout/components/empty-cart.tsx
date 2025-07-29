'use client';

import { Button } from '@repo/ui/components';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function EmptyCart() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-center">
        <h1 className="mb-4 font-bold text-2xl text-foreground">
          Your cart is empty
        </h1>
        <p className="mb-8 text-muted-foreground">
          Add some items to your cart to continue checkout
        </p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>
    </div>
  );
}
