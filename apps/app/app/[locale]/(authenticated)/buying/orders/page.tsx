import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { cache } from '@repo/cache';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Button } from '@repo/design-system/components';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { OrdersList } from './components/orders-list';
import { OrdersStats } from './components/orders-stats';
import { OrdersListSkeleton, OrdersStatsSkeleton } from './components/orders-loading';
import { getDictionary } from '@repo/internationalization';
import { z } from 'zod';

const paramsSchema = z.object({
  locale: z.string().min(1)
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const validatedParams = paramsSchema.parse(await params);
  const dictionary = await getDictionary(validatedParams.locale);
  
  return {
    title: dictionary.dashboard.metadata.orders.title,
    description: dictionary.dashboard.metadata.orders.description,
  };
}

const MyOrdersPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const validatedParams = paramsSchema.parse(await params);
  const dictionary = await getDictionary(validatedParams.locale);
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const dbUser = await cache.remember(
    `user_profile:${user.id}`,
    async () => {
      return database.user.findUnique({
        where: { clerkId: user.id },
        select: { id: true }
      });
    },
    cache.TTL.MEDIUM
  );

  if (!dbUser) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-4">
      {/* Header - renders immediately */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{dictionary.dashboard.orders.myOrders}</h1>
          <p className="text-sm text-muted-foreground">
            {dictionary.dashboard.orders.trackOrders}
          </p>
        </div>
        <Button size="sm" asChild>
          <a href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'} target="_blank" rel="noopener noreferrer">
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Shop
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