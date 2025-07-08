import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Button } from '@repo/design-system/components';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { OrdersList } from './components/orders-list';
import { OrdersStats } from './components/orders-stats';
import { OrdersListSkeleton, OrdersStatsSkeleton } from './components/orders-loading';

const title = 'My Orders';
const description = 'Track your orders and purchases';

export const metadata: Metadata = {
  title,
  description,
};

const MyOrdersPage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get database user with just ID for performance  
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true }
  });

  if (!dbUser) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-6">
      {/* Header - renders immediately */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">
            Track your purchases and order history
          </p>
        </div>
        <Button asChild>
          <a href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'} target="_blank" rel="noopener noreferrer">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Continue Shopping
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </div>

      {/* Orders List - streams progressively */}
      <Suspense fallback={<OrdersListSkeleton />}>
        <OrdersList userId={dbUser.id} />
      </Suspense>

      {/* Order Summary Stats - streams independently */}
      <Suspense fallback={<OrdersStatsSkeleton />}>
        <OrdersStats userId={dbUser.id} />
      </Suspense>
    </div>
  );
};

export default MyOrdersPage;