import { currentUser } from '@repo/auth/server';
import { cache } from '@repo/database';
import { database } from '@repo/database';
import { Button } from '@repo/ui/components';
import { getDictionary } from '@repo/content/internationalization';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { z } from 'zod';
import { OrdersList } from './components/orders-list';
import {
  OrdersListSkeleton,
  OrdersStatsSkeleton,
} from './components/orders-loading';
import { OrdersStats } from './components/orders-stats';

const paramsSchema = z.object({
  locale: z.string().min(1),
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const validatedParams = paramsSchema.parse(await params);
  const dictionary = await getDictionary(validatedParams.locale);

  return {
    title: dictionary.dashboard.metadata.orders.title,
    description: dictionary.dashboard.metadata.orders.description,
  };
}

const MyOrdersPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
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
        select: { id: true },
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
          <h1 className="font-bold text-2xl">
            {dictionary.dashboard.orders.myOrders}
          </h1>
          <p className="text-muted-foreground text-sm">
            {dictionary.dashboard.orders.trackOrders}
          </p>
        </div>
        <Button asChild size="sm">
          <a
            href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ShoppingCart className="mr-1.5 h-4 w-4" />
            Shop
            <ExternalLink className="ml-1 h-3 w-3" />
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
