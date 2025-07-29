import { getCacheService } from '@repo/cache';
import { database } from '@repo/database';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import { cn } from '@repo/ui/lib/utils';
import type { Dictionary } from '@repo/internationalization';
import { decimalToNumber } from '@repo/utils';
import { Package, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';

interface ActivePurchasesProps {
  userId: string;
  dictionary: Dictionary;
}

interface Purchase {
  id: string;
  status: string;
  createdAt: Date;
  amount: number;
  product: {
    id: string;
    title: string;
    price: number;
    images: {
      imageUrl: string;
      displayOrder: number;
    }[];
  };
}

async function getActivePurchases(userId: string): Promise<Purchase[]> {
  const cache = getCacheService();
  const cacheKey = `dashboard:active-purchases:${userId}`;

  return await cache.remember(
    cacheKey,
    async () => {
      const orders = await database.order.findMany({
        where: {
          buyerId: userId,
          status: {
            in: ['PENDING', 'SHIPPED'],
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          status: true,
          createdAt: true,
          amount: true,
          Product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: {
                select: {
                  imageUrl: true,
                  displayOrder: true,
                },
                orderBy: { displayOrder: 'asc' },
                take: 1,
              },
            },
          },
        },
      });

      return orders.map((order) => ({
        ...order,
        amount: Number(order.amount),
        product: {
          ...order.Product,
          price: Number(order.Product.price),
        },
      }));
    },
    300
  );
}

export async function ActivePurchases({
  userId,
  dictionary,
}: ActivePurchasesProps) {
  const purchases = await getActivePurchases(userId);

  if (purchases.length === 0) {
    return (
      <ErrorBoundary>
        <Card className="overflow-hidden border-border bg-background">
          <CardHeader className="border-border border-b px-4 pb-3">
            <CardTitle className="font-medium text-base text-foreground">
              Your Active Purchases
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-8 pb-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-secondary p-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="max-w-sm space-y-2">
                <h3 className="font-medium text-base text-foreground">
                  No active purchases
                </h3>
                <p className="text-muted-foreground text-sm">
                  Browse our collection and find something you love
                </p>
              </div>
              <Link className="w-full sm:w-auto" href="/products">
                <Button className="w-full sm:w-auto">Browse products</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'PROCESSING':
        return 'text-blue-600 dark:text-blue-400';
      case 'SHIPPED':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'PROCESSING':
        return 'Processing';
      case 'SHIPPED':
        return 'Shipped';
      default:
        return status;
    }
  };

  return (
    <ErrorBoundary>
      <Card className="overflow-hidden border-border bg-background">
        <CardHeader className="flex flex-row items-center justify-between border-border border-b px-4 pb-3">
          <CardTitle className="font-medium text-base text-foreground">
            Your Active Purchases
          </CardTitle>
          <div className="flex items-center gap-2">
            <Link
              className="text-muted-foreground text-xs transition-colors hover:text-foreground"
              href="/buying/orders"
            >
              View all
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4">
            {purchases.map((purchase) => (
              <Link
                className="no-touch-target block flex-shrink-0"
                href={`/buying/orders/${purchase.id}`}
                key={purchase.id}
              >
                <div className="w-32 space-y-1.5 sm:w-36">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
                    {purchase.product.images[0] ? (
                      <Image
                        alt={purchase.product.title}
                        className="object-cover"
                        fill
                        sizes="144px"
                        src={purchase.product.images[0].imageUrl}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-1.5 left-1.5">
                      <div
                        className={cn(
                          'rounded px-1.5 py-0.5 font-medium text-[10px] text-background',
                          purchase.status === 'PENDING' && 'bg-yellow-600',
                          purchase.status === 'SHIPPED' && 'bg-green-600'
                        )}
                      >
                        {getStatusLabel(purchase.status)}
                      </div>
                    </div>
                    <div className="absolute top-1.5 right-1.5">
                      <div className="rounded bg-foreground/80 px-1.5 py-0.5 font-semibold text-background text-xs">
                        ${decimalToNumber(purchase.amount)}
                      </div>
                    </div>
                  </div>
                  <div className="px-0.5">
                    <p className="truncate font-medium text-foreground text-xs">
                      {purchase.product.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(purchase.createdAt).toLocaleDateString(
                        undefined,
                        { month: 'short', day: 'numeric' }
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}
