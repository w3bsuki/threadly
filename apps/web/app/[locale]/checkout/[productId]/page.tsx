import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SingleProductCheckout } from './components/single-product-checkout';

export const metadata: Metadata = {
  title: 'Checkout - Threadly',
  description: 'Complete your purchase securely',
};

interface CheckoutPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { productId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get database user
  const user = await database.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    redirect('/sign-in');
  }

  // Get product details
  const product = await database.product.findUnique({
    where: {
      id: productId,
      status: 'AVAILABLE',
    },
    include: {
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          stripeAccountId: true,
        },
      },
      images: {
        orderBy: { displayOrder: 'asc' },
        take: 1,
      },
      category: true,
    },
  });

  if (!product) {
    redirect('/browse');
  }

  // Don't allow buying own products
  if (product.sellerId === user.id) {
    redirect(`/product/${product.id}`);
  }

  // Get user's most recent address if any
  const lastOrder = await database.order.findFirst({
    where: { buyerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      shippingAddress: true,
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-foreground">
              Complete Your Purchase
            </h1>
            <p className="mt-2 text-muted-foreground">
              Secure checkout powered by Stripe
            </p>
          </div>

          <SingleProductCheckout
            product={product}
            savedAddress={lastOrder?.shippingAddress || null}
            user={user}
          />
        </div>
      </div>
    </div>
  );
}
