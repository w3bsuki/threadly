import { database } from '@repo/database';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SuccessContent } from './components/success-content';

export const metadata: Metadata = {
  title: 'Order Confirmed - Threadly',
  description: 'Your order has been successfully placed',
};

interface SuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
    session_id?: string;
  }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId, session_id } = await searchParams;

  if (!(orderId || session_id)) {
    redirect('/');
  }

  // Fetch order by ID or by Stripe payment ID through payment relation
  const order = await database.order.findFirst({
    where: orderId
      ? { id: orderId }
      : session_id
        ? { Payment: { stripePaymentId: session_id } }
        : undefined,
    include: {
      Product: {
        include: {
          images: {
            take: 1,
            orderBy: { displayOrder: 'asc' },
          },
        },
      },
      buyer: true,
      seller: true,
    },
  });

  if (!order) {
    redirect('/');
  }

  // Prepare order data with required fields
  const orderData = {
    ...order,
    orderNumber: `ORD-${order.id.slice(-8).toUpperCase()}`,
    totalAmount: order.amount,
    product: order.Product,
    buyer: order.buyer,
    seller: order.seller,
  };

  return (
    <div className="min-h-screen bg-muted">
      <SuccessContent order={orderData} />
    </div>
  );
}
